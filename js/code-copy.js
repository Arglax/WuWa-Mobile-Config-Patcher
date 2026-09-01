/**
 * WuWa Mobile Config Patcher - Code Copy Module
 * Adds interactive copy-to-clipboard buttons to code blocks.
 */
(function (window) {
  'use strict';

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

  window.WuWaCodeCopy = { initCodeCopy };
})(window);
