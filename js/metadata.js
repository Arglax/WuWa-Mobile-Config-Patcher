/**
 * WuWa Mobile Config Patcher - Metadata Manager Module
 * Handles loading, parsing, and applying app metadata (v1.5.0, build info, release URLs).
 */
(function (window) {
  'use strict';

  const DEFAULT_METADATA = {
    version: "1.5.0",
    version_code: "30",
    app_id: "io.github.arglax.configpatcher",
    app_size: "6 MB",
    release_url: "https://github.com/Arglax/WuWa-Mobile-Config-Patcher/releases",
    latest_release_url: "https://github.com/Arglax/WuWa-Mobile-Config-Patcher/releases/latest",
    repo_url: "https://github.com/Arglax/WuWa-Mobile-Config-Patcher",
    version_check_url: "https://raw.githubusercontent.com/Arglax/WuWa-Mobile-Config-Patcher/main/app-version.txt",
    min_android: "Android 11 (API 30)",
    target_sdk: "Target SDK 36 (compileSdk 37)",
    shizuku_ver: "v13.6.0+",
    game_target: "Wuthering Waves (Global, Bilibili, Kuro, TW, JP, KR)",
    author: "Arglax"
  };

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

  async function loadGlobalMetadata(resolvePathFn) {
    let meta = { ...DEFAULT_METADATA };

    try {
      const resolvePath = resolvePathFn || (window.WuWaPathResolver ? window.WuWaPathResolver.resolvePath : (p) => p);
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
    const cleanVersion = (meta.version || '1.5.0').replace(/^v/i, '');
    const versionWithV = 'v' + cleanVersion;

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

    document.querySelectorAll('[data-meta-href]').forEach((el) => {
      const key = el.getAttribute('data-meta-href').toLowerCase();
      if (meta[key]) {
        el.setAttribute('href', meta[key]);
      }
    });
  }

  window.WuWaMetadata = {
    DEFAULT_METADATA,
    loadGlobalMetadata,
    applyMetadataToDOM
  };
})(window);
