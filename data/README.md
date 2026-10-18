# Config Selector data

`configselector.csv` is the device list the WuWa Config Patcher app reads at runtime to decide
which preset suits a phone. **Editing this file changes what the app recommends. No app update is
needed.**

## Format

Three comma separated columns, one header row, one row per device group:

```
Phone (Examples),CPU / GPU,Config to Use
Galaxy S25 Ultra / Xiaomi 15,Snapdragon 8 Elite / Adreno 830,Stable Config - A / (High Visuals)
```

| Column | Notes |
|---|---|
| Phone (Examples) | Marketing names, separated by ` / `. These are matched against the device name. |
| CPU / GPU | Chipset and GPU. Matched when the phone name does not hit, so spell them as the device reports them, for example `Adreno 830`, `Mali-G715`, `Dimensity 9300`. |
| Config to Use | The recommendation text. The app reads a tier out of this, so keep the wording below. |

## Wording the app understands

The last column is matched case insensitively, and dash punctuation does not matter: `Config - A`,
`Config – A` and `Config-A` all read the same.

| Text contains | Tier the app assigns |
|---|---|
| `Config - A` and `Experimental` | Flagship |
| `Config - A` | High end |
| `Config - B` | Mid end |
| `Config - C` | Low end |
| `Potato` (without `Config - C`) | Potato |
| `Do not support` | No recommendation for that device |

Anything else leaves the row without a tier, and the app falls back to estimating from the
hardware, so a typo here is not fatal but it does lose the curated answer.

## Why scores and not just tiers

Tiers are five buckets, so two configs that both land in `MID` cannot be ordered against each
other. The app has always measured a device as a number from 0 to 100; scoring the configs the same
way means a device at 42 and one at 58 get genuinely different answers, and a new community config
can slot between two existing ones without anybody inventing a sixth tier.

| Score | Tier |
|---|---|
| 0 to 19 | Potato |
| 20 to 39 | Low end |
| 40 to 59 | Mid end |
| 60 to 79 | High end |
| 80 to 100 | Flagship |

Set `idealScore` to roughly the device you built the config for, and `minScore` to the weakest
device you would still be comfortable recommending it to.

## How the app reads it

1. It fetches this file on each launch when the device is online.
2. If the fetch fails, it uses the copy bundled inside the app, which may be older.
3. The read is size capped, so keep the file to a sensible size.

Rows are only ever displayed and matched against, never executed.

---

# Config catalogue

`configcatalog.json` is the list of configs the Config Selector can recommend. **Adding an entry
here makes it appear in the app. No app update is needed.**

```json
{
  "key": "someones_config",
  "name": "Someone's Config",
  "minimumTier": "MID",
  "idealTier": "HIGH",
  "blurb": "One line shown under the name in the selector.",
  "match": ["someones", "somecfg"]
}
```

| Field | Meaning |
|---|---|
| `key` | Stable internal id. Pick something short and never reuse it for a different config. |
| `name` | Shown in the selector. Match the folder name in the config repository so people recognise it. |
| `minScore` | The weakest device score this is safe on, 0 to 100. A device scoring below this never sees it. |
| `idealScore` | The device score this was tuned for, 0 to 100. Drives the ordering, so the closest fit lands at the top. |
| `minimumTier` / `idealTier` | The same two values as words, for people reading the file. Generated from the scores. An app build that does not understand scores falls back to these. |
| `blurb` | One line of description. Optional. |
| `match` | Lowercase fragments used to find the config's folder in the synced repository. Optional; the `key` is used when omitted. |

## How the app reads it

1. It fetches this file each time the selector opens.
2. If the fetch fails, or the file parses to fewer than three configs, it keeps the catalogue built
   into the app. A truncated file never leaves the selector with nothing to offer.
3. One malformed entry is skipped; the rest of the file still loads.

## Matching

`match` fragments are checked against the preset's folder name and the two folders above it, and
the closest match wins. So a config at `Community Configs/Someones Config/Vulkan` is found by
`someones`, and listing several subfolders under one config makes them appear as versions to choose
between rather than as separate configs.

Keep the fragments distinctive. A fragment like `config` matches almost everything and will steal
presets from other entries.

## Keeping the fallback in step

The copy built into the app is the offline fallback. Regenerate it after changing the app's own
catalogue:

```bash
python tools/generate_config_catalog.py
```

Editing only this published file is fine and is the normal way to add a community config; the
fallback simply will not know about it offline.
