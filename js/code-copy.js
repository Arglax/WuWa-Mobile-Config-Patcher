/**
 * WuWa Mobile Config Patcher - Code Copy Module
 * Adds interactive copy-to-clipboard buttons with fallback and aria-live screen reader announcements.
 */
(function (window) {
  'use strict';

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      successful = false;
    }
    document.body.removeChild(textArea);
    return successful;
  }

  function getLiveAnnouncer() {
    let liveEl = document.getElementById('copy-live-announcer');
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.id = 'copy-live-announcer';
      liveEl.className = 'sr-only';
      liveEl.setAttribute('aria-live', 'polite');
      liveEl.setAttribute('aria-atomic', 'true');
      liveEl.style.cssText = 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);';
      document.body.appendChild(liveEl);
    }
    return liveEl;
  }

  function announce(message) {
    const liveEl = getLiveAnnouncer();
    if (liveEl) liveEl.textContent = message;
  }

  function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre, .code-block');

    codeBlocks.forEach((container) => {
      let btn = container.querySelector('.copy-code-btn');
      const codeEl = container.querySelector('code') || container.querySelector('pre') || container;

      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'copy-code-btn';
        btn.setAttribute('aria-label', 'Copy code snippet to clipboard');
        btn.textContent = 'Copy';

        if (container.tagName === 'PRE') {
          container.style.position = 'relative';
          container.appendChild(btn);
        } else {
          const header = container.querySelector('.code-header');
          if (header) {
            header.appendChild(btn);
          } else {
            container.appendChild(btn);
          }
        }
      }

      // Avoid duplicate click listeners
      if (btn.dataset.hasCopyListener) return;
      btn.dataset.hasCopyListener = 'true';

      btn.addEventListener('click', async () => {
        const text = codeEl.innerText.replace(/Copy\s*$/, '').trim();
        let success = false;

        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(text);
            success = true;
          } catch (e) {
            success = fallbackCopyTextToClipboard(text);
          }
        } else {
          success = fallbackCopyTextToClipboard(text);
        }

        if (success) {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          announce('Code snippet copied to clipboard.');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        } else {
          btn.textContent = 'Failed';
          announce('Failed to copy code snippet.');
          setTimeout(() => {
            btn.textContent = 'Copy';
          }, 2000);
        }
      });
    });
  }

  window.WuWaCodeCopy = { initCodeCopy };
})(window);
