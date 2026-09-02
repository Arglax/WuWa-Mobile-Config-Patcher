/**
 * WuWa Mobile Config Patcher - Main Orchestrator Script
 * Imports and initializes metadata, search, sidebar, code copy, modal, theme, and AI chat components.
 */

(function (window) {
  'use strict';

  function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const currentPath = window.location.pathname;
    
    if (!sidebar) return;
    const navLinks = sidebar.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const cleanHref = href.replace(/^(\.\/|\.\.\/)+/, '');
      const cleanCurrent = currentPath.replace(/^\/+/, '');

      if (cleanCurrent.endsWith(cleanHref) || (cleanHref === 'index.html' && (cleanCurrent === '' || cleanCurrent.endsWith('/')))) {
        link.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const resolvePath = (window.WuWaPathResolver && window.WuWaPathResolver.resolvePath)
      ? window.WuWaPathResolver.resolvePath
      : (p) => p;

    if (window.WuWaMetadata && window.WuWaMetadata.loadGlobalMetadata) {
      window.WuWaMetadata.loadGlobalMetadata(resolvePath);
    }

    if (window.WuWaSearch && window.WuWaSearch.initSearch) {
      window.WuWaSearch.initSearch();
    }

    if (window.WuWaCodeCopy && window.WuWaCodeCopy.initCodeCopy) {
      window.WuWaCodeCopy.initCodeCopy();
    }

    if (window.WuWaModal && window.WuWaModal.initFeatureModals) {
      window.WuWaModal.initFeatureModals();
    }

    if (window.WuWaTheme && window.WuWaTheme.initTheme) {
      window.WuWaTheme.initTheme();
    }

    if (window.WuWaAiChat && window.WuWaAiChat.initAiChat) {
      window.WuWaAiChat.initAiChat();
    }

    if (window.WuWaFormatter && window.WuWaFormatter.sanitizePage) {
      window.WuWaFormatter.sanitizePage();
    }

    initSidebar();

    // --- NEW: Service Worker Registration for Offline Caching ---
    if ('serviceWorker' in navigator) {
      // Delay registration until after page load to ensure UI performance
      window.addEventListener('load', () => {
        // Resolve path handles subfolder routing on GitHub Pages automatically
        const swPath = resolvePath('sw.js');
        navigator.serviceWorker.register(swPath)
          .then(registration => {
            console.log('Offline ServiceWorker registered successfully with scope:', registration.scope);
          })
          .catch(error => {
            console.warn('Offline ServiceWorker registration failed:', error);
          });
      });
    }
  });
})(window);