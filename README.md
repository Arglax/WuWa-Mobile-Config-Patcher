Since the mobile config patcher app has become a powerful tool to patch, edit, and analyze configs, it now requires an official and proper documentation.

Anyways I don't have a lot of time right now so expect some stupid ai placeholders while I'm manually populating stuff.


# WuWa Config Patcher — Official Documentation

The official documentation repository for **WuWa Config Patcher** (`io.github.arglax.configpatcher`), an advanced Android application designed to grant mobile players 1-click graphics patching, live INI editing, CVar section enforcement, and deep engine diagnostics for *Wuthering Waves*.
<a href="https://discord.gg/renjxYBEZM"><img src="https://img.shields.io/badge/Discord-7289DA?logo=discord&logoColor=white&style=plastic" height="40"></a>

>[!CAUTION]
> DISCLAIMER: I, Arglax, am not in any way affiliated with Kuro Games nor Epic Games.  

## Latest Release
You can download the latest version [here](https://github.com/Arglax/WuWa-Mobile-Config-Patcher/releases/latest).

## Official Documentation in GitHub Pages
You can check the **[documentation here.](https://arglax.github.io/WuWa-Mobile-Config-Patcher/)**

## Documented Features
This documentation covers the authoritative technical mechanics of the application, including:
* **Elevated File Routing:** Bypassing strict Android 11+ scoped storage using Shizuku (Wireless Debugging), Root, or AXManager permissions.
* **Live Config Editor:** Smart, Text, and One-Line editing modes for `Engine.ini` and `DeviceProfiles.ini`.
* **CVar Section Guards:** Rulesets that validate and auto-fix Unreal Engine Console Variables into their canonical headers to prevent engine overrides.
* **C# Environment Injection:** Pushing `-ForceEnableCSharpEnvironment` into the `UE4CommandLine.txt` file.
* **Log Diagnostics:** Tools for decrypting `Client.log` files (Scheme A/B) and extracting device hardware metrics.
* **How To Use the App** A guide how to use the different functions of the application.

## Repository Structure
```text
├── index.html                  # Main documentation landing page
├── 404.html                    # GitHub Pages error fallback
├── css/
│   └── style.css               # Combined stylesheet (Dark Gaming Theme + Modal UI)
├── js/
│   └── main.js                 # Interactive search and technical modal logic
├── images/
│   └── logo.png                # Application icon
└── pages/                      # Detailed instructional sub-pages
    ├── manual-method.html
    ├── patching-configs.html
    ├── setup-shizuku.html
    ├── utilities-diagnostics.html
    ├── bug-reporting.html
    ├── config-editor.html
    ├── enable-csharp.html
    └── troubleshooting.html
