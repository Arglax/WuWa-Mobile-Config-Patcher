/**
 * WuWa Mobile Config Patcher - Theme Switcher Module (Light / Dark Mode)
 * Accessible across Desktop and Mobile viewports with localStorage persistence.
 */
(function (window) {
  'use strict';

  const STORAGE_KEY = 'wuwa_docs_theme';

  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function getSavedTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (e) {
      console.warn('localStorage access denied or unavailable for theme storage:', e);
    }
    return getSystemPreference();
  }

  function setTheme(theme) {
    const validTheme = (theme === 'light') ? 'light' : 'dark';
    const root = document.documentElement;
    root.setAttribute('data-theme', validTheme);

    try {
      localStorage.setItem(STORAGE_KEY, validTheme);
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }

    updateToggleButtons(validTheme);
  }

  function updateToggleButtons(theme) {
    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
      const iconSpan = btn.querySelector('.theme-icon');
      const textSpan = btn.querySelector('.theme-text');

      if (theme === 'light') {
        if (iconSpan) iconSpan.textContent = '🌙';
        if (textSpan) textSpan.textContent = 'Dark Mode';
        btn.setAttribute('title', 'Switch to Dark Mode');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      } else {
        if (iconSpan) iconSpan.textContent = '☀️';
        if (textSpan) textSpan.textContent = 'Light Mode';
        btn.setAttribute('title', 'Switch to Light Mode');
        btn.setAttribute('aria-label', 'Switch to Light Mode');
      }
    });
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // Apply theme immediately to prevent flashing during page load
  const initialTheme = getSavedTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  // Listen for system theme changes if user has no stored preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setTheme(e.matches ? 'light' : 'dark');
        }
      } catch (err) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    });
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
