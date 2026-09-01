/**
 * WuWa Mobile Config Patcher - Dynamic Text Formatter & Sanitizer Module
 * Converts raw Markdown (**bold**, `code`, *italic*) and LaTeX ($\rightarrow$) into clean HTML tags.
 */
(function (window) {
  'use strict';

  function formatText(text) {
    if (!text) return '';
    let formatted = text;

    // 1. Replace LaTeX arrows
    formatted = formatted.replace(/\$\\rightarrow\$/g, '→');
    formatted = formatted.replace(/\\rightarrow/g, '→');

    // 2. Replace raw code backticks: `code` -> <code>code</code>
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 3. Replace raw double asterisks: **bold** -> <strong>bold</strong>
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 4. Replace raw single asterisks: *italic* -> <em>italic</em>
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    return formatted;
  }

  function sanitizeElementText(element) {
    if (!element) return;

    // Process child text nodes safely without destroying inner HTML tags
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && (
        node.nodeValue.includes('**') ||
        node.nodeValue.includes('`') ||
        node.nodeValue.includes('$\\rightarrow$') ||
        node.nodeValue.includes('\\rightarrow')
      )) {
        textNodes.push(node);
      }
    }

    textNodes.forEach((tNode) => {
      const parent = tNode.parentNode;
      if (!parent) return;

      const tagName = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (tagName === 'code' || tagName === 'pre' || tagName === 'script' || tagName === 'style') {
        return;
      }

      const tempSpan = document.createElement('span');
      tempSpan.innerHTML = formatText(tNode.nodeValue);

      while (tempSpan.firstChild) {
        parent.insertBefore(tempSpan.firstChild, tNode);
      }
      parent.removeChild(tNode);
    });
  }

  function sanitizePage() {
    const mainContent = document.querySelector('.main-container');
    if (mainContent) {
      sanitizeElementText(mainContent);
    }
  }

  window.WuWaFormatter = {
    formatText,
    sanitizeElementText,
    sanitizePage
  };
})(window);
