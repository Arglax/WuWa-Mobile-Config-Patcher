/**
 * WuWa Mobile Config Patcher - Search Engine Module
 * Dynamic relative path resolution, searchable index, live dropdown, and keyboard shortcuts.
 */
(function (window) {
  'use strict';

  // Dynamic Relative Path Resolver
  function resolvePath(targetUrl) {
    if (!targetUrl) return '#';
    if (
      targetUrl.startsWith('http://') ||
      targetUrl.startsWith('https://') ||
      targetUrl.startsWith('//') ||
      targetUrl.startsWith('#')
    ) {
      return targetUrl;
    }

    const currentPath = window.location.pathname;
    const isInsidePages =
      currentPath.includes('/pages/') ||
      currentPath.endsWith('/pages') ||
      currentPath.split('/').filter(Boolean).includes('pages');

    const [pathPart, ...hashParts] = targetUrl.split('#');
    const hash = hashParts.length > 0 ? '#' + hashParts.join('#') : '';
    const cleanTarget = pathPart.replace(/^(\.\/|\/)+/, '');

    let resolved = '';

    if (isInsidePages) {
      if (cleanTarget.startsWith('pages/')) {
        resolved = './' + cleanTarget.slice(6);
      } else if (cleanTarget === 'index.html' || cleanTarget === '404.html' || cleanTarget === 'app-version.txt' || cleanTarget === '') {
        resolved = '../' + cleanTarget;
      } else if (
        cleanTarget.startsWith('css/') ||
        cleanTarget.startsWith('js/') ||
        cleanTarget.startsWith('images/') ||
        cleanTarget.startsWith('assets/')
      ) {
        resolved = '../' + cleanTarget;
      } else {
        resolved = './' + cleanTarget;
      }
    } else {
      if (
        !cleanTarget.startsWith('pages/') &&
        cleanTarget !== 'index.html' &&
        cleanTarget !== '404.html' &&
        cleanTarget !== 'app-version.txt' &&
        cleanTarget !== '' &&
        !cleanTarget.startsWith('css/') &&
        !cleanTarget.startsWith('js/') &&
        !cleanTarget.startsWith('images/') &&
        !cleanTarget.startsWith('assets/')
      ) {
        resolved = './pages/' + cleanTarget;
      } else {
        resolved = './' + cleanTarget;
      }
    }

    return resolved + hash;
  }

  // 9-Page Search Database
  const SEARCH_DATABASE = [
    {
      title: "Overview & System Architecture",
      section: "Getting Started",
      url: "index.html",
      keywords: "home overview introduction capabilities system metadata package io.github.arglax.configpatcher scoped storage accessbackend root shizuku axmanager none global bilibili kuro tw jp kr invariants UE4Game Client Saved Config Android Engine.ini DeviceProfiles.ini Scalability.ini GameUserSettings.ini Client.log UE4CommandLine.txt VulkanProgramBinaryCache ProgramBinaryCache",
      snippet: "An elevated Android application granting 1-click graphics patching, live INI editing, CVar section enforcement, and raw engine diagnostics for Wuthering Waves."
    },
    {
      title: "Prerequisites & Elevated Access Backends",
      section: "Prerequisites",
      url: "pages/setup-shizuku.html",
      keywords: "shizuku wireless debugging pc adb terminal root magisk kernelsu apatch permissions setup wizard pairing code port axmanager backend hierarchy ShizukuManager.kt libsu AccessBackend Xiaomi HyperOS MIUI USB debugging security settings",
      snippet: "Step-by-step guide to configuring Shizuku (Wireless Debugging), Root (libsu), or AxManager backends for Android 11+ scoped storage."
    },
    {
      title: "1-Click & Custom Preset Patching",
      section: "Core Workflows",
      url: "pages/patching-configs.html",
      keywords: "patching engine presets graphics fps ini files 1-click patch revert to vanilla repository source arglax default custom online url local saf folder ZipExtractor.kt ConfigScanner.kt ConfigNode.kt folder.walkTopDown() AdvancedPatchDialog.kt per-file granular MainStorageManager.kt backups",
      snippet: "Learn how to sync online repositories, select custom graphics presets, apply multi-ini patches, configure per-file patching, and revert safely."
    },
    {
      title: "Live Config Editor & Modes",
      section: "Core Workflows",
      url: "pages/config-editor.html",
      keywords: "config editor smart mode text raw mode one-line mode cvars isolation search mode search and replace font slider sort A-Z sortSmartSectionsAlphabetically auto-fix auto-categorize bulk delete Engine.ini DeviceProfiles.ini GameUserSettings.ini CVarSectionGuard.kt misplaced red #FF2222 CVars= prefix formatting rule UE4CommandLine.txt -SkipSplash -ForceEnableCSharpEnvironment",
      snippet: "Edit .ini parameters directly on your phone with Smart Mode, Raw Text Mode, One-Line Mode, A-Z sorting, and section guard enforcement."
    },
    {
      title: "Enable C# Environment",
      section: "Core Workflows",
      url: "pages/enable-csharp.html",
      keywords: "c# csharp enable c# environment -ForceEnableCSharpEnvironment UE4CommandLine.txt RAM 8GB vulkan stability asterisk client version indicator Sharphereal log verification revert scripting pipeline",
      snippet: "Enable and verify the experimental C# Environment scripting pipeline for frame pacing improvements and reduced CPU overhead."
    },
    {
      title: "Common Utilities & Log Decryptor",
      section: "Utilities Suite",
      url: "pages/utilities-diagnostics.html",
      keywords: "utilities client.log decrypt log log explorer filter chips LogConfig GameThread Sharphereal LogInit LogTemp Vulkan RHI Get Device Info DeviceStatsCollector.kt GPU RAM CPU score export patch share zip LogDecryptor.kt Scheme A Scheme B DecryptedLogViewerDialog.kt delete logs rm -rf Vanilla mode Revert to Vanilla AdvancedRevertDialog.kt ActivityLogDialog.kt activity_log.txt",
      snippet: "Inspect decrypted Client.log files, extract hardware diagnostics, compress patch zips, delete oversized log files, and view backend activity logs."
    },
    {
      title: "Advanced Tools & Diagnostic Suite",
      section: "Advanced Section",
      url: "pages/advanced-tools.html",
      keywords: "advanced tools CVarAnalyzer.kt analyze config ConfigAnalysisDialog.kt Total CVars Applied Failed Deleted frozen table column CVar Bank alteriax 1000+ database alteriax_cvars.txt unreal docs Extract Web CVars Send to Editor DuplicateCvarFlagger.kt DuplicateFlaggerDialog.kt BaseProfileName DeviceScore ForbiddenCvarStripper.kt ForbiddenCvarDialog.kt Auto Strip All CVarExtractor.kt CVarExtractorDialog.kt frequency remarks Static Var 1 Var 2 Var 3 Hyper MainStorageReaderDialog.kt app_main_storage Restore Backup",
      snippet: "Exhaustive technical tools for config creators: CVar Analyzer log verification, 1000+ CVar Bank, Duplicate Flagger, Forbidden Stripper, CVar Extractor, and Main Storage snapshot restores."
    },
    {
      title: "Manual Mode Guide (Old School)",
      section: "Alternative Setup",
      url: "pages/manual-method.html",
      keywords: "manual pc usb mtp file transfer engine.ini deviceprofiles.ini direct copy android data FV file explorer zarchiver mt manager android 14 15 permission restrictions scoped storage fallback",
      snippet: "Instructions for manually copying Engine.ini and DeviceProfiles.ini to your device via PC/USB or third-party file managers."
    },
    {
      title: "Troubleshooting & FAQ",
      section: "Help & Support",
      url: "pages/troubleshooting.html",
      keywords: "troubleshooting faq black screen flickering crash force close 60% shader compilation shizuku connection permission access badges NONE refresh Vibrant Red guard auto-fix delete logs delete shaders VulkanProgramBinaryCache ProgramBinaryCache",
      snippet: "Solutions for Shizuku connection errors, game stuttering, Vibrant Red section guard warnings, log storage issues, and shader cache deletion."
    },
    {
      title: "Support, Bug Reporting & Settings",
      section: "Help & Support",
      url: "pages/bug-reporting.html",
      keywords: "bug report activity log ActionLogger.kt ActionLogger.log BugReportDialog.kt GCash InstaPay GCashDialog.kt settings danger zone clear cache clear data clear activity log delete shaders DeleteShadersDialog.kt Whats New ChangelogDialog.kt discord github arglax",
      snippet: "Generate detailed diagnostic bug reports with backend activity logs, support developer donations, and manage Settings Danger Zone cleanups."
    },
    {
      title: "GitHub Releases (Latest Downloads)",
      section: "Downloads",
      url: "https://github.com/Arglax/WuWa-Mobile-Config-Patcher/releases",
      keywords: "download apk release update github releases patcher v1.5.0 latest release",
      snippet: "Download the latest APK release (v1.5.0) of WuWa Mobile Config Patcher from the official GitHub Releases repository."
    }
  ];

  function initSearch() {
    const searchContainers = document.querySelectorAll('.search-box');

    searchContainers.forEach((container) => {
      const input = container.querySelector('#doc-search');
      const resultsContainer = container.querySelector('.search-dropdown');
      if (!input || !resultsContainer) return;

      let selectedIndex = -1;

      function renderResults(query) {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) {
          resultsContainer.innerHTML = '';
          resultsContainer.classList.add('hidden');
          selectedIndex = -1;
          return;
        }

        const queryWords = trimmed.split(/\s+/).filter(Boolean);

        const matched = SEARCH_DATABASE.filter((item) => {
          const fullText = (
            item.title + ' ' +
            item.section + ' ' +
            item.keywords + ' ' +
            item.snippet
          ).toLowerCase();
          return queryWords.every((word) => fullText.includes(word));
        });

        if (matched.length === 0) {
          resultsContainer.innerHTML = `
            <div class="search-no-results">
              <span class="no-results-icon">🔍</span>
              <p>No documentation pages found for "<strong>${escapeHtml(trimmed)}</strong>"</p>
            </div>
          `;
          resultsContainer.classList.remove('hidden');
          selectedIndex = -1;
          return;
        }

        const itemsHtml = matched
          .map((item, idx) => {
            const resolvedUrl = resolvePath(item.url);
            const isExternal = item.url.startsWith('http://') || item.url.startsWith('https://');
            const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
            const highlightedTitle = highlightMatches(item.title, queryWords);
            const highlightedSnippet = highlightMatches(item.snippet, queryWords);

            return `
              <a href="${resolvedUrl}" ${targetAttr} class="search-result-item" data-index="${idx}">
                <div class="result-content">
                  <div class="result-header">
                    <span class="result-title">${highlightedTitle}</span>
                    <span class="result-section">${escapeHtml(item.section)}</span>
                  </div>
                  <div class="result-snippet">${highlightedSnippet}</div>
                </div>
              </a>
            `;
          })
          .join('');

        resultsContainer.innerHTML = itemsHtml;
        resultsContainer.classList.remove('hidden');
        selectedIndex = -1;
      }

      input.addEventListener('input', (e) => renderResults(e.target.value));
      input.addEventListener('focus', (e) => {
        if (e.target.value.trim()) renderResults(e.target.value);
      });

      input.addEventListener('keydown', (e) => {
        const items = resultsContainer.querySelectorAll('.search-result-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % items.length;
          updateSelectedResult(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          updateSelectedResult(items, selectedIndex);
        } else if (e.key === 'Enter') {
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            e.preventDefault();
            items[selectedIndex].click();
          }
        } else if (e.key === 'Escape') {
          resultsContainer.classList.add('hidden');
          input.blur();
        }
      });

      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
          resultsContainer.classList.add('hidden');
        }
      });
    });

    // Global Shortcut Focus: '/' or 'Ctrl+K'
    document.addEventListener('keydown', (e) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        const firstSearchInput = document.querySelector('#doc-search');
        if (firstSearchInput) {
          firstSearchInput.focus();
          firstSearchInput.select();
        }
      }
    });
  }

  function updateSelectedResult(items, index) {
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  function highlightMatches(text, words) {
    if (!text) return '';
    let escaped = escapeHtml(text);
    words.forEach((word) => {
      if (!word) return;
      const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
      escaped = escaped.replace(regex, '<mark>$1</mark>');
    });
    return escaped;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  window.WuWaPathResolver = { resolvePath };
  window.WuWaSearch = { initSearch, SEARCH_DATABASE };
})(window);
