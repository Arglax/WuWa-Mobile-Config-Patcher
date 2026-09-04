/**
 * WuWa Mobile Config Patcher - Main Orchestrator Script
 * Imports and initializes i18n, metadata, search, sidebar, code copy, modal, theme, and AI chat components.
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

    // 1. Initialize Localization first so dynamic text applies to DOM
    if (window.WuWaI18n && window.WuWaI18n.initI18n) {
      window.WuWaI18n.initI18n();
    }

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

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
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