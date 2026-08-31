Since the mobile config patcher app has become a powerful tool to patch, edit, and analyze configs, it now requires an official and proper documentation.

# WuWa Config Patcher — Official Documentation

The official documentation repository for **WuWa Config Patcher** (`io.github.arglax.configpatcher`), an advanced Android application designed to grant mobile players 1-click graphics patching, live INI editing, CVar section enforcement, and deep engine diagnostics for *Wuthering Waves*[cite: 1, 2]. 

Developed by Arglax, this static site is built with responsive HTML, CSS, and vanilla JavaScript, optimized for deployment via GitHub Pages.

## 🔗 Live Site
**[Insert your GitHub Pages URL here, e.g., https://arglax.github.io/wuwa-config-patcher-docs]**

## Documented Features
This documentation covers the authoritative technical mechanics of the application, including:
* **Elevated File Routing:** Bypassing strict Android 11+ scoped storage using Shizuku (Wireless Debugging), Root, or AXManager backends[cite: 1].
* **Live Config Editor:** Smart, Text, and One-Line editing modes for `Engine.ini` and `DeviceProfiles.ini`[cite: 1, 2].
* **CVar Section Guards:** Rulesets that validate and auto-fix Unreal Engine Console Variables into their canonical headers to prevent engine overrides[cite: 1].
* **C# Environment Injection:** Pushing `-ForceEnableCSharpEnvironment` into the `UE4CommandLine.txt` file[cite: 1].
* **Log Diagnostics:** Tools for decrypting obfuscated `Client.log` files (Scheme A/B) and extracting device hardware metrics[cite: 1].

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