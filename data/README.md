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

## How the app reads it

1. It fetches this file on each launch when the device is online.
2. If the fetch fails, it uses the copy bundled inside the app, which may be older.
3. The read is size capped, so keep the file to a sensible size.

Rows are only ever displayed and matched against, never executed.
