/**
 * WuWa Mobile Config Patcher - Interactive Feature Cards & Dual-Tab Modal Engine
 * Supports tab switching: End-User Quick Steps vs. Technical & Creator Mechanics.
 * Integrated with WuWaI18n localization.
 */
(function (window) {
  'use strict';

  function t(key, fallback) {
    return (window.WuWaI18n && window.WuWaI18n.t) ? window.WuWaI18n.t(key, fallback) : fallback;
  }

  const FEATURE_DETAILS = {
    '1-click-patching': {
      titleKey: 'card_1click_title',
      title: '1-Click Patching Workflow',
      route: 'pages/patching-configs.html',
      casual: `
        <div class="modal-section-block">
          <h4>⚡ How End-Users Use 1-Click Patching</h4>
          <ol class="step-list">
            <li>Open the <strong>Config</strong> tab in WuWa Config Patcher.</li>
            <li>Select your <strong>Repository Source</strong> (default: <code>Arglax (Default)</code>).</li>
            <li>Tap <strong>Sync Files & Refresh</strong> to fetch available presets.</li>
            <li>Select a preset from the dropdown (e.g., <em>Snapdragon 8 Gen 3 - Extreme</em>).</li>
            <li>Tap <strong>1-Click Patch</strong>. The app creates a backup and injects all INI files into Wuthering Waves.</li>
            <li>Tap <strong>Launch Game</strong> to play!</li>
          </ol>
          <div class="alert alert-tip">
            <div class="alert-title">💡 PER-FILE PATCHING</div>
            Tap the <strong>Gear Icon (⚙️)</strong> beside 1-Click Patch to select individual files (e.g. patching only <code>Engine.ini</code> while preserving <code>DeviceProfiles.ini</code>).
          </div>
        </div>
      `,
      technical: `
        <div class="modal-section-block">
          <h4>🛠️ Technical Architecture & IPC Pipeline</h4>
          <ul>
            <li><strong>Repository Source Handler:</strong> <code>Arglax (Default)</code> connects to GitHub API (<code>GitHubApi.kt</code>) to fetch <code>custom-metadata.txt</code> and preset ZIP archives.</li>
            <li><strong>Archive Processing:</strong> Archives are extracted via <code>ZipExtractor.kt</code> into <code>context.cacheDir/repo_cache/</code>. Directories are recursively scanned using <code>ConfigScanner.kt</code> and <code>ConfigNode.kt</code> (using <code>folder.walkTopDown()</code> for deep subfolder discovery).</li>
            <li><strong>Automated Backup:</strong> Before writing, <code>MainStorageManager.kt</code> creates a live timestamped backup snapshot in <code>context.filesDir/app_main_storage/backups/</code>.</li>
            <li><strong>Elevated File Write:</strong> Files (<code>Engine.ini</code>, <code>DeviceProfiles.ini</code>, <code>Scalability.ini</code>) are pushed directly to <code>.../Saved/Config/Android/</code> using elevated <code>ShizukuManager.applyAllIniFiles</code> (or native root <code>libsu</code> <code>Shell.cmd</code>).</li>
          </ul>
        </div>
      `
    },

    'live-config-editor': {
      titleKey: 'card_editor_title',
      title: 'Live Config Editor & Modes',
      route: 'pages/config-editor.html',
      casual: `
        <div class="modal-section-block">
          <h4>🛠️ Three Tailored Editing Modes</h4>
          <ul>
            <li><strong>Smart Mode:</strong> Visual section cards with inline value adjusters, steppers, and full negative number support.</li>
            <li><strong>Text (Raw) Mode:</strong> Full manual syntax-highlighted editor with line numbers, Isolation Search Mode, font size controls (8sp-24sp), and Search & Replace.</li>
            <li><strong>One-Line Mode:</strong> Key-value dropdown editor for rapid single CVar adjustments with a live buffer preview card.</li>
          </ul>
          <div class="alert alert-tip">
            <div class="alert-title">💡 A-Z SORT & AUTO-FIX</div>
            Use <strong>Sort A-Z</strong> in Smart Mode to organize CVars alphabetically, or <strong>Auto-Fix</strong> to re-categorize misplaced CVars into standard Unreal Engine headers automatically.
          </div>
        </div>
      `,
      technical: `
        <div class="modal-section-block">
          <h4>🛠️ Memory Caching & Editor Mechanics</h4>
          <ul>
            <li><strong>File Loading & IPC Read:</strong> Reads <code>Engine.ini</code>, <code>DeviceProfiles.ini</code>, or <code>GameUserSettings.ini</code> off device via <code>ShizukuManager.readLogFile()</code>. Cached in memory for 0ms tab switching.</li>
            <li><strong>A-Z Sorting Engine:</strong> <code>sortSmartSectionsAlphabetically()</code> re-arranges key-value pairs inside each section block alphabetically by key name.</li>
            <li><strong>Isolation Mode:</strong> Filters raw text buffers dynamically to render only lines containing matching search queries.</li>
            <li><strong>Persistent Snapshot History:</strong> Undo and redo stacks persist across app lifecycle sessions in editor memory.</li>
          </ul>
        </div>
      `
    },

    'engine-section-guards': {
      titleKey: 'card_guards_title',
      title: 'Engine CVar Section Guards',
      route: 'pages/config-editor.html#cvar-guards',
      casual: `
        <div class="modal-section-block">
          <h4>🛡️ Automated Section Placement Enforcement</h4>
          <p>Unreal Engine ignores misplaced CVars. The patcher auto-validates every line against canonical section rules:</p>
          <ul>
            <li><code>[/Script/Engine.RendererSettings]</code> — Accepts <code>r.</code> CVars.</li>
            <li><code>[/Script/Engine.StreamingSettings]</code> — Accepts <code>s.</code> CVars.</li>
            <li><code>[/Script/Engine.GarbageCollectionSettings]</code> — Accepts <code>gc.</code> CVars.</li>
            <li><code>[SystemSettings]</code> — Universal container accepting ANY CVar.</li>
          </ul>
          <div class="alert alert-important">
            <div class="alert-title">VIBRANT RED HIGHLIGHTING (#FF2222)</div>
            Misplaced lines are flagged in bold <strong style="color: #FF2222;">Vibrant Red</strong>. Saving opens a warning prompt with 1-tap <strong>Auto-Fix Sections</strong> remediation!
          </div>
        </div>
      `,
      technical: `
        <div class="modal-section-block">
          <h4>🛠️ CVarSectionGuard.kt Rule Engine</h4>
          <ul>
            <li><strong>Prefix & Pattern Rules:</strong>
              <br>• <code>r.</code> → <code>[/Script/Engine.RendererSettings]</code> (except <code>r.SupportAllShaderPermutations</code>).
              <br>• <code>s.</code> → <code>[/Script/Engine.StreamingSettings]</code>.
              <br>• <code>gc.</code> → <code>[/Script/Engine.GarbageCollectionSettings]</code>.
              <br>• <code>cook.</code> → <code>[/Script/UnrealEd.CookerSettings]</code>.
            </li>
            <li><strong>Engine.ini Prefix Stripping:</strong> Flags lines starting with <code>CVars=</code>, <code>+CVars=</code>, or <code>.CVars=</code> in Vibrant Red. Auto-Fix strips the prefix while retaining key and value.</li>
            <li><strong>DeviceProfiles.ini Format Enforcement:</strong> Formats CVars as <code>CVars=Key=Value</code> while preserving metadata profile pointers (<code>BaseProfileName</code>, <code>DeviceScore</code>).</li>
            <li><strong>Strict Whitelisting:</strong> <code>[Core.Paths]</code>, <code>[Core.System]</code>, and <code>[/Script/Engine.RendererOverrideSettings]</code> are strictly whitelisted and never altered by Auto-Fix.</li>
          </ul>
        </div>
      `
    },

    'force-csharp': {
      titleKey: 'card_csharp_title',
      title: 'Force C# Environment Scripting',
      route: 'pages/enable-csharp.html',
      casual: `
        <div class="modal-section-block">
          <h4>🚀 Performance Boosting Engine Flag</h4>
          <p>Kuro Games updated Wuthering Waves with a C# scripting environment pipeline. You can force-enable this flag to boost game script execution speed and reduce CPU bottlenecks.</p>
          <ol class="step-list">
            <li>Go to <strong>Editor</strong> tab → <strong>Misc Patch</strong>.</li>
            <li>Check <code>-ForceEnableCSharpEnvironment</code> (and optionally <code>-SkipSplash</code>).</li>
            <li>Tap <strong>Patch</strong> and launch the game.</li>
          </ol>
          <div class="alert alert-warning">
            <div class="alert-title">⚠️ RECOMMENDED RAM</div>
            Recommended for devices with at least <strong>8 GB RAM</strong>. Devices under 8 GB may encounter memory pressure.
          </div>
        </div>
      `,
      technical: `
        <div class="modal-section-block">
          <h4>🛠️ Launch Flags & Verification Mechanics</h4>
          <ul>
            <li><strong>Target File Injection:</strong> Pushes custom command-line flags directly to <code>.../files/UE4Game/Client/UE4CommandLine.txt</code> via elevated IPC.</li>
            <li><strong>In-Game Client Verification:</strong> Launch Wuthering Waves and inspect client version text. An <strong>asterisk (*)</strong> at the end of the version string confirms C# environment is active.</li>
            <li><strong>Log Verification:</strong> Decrypt <code>Client.log</code> in Utilities and search for <code>Sharphereal</code> initialization entries.</li>
          </ul>
        </div>
      `
    },

    'log-tools': {
      titleKey: 'card_logtools_title',
      title: 'Log Tools & Decryptor Suite',
      route: 'pages/utilities-diagnostics.html',
      casual: `
        <div class="modal-section-block">
          <h4>🔍 Decrypted Log Explorer & Hardware Scans</h4>
          <ul>
            <li><strong>Decrypted Log Explorer:</strong> Search through <code>Client.log</code> with line numbers and filter chips (<code>LogConfig</code>, <code>Vulkan</code>, <code>RHI</code>, <code>Sharphereal</code>).</li>
            <li><strong>Get Device Info:</strong> Scans real GPU model, physical RAM, CPU topology, and game-evaluated <strong>Device Score</strong>.</li>
            <li><strong>Log Cleanup:</strong> Delete oversized log files with 1 tap to reclaim internal storage.</li>
          </ul>
        </div>
      `,
      technical: `
        <div class="modal-section-block">
          <h4>🛠️ Decryption Algorithms & Device Collector</h4>
          <ul>
            <li><strong>LogDecryptor.kt Engine:</strong> Decrypts obfuscated logs using <strong>Scheme A</strong> (XOR <code>0xA5/0xEF</code>), <strong>Scheme B</strong> (XOR <code>0x55</code>), or plaintext fallback.</li>
            <li><strong>DeviceStatsCollector.kt:</strong> Parses decrypted log streams to extract GPU renderer string, Vulkan driver version, physical RAM, CPU cores, and <code>DeviceScore</code>.</li>
            <li><strong>Storage Cleanup:</strong> Executes elevated <code>rm -rf</code> on <code>.../Saved/Logs/</code> directory safely.</li>
          </ul>
        </div>
      `
    },

    'cvar-bank': {
      titleKey: 'card_cvarbank_title',
      title: 'CVar Bank & Diagnostic Tools',
      route: 'pages/advanced-tools.html',
      casual: `
        <div class="modal-section-block">
          <h4>📚 1000+ CVar Database & Integrity Tools</h4>
          <ul>
            <li><strong>CVar Bank:</strong> Search over 1000+ Unreal Engine and WuWa CVars with Card View vs Table View, source filtering, and 1-tap <em>Send to Editor</em>.</li>
            <li><strong>Analyze Config:</strong> Cross-checks live INIs against game logs to verify if CVars actually applied or were rejected.</li>
            <li><strong>Duplicate Flagger & Stripper:</strong> Clean duplicate lines and strip forbidden CVars with 1 tap.</li>
          </ul>
        </div>
      `,
      technical: `
        <div class="modal-section-block">
          <h4>🛠️ Technical Diagnostic & Analysis Engines</h4>
          <ul>
            <li><strong>CVarAnalyzer.kt:</strong> Cross-checks live INIs against <code>Client.log</code> (resolving the <em>latest instance</em> near log end). Computes Total CVars, Applied %, Failed count, Deleted count & %. Displays 5-column frozen left CVar table in <code>ConfigAnalysisDialog.kt</code>.</li>
            <li><strong>DuplicateCvarFlagger.kt:</strong> Scans INIs for duplicate keys across sections while protecting metadata pointers (<code>BaseProfileName</code>, <code>DeviceScore</code>).</li>
            <li><strong>ForbiddenCvarStripper.kt:</strong> Detects blacklisted or crash-inducing CVars with 1-tap <strong>Auto Strip All</strong>.</li>
            <li><strong>CVarExtractor.kt:</strong> Parses <code>Client.log</code> line-by-line and assigns change frequency remarks (<code>Static</code>, <code>Var 1</code>, <code>Var 2</code>, <code>Var 3</code>, <code>Hyper</code>) exported to TXT/CSV.</li>
          </ul>
        </div>
      `
    }
  };

  function formatHtml(html) {
    if (!html) return '';
    return window.WuWaFormatter ? window.WuWaFormatter.formatText(html) : html;
  }

  let activeFeatureId = null;

  function initFeatureModals() {
    const cards = document.querySelectorAll('.clickable-card');
    const modal = document.getElementById('feature-modal');
    if (!modal || cards.length === 0) return;

    const resolvePath = (window.WuWaPathResolver && window.WuWaPathResolver.resolvePath) ? window.WuWaPathResolver.resolvePath : (p) => p;

    const closeBtn = document.getElementById('modal-close-btn');
    const pageLink = document.getElementById('modal-page-link');
    const modalTitle = document.getElementById('modal-title');
    const tabCasualBtn = document.getElementById('modal-tab-casual');
    const tabTechnicalBtn = document.getElementById('modal-tab-technical');
    const tabContentCasual = document.getElementById('tab-content-casual');
    const tabContentTechnical = document.getElementById('tab-content-technical');

    function updateModalTexts() {
      if (tabCasualBtn) tabCasualBtn.textContent = t('modal_casual_tab', 'End-User Quick Steps');
      if (tabTechnicalBtn) tabTechnicalBtn.textContent = t('modal_technical_tab', 'Creator & Technical Mechanics');
      if (pageLink) pageLink.textContent = t('modal_full_page', 'View Full Documentation Page');

      if (activeFeatureId && FEATURE_DETAILS[activeFeatureId]) {
        const detail = FEATURE_DETAILS[activeFeatureId];
        modalTitle.textContent = detail.titleKey ? t(detail.titleKey, detail.title) : detail.title;
      }
    }

    function switchTab(activeTab) {
      if (activeTab === 'casual') {
        tabCasualBtn.classList.add('active');
        tabTechnicalBtn.classList.remove('active');
        tabContentCasual.style.display = 'block';
        tabContentTechnical.style.display = 'none';
      } else {
        tabTechnicalBtn.classList.add('active');
        tabCasualBtn.classList.remove('active');
        tabContentCasual.style.display = 'none';
        tabContentTechnical.style.display = 'block';
      }
    }

    if (tabCasualBtn && tabTechnicalBtn) {
      tabCasualBtn.addEventListener('click', () => switchTab('casual'));
      tabTechnicalBtn.addEventListener('click', () => switchTab('technical'));
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const featureId = card.getAttribute('data-feature');
        activeFeatureId = featureId;
        const detail = FEATURE_DETAILS[featureId];

        updateModalTexts();

        if (detail) {
          pageLink.href = resolvePath(detail.route);
          if (tabContentCasual) tabContentCasual.innerHTML = formatHtml(detail.casual);
          if (tabContentTechnical) tabContentTechnical.innerHTML = formatHtml(detail.technical);
          switchTab('casual');
        } else {
          const cardTitle = card.querySelector('h4') ? card.querySelector('h4').textContent : 'Feature Details';
          modalTitle.textContent = cardTitle;
          pageLink.href = resolvePath('index.html');
          if (tabContentCasual) tabContentCasual.innerHTML = '<p>Feature overview under construction.</p>';
          if (tabContentTechnical) tabContentTechnical.innerHTML = '<p>Technical details under construction.</p>';
          switchTab('casual');
        }

        modal.classList.add('active');
      });
    });

    const closeModal = () => {
      modal.classList.remove('active');
      activeFeatureId = null;
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    window.addEventListener('wuwa:langchange', updateModalTexts);
  }

  window.WuWaModal = { initFeatureModals, FEATURE_DETAILS };
})(window);