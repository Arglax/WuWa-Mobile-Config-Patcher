/**
 * WuWa Mobile Config Patcher — Official Web Engine
 * Source of Truth Reference: v1.5.0-unreleased-arglax-beta
 */

// 1. Comprehensive Knowledge Base for All App Functions
const featureDatabase = {
  "1-click-patching": {
    title: "1-Click Config Patching",
    pageUrl: "pages/patching-configs.html",
    simple: `
      <h4>How to 1-Tap Patch Your Game:</h4>
      <ol class="step-list">
        <li>Open <strong>Shizuku</strong> and ensure it is running (Wireless Debugging or Root).</li>
        <li>Open WuWa Config Patcher and select your desired preset (e.g. <em>Performance</em>, <em>Balanced</em>, <em>Mythos Overdrive</em>).</li>
        <li>Tap the prominent <strong>"1-Click Patch"</strong> button. The app backs up your existing config and applies the new one in under a second.</li>
        <li>Tap <strong>"Launch Game"</strong> to start Wuthering Waves with optimized graphics!</li>
      </ol>
      <div class="alert alert-tip">
        <div class="alert-title">WANT TO REVERT?</div>
        Go to <strong>Utilities &gt; Vanilla mode</strong> and tap <em>"Revert to Vanilla"</em> anytime to safely restore game defaults.
      </div>
    `,
    technical: `
      <h4>Technical IPC & Storage Architecture:</h4>
      <ul>
        <li><strong>Destination:</strong> <code>/Android/data/com.kurogame.wutheringwaves.global/files/UE4Game/Client/Client/Saved/Config/Android/</code></li>
        <li><strong>Shizuku Elevation:</strong> Bypasses Android 11+ Scoped Storage restrictions using <code>IActivityManager</code> / <code>IFileSystem</code> binder transactions (<code>ShizukuManager.applyAllIniFiles</code>).</li>
        <li><strong>Automatic Safety Snapshots:</strong> Invokes <code>MainStorageManager.kt</code> to generate timestamped MD5-validated backups in <code>context.filesDir/app_main_storage/backups/</code> prior to writing.</li>
        <li><strong>Per-File Granularity:</strong> Tapping the <strong>Gear Icon (⚙️)</strong> opens <code>AdvancedPatchDialog.kt</code> to selectively patch individual files (e.g., updating <code>Engine.ini</code> while preserving custom <code>DeviceProfiles.ini</code>).</li>
      </ul>
    `
  },
  "live-config-editor": {
    title: "Live Config Editor (Smart, Text, One-Line)",
    pageUrl: "pages/config-editor.html",
    simple: `
      <h4>How to Customize Settings:</h4>
      <ol class="step-list">
        <li>Select the <strong>Editor Tab</strong> at the bottom of the app.</li>
        <li>Choose your target file from the top dropdown (<code>Engine.ini</code> or <code>DeviceProfiles.ini</code>).</li>
        <li>Use <strong>Smart Mode</strong> to adjust values visually, or <strong>One-Line Mode</strong> to paste a single command.</li>
        <li>Tap <strong>Save</strong>. If you misplaced a setting, the app will offer to <em>Auto-Fix</em> it automatically.</li>
      </ol>
    `,
    technical: `
      <h4>Editor Modes & State Management:</h4>
      <ul>
        <li><strong>Smart Mode:</strong> Parses INI sections into an interactive AST. Features <strong>Sort A-Z</strong> (<code>sortSmartSectionsAlphabetically()</code>), <strong>Auto-Categorize</strong>, and Multi-Select bulk deletion.</li>
        <li><strong>Text Mode:</strong> Raw syntax-highlighted editor with line numbers, cursor brush, font scaling (8sp–24sp), and <strong>Isolation Search Mode</strong> to isolate matching lines.</li>
        <li><strong>One-Line Mode:</strong> Quick insertion buffer with dynamic section dropdown and live validation preview.</li>
        <li><strong>Memory Caching:</strong> INI contents are cached in-memory for instant 0ms switching across tabs.</li>
      </ul>
    `
  },
  "engine-section-guards": {
    title: "Engine CVar Section Guards & Enforcement",
    pageUrl: "pages/config-editor.html#cvar-guards",
    simple: `
      <h4>Why Section Guards Matter:</h4>
      <p>In Unreal Engine, graphic commands placed under the wrong header are silently ignored by the game. Section Guards ensure every command is under its correct section so your custom settings actually take effect.</p>
      <div class="alert alert-important">
        <div class="alert-title">RED HIGHLIGHTING</div>
        Misplaced commands are highlighted in bright red. Tap <strong>Auto-Fix</strong> to organize them into the proper sections with 1 click.
      </div>
    `,
    technical: `
      <h4>Canonical Placement Matrix (<code>CVarSectionGuard.kt</code>):</h4>
      <ul>
        <li><code>[/Script/Engine.RendererSettings]</code>: Accepts all <code>r.</code> variables (except <code>r.SupportAllShaderPermutations</code>).</li>
        <li><code>[/Script/Engine.RendererOverrideSettings]</code>: Whitelisted container for <code>r.SupportAllShaderPermutations</code>, <code>r.</code>, and <code>dp.</code> commands.</li>
        <li><code>[/Script/Engine.StreamingSettings]</code>: Validates <code>s.</code> texture streaming parameters.</li>
        <li><code>[/Script/Engine.GarbageCollectionSettings]</code>: Validates <code>gc.</code> memory cleanup variables.</li>
        <li><code>[/Script/Engine.NetworkSettings]</code>: Enforces <code>n.VerifyPeer</code> and multiplayer origin flags.</li>
        <li><code>[/Script/UnrealEd.CookerSettings]</code>: Validates <code>cook.</code> directives.</li>
        <li><code>[SystemSettings]</code> &amp; <code>[ConsoleVariables]</code>: Universal root containers accepting any CVar.</li>
        <li><strong>Protected Headers:</strong> <code>[Core.Paths]</code>, <code>[Core.System]</code>, and <code>[/Script/Engine.RendererOverrideSettings]</code> are <strong>strictly whitelisted</strong> and never altered or moved during Auto-Fix.</li>
      </ul>
    `
  },
  "force-csharp": {
    title: "Force C# Environment (Misc Patch)",
    pageUrl: "pages/enable-csharp.html",
    simple: `
      <h4>Boosting Combat & Script Performance:</h4>
      <p>Wuthering Waves uses a C# scripting layer for game logic. Forcing the C# environment reduces combat micro-stutters and garbage collection frame drops.</p>
      <ol class="step-list">
        <li>Go to <strong>Editor &gt; Misc Patch</strong>.</li>
        <li>Check <strong>"-ForceEnableCSharpEnvironment"</strong> and <strong>"-SkipSplash"</strong>.</li>
        <li>Tap <strong>Apply Launch Flags</strong>.</li>
      </ol>
    `,
    technical: `
      <h4>Low-Level Engine Hook:</h4>
      <ul>
        <li><strong>File Target:</strong> <code>/storage/emulated/0/Android/data/&lt;package&gt;/files/UE4Game/Client/UE4CommandLine.txt</code></li>
        <li><strong>Injected Arguments:</strong> <code>-ForceEnableCSharpEnvironment -usehyperthreading</code></li>
        <li><strong>Runtime Impact:</strong> Reconfigures the Puerts/C# runtime bridge to allocate dedicated thread pools on ARM64 architectures, reducing GC hitches during intense particle/combat scenes.</li>
      </ul>
    `
  },
  "log-tools": {
    title: "Log Tools & Offline AES/XOR Decryptor",
    pageUrl: "pages/utilities-diagnostics.html",
    simple: `
      <h4>Diagnosing Crashes & Performance:</h4>
      <p>If your game crashes, freezes, or fails to launch, you can read the encrypted game log directly inside the app.</p>
      <ol class="step-list">
        <li>Go to <strong>Utilities &gt; Common &gt; Log Tools</strong>.</li>
        <li>Tap <strong>"Decrypt Log"</strong> to convert the raw file into human-readable text.</li>
        <li>Tap <strong>"Get Device Info"</strong> to see your GPU model, RAM, and game-calculated Device Score.</li>
      </ol>
    `,
    technical: `
      <h4>Decryption Pipeline & Diagnostic Extraction:</h4>
      <ul>
        <li><strong>Target Log:</strong> <code>.../Saved/Logs/Client.log</code></li>
        <li><strong>Decryption Schemes:</strong> <code>LogDecryptor.kt</code> automatically attempts <strong>Scheme A</strong> (XOR <code>0xA5/0xEF</code>), <strong>Scheme B</strong> (XOR <code>0x55</code>), and fallback plaintext detection.</li>
        <li><strong>Device Stats:</strong> <code>DeviceStatsCollector.kt</code> parses GPU vendor, Vulkan API driver version, CPU core layout, and memory benchmarks.</li>
        <li><strong>Filter Chips:</strong> Built-in line explorer with one-tap filtering for <code>LogConfig</code>, <code>GameThread</code>, <code>Sharphereal</code>, <code>LogInit</code>, <code>LogTemp</code>, <code>Vulkan</code>, and <code>RHI</code>.</li>
      </ul>
    `
  },
  "cvar-bank": {
    title: "CVar Bank & Engine Analyzer",
    pageUrl: "pages/utilities-diagnostics.html#cvar-bank",
    simple: `
      <h4>Encyclopedia for Tweakers:</h4>
      <p>The CVar Bank contains over 1,000 graphics commands with plain-English descriptions, performance ratings, and safe preset values so you can build your own configs.</p>
    `,
    technical: `
      <h4>Database & CVar Analyzer Mechanics:</h4>
      <ul>
        <li><strong>CVar Analyzer (<code>CVarAnalyzer.kt</code>):</strong> Cross-references active INI lines against the end of <code>Client.log</code> to calculate applied %, failed %, and deleted/unrecognized CVar metrics.</li>
        <li><strong>Frozen Column Viewer:</strong> Displays a 5-column table with a frozen left CVar column and scrollable Section, User Value, Log Value, and Status columns.</li>
        <li><strong>Live Integration:</strong> Includes <em>"Send to Editor"</em> (inserts CVar into Smart Mode under its canonical header) and <em>"Extract Web CVars"</em> (parses raw text/web pages to import new CVars).</li>
      </ul>
    `
  }
};

// 2. Comprehensive Search Index
const searchIndex = [
  { title: "Overview & Features", category: "Getting Started", url: "index.html#overview", keywords: "overview features introduction capabilities about" },
  { title: "Prerequisites & Elevated Access (Shizuku/Root/Axeron)", category: "Setup", url: "pages/setup-shizuku.html", keywords: "shizuku wireless debugging root axeron adb permission setup" },
  { title: "1-Click & Custom Config Patching", category: "Core Workflow", url: "pages/patching-configs.html", keywords: "patch apply config preset fps ultra performance 1-click shizuku" },
  { title: "Reverting to Vanilla Defaults", category: "Core Workflow", url: "pages/patching-configs.html#revert", keywords: "revert restore reset vanilla default clean undo backup" },
  { title: "Live Config Editor (Smart, Text, One-Line)", category: "Core Workflow", url: "pages/config-editor.html", keywords: "editor ini modify text smart mode one line syntax sort undo" },
  { title: "Engine CVar Section Guards & Auto-Fix", category: "Creator Tools", url: "pages/config-editor.html#cvar-guards", keywords: "section guard auto-fix systemsettings renderersettings rules validation red" },
  { title: "Enabling C# Environment (-ForceEnableCSharpEnvironment)", category: "Core Workflow", url: "pages/enable-csharp.html", keywords: "c# csharp environment uecommandline flags performance skipsplash" },
  { title: "Log Tools & Offline AES/XOR Decryptor", category: "Diagnostics", url: "pages/utilities-diagnostics.html", keywords: "log decrypt decryptor client.log crash analysis gpu device info" },
  { title: "CVar Analyzer & Engine Verification", category: "Creator Tools", url: "pages/utilities-diagnostics.html#cvar-analyzer", keywords: "analyzer verification cvar report applied failed deleted" },
  { title: "CVar Bank Reference (1000+ Unreal CVars)", category: "Creator Tools", url: "pages/utilities-diagnostics.html#cvar-bank", keywords: "cvar bank console variables rendering database alteriax pastebin" },
  { title: "Manual Mode Guide (Old School File Explorer)", category: "Guides", url: "pages/manual-method.html", keywords: "manual no shizuku zarchiver fv file explorer android 11 12 13 14" },
  { title: "Support, Donations & Activity Logger", category: "Support", url: "pages/bug-reporting.html", keywords: "bug report discord github gcash donation activity_log.txt" }
];

document.addEventListener("DOMContentLoaded", () => {
  initFeatureModals();
  initSearchEngine();
  initSidebarHighlight();
});

// 3. Modal Popup Logic
function initFeatureModals() {
  const modal = document.getElementById("feature-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalTitle = document.getElementById("modal-title");
  const modalPageLink = document.getElementById("modal-page-link");
  const simplePane = document.getElementById("tab-content-simple");
  const technicalPane = document.getElementById("tab-content-technical");
  const tabs = document.querySelectorAll(".modal-tab");

  if (!modal) return;

  // Open modal on card click
  document.querySelectorAll(".clickable-card").forEach(card => {
    card.addEventListener("click", () => {
      const featureKey = card.getAttribute("data-feature");
      const data = featureDatabase[featureKey];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalPageLink.href = data.pageUrl;
      simplePane.innerHTML = data.simple;
      technicalPane.innerHTML = data.technical;

      // Default to Simple tab
      tabs.forEach(t => t.classList.remove("active"));
      tabs[0].classList.add("active");
      simplePane.classList.remove("hidden");
      technicalPane.classList.add("hidden");

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  // Modal Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.getAttribute("data-tab");
      if (target === "simple") {
        simplePane.classList.remove("hidden");
        technicalPane.classList.add("hidden");
      } else {
        simplePane.classList.add("hidden");
        technicalPane.classList.remove("hidden");
      }
    });
  });

  // Close handlers
  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

// 4. Client-side Search Engine
function initSearchEngine() {
  const searchInput = document.getElementById("doc-search");
  const dropdown = document.getElementById("search-results-dropdown");

  if (!searchInput || !dropdown) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      return;
    }

    const matches = searchIndex.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="search-no-results">No documentation matching "<strong>${escapeHtml(query)}</strong>"</div>`;
    } else {
      dropdown.innerHTML = matches.map(item => `
        <a href="${item.url}" class="search-result-item">
          <span class="search-result-title">${escapeHtml(item.title)}</span>
          <span class="search-result-cat">${escapeHtml(item.category)}</span>
        </a>
      `).join("");
    }

    dropdown.classList.remove("hidden");
  });

  // Close on click outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
}

// 5. Sidebar Active State Tracking
function initSidebarHighlight() {
  const navLinks = document.querySelectorAll(".sidebar .nav-link");
  const sections = document.querySelectorAll(".doc-section");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href === `#${current}` || (current === "" && href === "#overview")) {
        link.classList.add("active");
      } else if (href.startsWith("#")) {
        link.classList.remove("active");
      }
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}