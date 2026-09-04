/**
 * WuWa Mobile Config Patcher - Main Orchestrator Script
 * Imports and initializes metadata, search, sidebar, code copy, modal, theme, and AI chat components.
 * Also injects mobile-only UI (hamburger + sidebar drawer overlay) and wraps wide tables for
 * horizontal scrolling, so no per-page HTML edits are needed for responsive behavior.
 */

(function (window) {
  'use strict';

  const MOBILE_NAV_BREAKPOINT = '(max-width: 900px)';

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

  // Hamburger toggle + off-canvas drawer for the sidebar on phones/small tablets.
  function initMobileNav() {
    const header = document.querySelector('.app-header');
    const sidebar = document.querySelector('.sidebar');
    if (!header || !sidebar || document.querySelector('.mobile-nav-toggle')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'mobile-nav-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = '<span class="hamburger-icon">☰</span>';

    const brand = header.querySelector('.header-brand');
    header.insertBefore(toggleBtn, brand || header.firstChild);

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    function openNav() {
      sidebar.classList.add('sidebar-open');
      overlay.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.innerHTML = '<span class="hamburger-icon">✕</span>';
      document.body.classList.add('nav-locked');
    }

    function closeNav() {
      sidebar.classList.remove('sidebar-open');
      overlay.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '<span class="hamburger-icon">☰</span>';
      document.body.classList.remove('nav-locked');
    }

    toggleBtn.addEventListener('click', () => {
      if (sidebar.classList.contains('sidebar-open')) closeNav(); else openNav();
    });
    overlay.addEventListener('click', closeNav);

    sidebar.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.matchMedia(MOBILE_NAV_BREAKPOINT).matches) closeNav();
      });
    });

    window.addEventListener('resize', () => {
      if (!window.matchMedia(MOBILE_NAV_BREAKPOINT).matches) closeNav();
    });
  }

  // Splits the trailing text of .github-link into its own span so CSS can hide just the
  // label (not the SVG icon) on narrow screens.
  function wrapGithubLinkText() {
    document.querySelectorAll('.github-link').forEach((link) => {
      if (link.querySelector('.github-link-text')) return;
      const textNode = Array.from(link.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
      if (!textNode) return;
      const span = document.createElement('span');
      span.className = 'github-link-text';
      span.textContent = textNode.textContent.trim();
      textNode.replaceWith(span);
    });
  }

  // Wraps plain .doc-table elements in a horizontally-scrollable container so wide tables
  // don't blow out the layout on narrow viewports. Skips tables already in a scroll wrapper
  // (e.g. .frozen-table-container, which ships its own).
  function initResponsiveTables() {
    document.querySelectorAll('table.doc-table').forEach((table) => {
      if (table.closest('.table-scroll') || table.closest('.frozen-table-container')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'table-scroll';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
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
    initMobileNav();
    wrapGithubLinkText();
    initResponsiveTables();

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