/**
 * WuWa Mobile Config Patcher - Documentation Engine
 * Features: Global Metadata Sync, Dynamic Path Resolution, Search System, Theme Manager, Mobile Sidebar, Code Copy
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Default Metadata & Global Fallbacks
  // -------------------------------------------------------------------------
  const DEFAULT_METADATA = {
    version: "1.4.4.1",
    app_size: "6 MB",
    release_url: "https://github.com/Arglax/WuWa-Mobile-Config-Patcher/releases",
    latest_release_url: "https://github.com/Arglax/WuWa-Mobile-Config-Patcher/releases/latest",
    repo_url: "https://github.com/Arglax/WuWa-Mobile-Config-Patcher",
    min_android: "Android 11 (API 30)",
    rec_android: "Android 13+ (API 33)",
    shizuku_ver: "v13.6.0",
    game_target: "Wuthering Waves (Global)",
    author: "Arglax"
  };

  // -------------------------------------------------------------------------
  // 2. Search Database
  // -------------------------------------------------------------------------
  const SEARCH_DATABASE = [
    {
      title: "Overview & Introduction",
      section: "Getting Started",
      url: "index.html",
      keywords: "home overview introduction features 1-click patch safe revert config sources update checker metadata reader wuwa patcher",
      snippet: "An ultra light-weight Android utility to streamline applying mobile configuration presets for Wuthering Waves."
    },
    {
      title: "Setup Shizuku Guide",
      section: "Prerequisites",
      url: "pages/setup-shizuku.html",
      keywords: "shizuku wireless debugging pc adb terminal root permissions setup wizard pairing code port",
      snippet: "Step-by-step guide to installing and configuring Shizuku via Wireless Debugging, PC/ADB, or Root."
    },
    {
      title: "Patching Configs & Engine Presets",
      section: "Core Features",
      url: "pages/patching-configs.html",
      keywords: "patching engine presets graphics fps ini files 1-click patch revert to vanilla multi-select apply all",
      snippet: "Learn how to sync online repositories, select custom graphics presets, apply multi-ini patches, and revert safely."
    },
    {
      title: "Manual Config Method",
      section: "Alternative Setup",
      url: "pages/manual-method.html",
      keywords: "manual pc usb mtp file transfer engine.ini deviceprofiles.ini direct copy android data",
      snippet: "Instructions for manually copying Engine.ini and DeviceProfiles.ini to your device via PC/USB."
    },
    {
      title: "Config Editor & Smart Mode",
      section: "Advanced Tools",
      url: "pages/config-editor.html",
      keywords: "config editor smart mode raw mode cvars isolation mode search and replace undo redo negative values",
      snippet: "Edit .ini parameters directly on your phone with Smart Mode, Raw Mode, persistent Undo-Redo, and Isolation Mode."
    },
    {
      title: "Enable C# Environment",
      section: "Performance & Tweaks",
      url: "pages/enable-csharp.html",
      keywords: "c# csharp enable c# mono unity script runtime performance vulkan 8gb ram device info",
      snippet: "Enable and test the experimental C# Environment for enhanced game scripting performance and Vulkan stability."
    },
    {
      title: "Utilities & Diagnostics",
      section: "Toolkit",
      url: "pages/utilities-diagnostics.html",
      keywords: "utilities client.log decrypt log extract log delete logs export patch share patch device snapshot metadata",
      snippet: "Extract and decrypt Client.log, manage oversized log files, export patches, and view hardware info."
    },
    {
      title: "Troubleshooting & FAQ",
      section: "Help & Support",
      url: "pages/troubleshooting.html",
      keywords: "troubleshooting faq black screen flickering crash force close 60% shader compilation shizuku connection permission",
      snippet: "Solutions for black screen flickering, 60% shader compilation crashes, Shizuku connection errors, and common questions."
    },
    {
      title: "Bug Reporting & Support",
      section: "Help & Support",
      url: "pages/bug-reporting.html",
      keywords: "bug report activity log logs support github issues developer notes discord arglax",
      snippet: "How to generate detailed activity logs and submit bug reports directly to the developer repository."
    },
    {
      title: "GitHub Releases (Latest Downloads)",
      section: "Downloads",
      url: "https://github.com/Arglax/WuWa-Mobile-Config-Patcher/releases",
      keywords: "download apk release update v1.4.4.1 github releases patcher",
      snippet: "Download the latest APK release of WuWa Mobile Config Patcher from the official GitHub Releases page."
    }
  ];

  // -------------------------------------------------------------------------
  // 3. Dynamic Relative Path Resolver
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // 4. Global Metadata Parser & DOM Updater
  // -------------------------------------------------------------------------
  function parseMetadataText(text) {
    if (!text) return {};
    const trimmed = text.trim();
    if (!trimmed) return {};

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {}
    }

    const metadata = {};
    const lines = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));

    // Single line version support (e.g. "2.0")
    if (lines.length === 1 && !lines[0].includes(':') && !lines[0].includes('=')) {
      metadata.version = lines[0].replace(/^v/i, '');
      return metadata;
    }

    lines.forEach((line) => {
      if (line.includes(':')) {
        const [key, ...vals] = line.split(':');
        metadata[key.trim().toLowerCase()] = vals.join(':').trim();
      } else if (line.includes('=')) {
        const [key, ...vals] = line.split('=');
        metadata[key.trim().toLowerCase()] = vals.join('=').trim();
      } else if (!metadata.version) {
        metadata.version = line.replace(/^v/i, '');
      }
    });

    return metadata;
  }

  async function loadGlobalMetadata() {
    let meta = { ...DEFAULT_METADATA };

    try {
      const versionFileUrl = resolvePath('app-version.txt');
      const response = await fetch(versionFileUrl, { cache: 'no-cache' });
      if (response.ok) {
        const text = await response.text();
        const parsed = parseMetadataText(text);
        meta = { ...meta, ...parsed };
      }
    } catch (err) {
      console.warn('WuWa Patcher Docs: Using fallback metadata values.', err);
    }

    applyMetadataToDOM(meta);
    return meta;
  }

  function applyMetadataToDOM(meta) {
    const cleanVersion = (meta.version || '').replace(/^v/i, '');
    const versionWithV = 'v' + cleanVersion;

    // 1. Text elements with data-meta="key"
    document.querySelectorAll('[data-meta]').forEach((el) => {
      const key = el.getAttribute('data-meta').toLowerCase();
      if (key === 'version') {
        el.textContent = cleanVersion;
      } else if (key === 'version_v') {
        el.textContent = versionWithV;
      } else if (meta[key] !== undefined) {
        el.textContent = meta[key];
      }
    });

    // 2. Link targets with data-meta-href="key"
    document.querySelectorAll('[data-meta-href]').forEach((el) => {
      const key = el.getAttribute('data-meta-href').toLowerCase();
      if (meta[key]) {
        el.setAttribute('href', meta[key]);
      }
    });

    // 3. Download badges with data-meta-badge="download_badge"
    document.querySelectorAll('[data-meta-badge="download_badge"]').forEach((img) => {
      const badgeUrl = `https://img.shields.io/badge/Download-WuWa%20Config%20Patcher%20v${encodeURIComponent(cleanVersion)}-brightgreen?style=plastic&logo=android`;
      img.setAttribute('src', badgeUrl);
      img.setAttribute('alt', `Download WuWa Config Patcher v${cleanVersion}`);
    });

    // 4. Update Dynamic Search Entries
    const downloadItem = SEARCH_DATABASE.find((item) => item.section === 'Downloads');
    if (downloadItem) {
      downloadItem.snippet = `Download the latest APK release (v${cleanVersion}) of WuWa Mobile Config Patcher from the official GitHub Releases page.`;
      downloadItem.keywords = `download apk release update v${cleanVersion} ${cleanVersion} github releases patcher`;
      if (meta.release_url) {
        downloadItem.url = meta.release_url;
      }
    }
  }

  // -------------------------------------------------------------------------
  // 5. Theme Manager (Dark / Light Mode)
  // -------------------------------------------------------------------------
  const THEME_STORAGE_KEY = 'wuwa_patcher_theme';

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateThemeToggleButtons(theme);
  }

  function updateThemeToggleButtons(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach((btn) => {
      const icon = btn.querySelector('.theme-icon');
      if (theme === 'dark') {
        btn.setAttribute('title', 'Switch to Light Mode');
        btn.setAttribute('aria-label', 'Switch to Light Mode');
        if (icon) icon.textContent = '☀️';
      } else {
        btn.setAttribute('title', 'Switch to Dark Mode');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
        if (icon) icon.textContent = '🌙';
      }
    });
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  applyTheme(getPreferredTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // -------------------------------------------------------------------------
  // 6. Live Search System
  // -------------------------------------------------------------------------
  function initSearch() {
    const searchContainers = document.querySelectorAll('.search-container');

    searchContainers.forEach((container) => {
      const input = container.querySelector('.search-input');
      const resultsContainer = container.querySelector('.search-results');
      if (!input || !resultsContainer) return;

      let selectedIndex = -1;

      function renderResults(query) {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) {
          resultsContainer.innerHTML = '';
          resultsContainer.classList.remove('active');
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
          resultsContainer.classList.add('active');
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
                <div class="result-header">
                  <span class="result-title">${highlightedTitle}</span>
                  <span class="result-section">${escapeHtml(item.section)}</span>
                </div>
                <div class="result-snippet">${highlightedSnippet}</div>
              </a>
            `;
          })
          .join('');

        resultsContainer.innerHTML = itemsHtml;
        resultsContainer.classList.add('active');
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
          resultsContainer.classList.remove('active');
          input.blur();
        }
      });

      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
          resultsContainer.classList.remove('active');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        const firstSearchInput = document.querySelector('.search-input');
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
        item.scrollIntoView({ block: 'nearest' });
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

  // -------------------------------------------------------------------------
  // 7. Sidebar & Mobile Drawer
  // -------------------------------------------------------------------------
  function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (!sidebar) return;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    const currentPath = window.location.pathname;
    const navLinks = sidebar.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const cleanHref = href.replace(/^(\.\/|\.\.\/)+/, '');
      const cleanCurrent = currentPath.replace(/^\/+/, '');

      if (cleanCurrent.endsWith(cleanHref) || (cleanHref === 'index.html' && (cleanCurrent === '' || cleanCurrent.endsWith('/')))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 8. Code Block Copy Buttons
  // -------------------------------------------------------------------------
  function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach((pre) => {
      if (pre.querySelector('.copy-code-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.textContent = 'Copy';

      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code') || pre;
        const text = code.innerText.replace(/Copy\s*$/, '').trim();

        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          btn.textContent = 'Failed';
          setTimeout(() => {
            btn.textContent = 'Copy';
          }, 2000);
        }
      });

      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  // -------------------------------------------------------------------------
  // 9. Initialization on DOM Load
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });
    updateThemeToggleButtons(document.documentElement.getAttribute('data-theme') || 'dark');

    // Fetch and bind metadata from app-version.txt
    loadGlobalMetadata();

    initSearch();
    initSidebar();
    initCodeCopy();
  });

  window.WuWaDocs = {
    resolvePath,
    toggleTheme,
    applyTheme,
    getPreferredTheme,
    loadGlobalMetadata,
    DEFAULT_METADATA
  };
})();