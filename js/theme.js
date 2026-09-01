/**
 * WuWa Mobile Config Patcher - Theme Switcher Module (Light / Dark Mode)
 * Accessible across Desktop and Mobile viewports with localStorage persistence.
 */
(function (window) {
  'use strict';

  const STORAGE_KEY = 'wuwa_docs_theme';

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  function setTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
      root.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
      const iconSpan = btn.querySelector('.theme-icon');
      const textSpan = btn.querySelector('.theme-text');

      if (theme === 'light') {
        if (iconSpan) iconSpan.textContent = '🌙';
        if (textSpan) textSpan.textContent = 'Dark Mode';
        btn.setAttribute('title', 'Switch to Dark Mode');
      } else {
        if (iconSpan) iconSpan.textContent = '☀️';
        if (textSpan) textSpan.textContent = 'Light Mode';
        btn.setAttribute('title', 'Switch to Light Mode');
      }
    });
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function initTheme() {
    const current = getSavedTheme();
    setTheme(current);

    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });
  }

  window.WuWaTheme = {
    getSavedTheme,
    setTheme,
    toggleTheme,
    initTheme
  };
})(window);
