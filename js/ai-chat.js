/**
 * WuWa Mobile Config Patcher - Floating AI Chat Assistant Widget
 * Features: BM25 Knowledge Retrieval, Active Disambiguation Chips, Gemini API Fallback, Toxicity Guard
 */
(function (window) {
  'use strict';

  const GEMINI_KEY_STORAGE = 'wuwa_gemini_api_key';
  const STRIKE_STORAGE = 'wuwa_ai_strikes';
  const BAN_STORAGE = 'wuwa_ai_ban_until';

  const TOXICITY_REGEX = /\b(fuck|fucking|fucker|fuk|shit|shitting|shitty|bitch|asshole|bastard|idiot|stupid|dumb|dumbass|stfu|cunt|dick|pussy|shut\s*up|hate\s*you|useless\s*bot|garbage\s*bot|trash\s*bot)\b/i;

  const AI_SYSTEM_PROMPT = `You are WuWa Assistant, an expert AI helper for the Android app 'WuWa Config Patcher' (package io.github.arglax.configpatcher).
Provide clear, accurate troubleshooting help for CVars, Shizuku, C# Environment, and Android device profiles.`;

  const QUICK_PROMPTS = [
    { label: "🛠️ Recommended CVars", query: "what cvars can i put" },
    { label: "📱 RAM & Hardware", query: "recommended ram" },
    { label: "⚡ Shizuku Setup", query: "How do I setup Shizuku?" },
    { label: "🚀 C# Environment", query: "How to enable C# Environment?" },
    { label: "🛡️ Section Guards", query: "What are CVar Section Guards?" },
    { label: "🔍 CVar Analyzer", query: "How does CVar Analyzer work?" }
  ];

  function resolvePath(targetUrl) {
    if (window.WuWaPathResolver && window.WuWaPathResolver.resolvePath) {
      return window.WuWaPathResolver.resolvePath(targetUrl);
    }
    return targetUrl;
  }

  async function queryGeminiApi(apiKey, userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: `${AI_SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}` }] }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }
    throw new Error('Invalid Gemini API response format');
  }

  function checkBanStatus() {
    const banUntil = parseInt(localStorage.getItem(BAN_STORAGE) || '0', 10);
    if (banUntil && Date.now() < banUntil) {
      const remainingMinutes = Math.ceil((banUntil - Date.now()) / 60000);
      return { banned: true, remainingMinutes };
    }
    if (banUntil && Date.now() >= banUntil) {
      localStorage.removeItem(BAN_STORAGE);
      localStorage.setItem(STRIKE_STORAGE, '0');
    }
    return { banned: false, remainingMinutes: 0 };
  }

  function renderWidgetDOM() {
    if (document.getElementById('ai-chat-root')) return;

    const root = document.createElement('div');
    root.id = 'ai-chat-root';
    root.innerHTML = `
      <button id="ai-chat-fab" class="ai-chat-fab" aria-label="Open AI Assistant Chat" title="Open WuWa AI Assistant">
        <span class="fab-icon">💬</span>
        <span class="fab-label">AI Assistant</span>
      </button>

      <div id="ai-chat-window" class="ai-chat-window hidden" role="dialog" aria-modal="true">
        <div class="ai-chat-header">
          <div class="header-info">
            <span class="ai-avatar">🤖</span>
            <div>
              <h4>WuWa AI Assistant</h4>
              <span class="ai-status">Online • BM25 Active Learning</span>
            </div>
          </div>
          <div class="header-actions">
            <button id="ai-chat-settings-btn" class="chat-header-btn" title="API Settings">⚙️</button>
            <button id="ai-chat-close-btn" class="chat-header-btn" title="Close Chat">&times;</button>
          </div>
        </div>

        <div id="ai-chat-settings" class="ai-chat-settings hidden">
          <h5>Gemini API Settings (Optional)</h5>
          <p>Supply a free Google Gemini API Key for generative mode. If omitted, local BM25 ranking is used.</p>
          <input type="password" id="gemini-api-key-input" placeholder="Paste Gemini API Key (AIzaSy...)" autocomplete="off">
          <div class="settings-btn-row">
            <button id="save-gemini-key-btn" class="btn-chat-action">Save Key</button>
            <button id="clear-gemini-key-btn" class="btn-chat-secondary">Clear</button>
          </div>
        </div>

        <div id="ai-chat-messages" class="ai-chat-messages">
          <div class="chat-msg msg-ai">
            <div class="msg-bubble">
              👋 Hello! I am your <strong>WuWa Config Patcher AI Assistant</strong>. Ask me anything about CVars, RAM requirements, Shizuku setup, Live Config Editor, or C# Environment!
            </div>
          </div>

          <div class="prompt-chips-container" id="prompt-chips-container">
            ${QUICK_PROMPTS.map(p => `<button class="prompt-chip" data-query="${p.query}">${p.label}</button>`).join('')}
          </div>
        </div>

        <form id="ai-chat-form" class="ai-chat-input-row">
          <input type="text" id="ai-chat-input" placeholder="Ask a question about the app..." autocomplete="off">
          <button type="submit" id="ai-chat-send-btn" class="ai-chat-send-btn" title="Send Message">➢</button>
        </form>
      </div>
    `;

    document.body.appendChild(root);
    bindWidgetEvents();
  }

  function bindWidgetEvents() {
    const fab = document.getElementById('ai-chat-fab');
    const windowEl = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close-btn');
    const settingsBtn = document.getElementById('ai-chat-settings-btn');
    const settingsEl = document.getElementById('ai-chat-settings');
    const apiKeyInput = document.getElementById('gemini-api-key-input');
    const saveKeyBtn = document.getElementById('save-gemini-key-btn');
    const clearKeyBtn = document.getElementById('clear-gemini-key-btn');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const messages = document.getElementById('ai-chat-messages');

    function lockInput(placeholderText) {
      input.disabled = true;
      sendBtn.disabled = true;
      input.placeholder = placeholderText || "AI Assistant temporarily suspended.";
    }

    function unlockInput() {
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = "Ask a question about the app...";
    }

    fab.addEventListener('click', () => {
      windowEl.classList.toggle('hidden');
      if (!windowEl.classList.contains('hidden')) {
        const status = checkBanStatus();
        if (status.banned) {
          lockInput(`Suspended (${status.remainingMinutes}m remaining)`);
          appendSystemMsg(`🚫 System Notice: Suspended. Try again in ${status.remainingMinutes} minute(s).`);
        } else {
          unlockInput();
          input.focus();
        }
      }
    });

    closeBtn.addEventListener('click', () => windowEl.classList.add('hidden'));

    settingsBtn.addEventListener('click', () => {
      settingsEl.classList.toggle('hidden');
      if (!settingsEl.classList.contains('hidden')) {
        apiKeyInput.value = localStorage.getItem(GEMINI_KEY_STORAGE) || '';
      }
    });

    saveKeyBtn.addEventListener('click', () => {
      const val = apiKeyInput.value.trim();
      if (val) {
        localStorage.setItem(GEMINI_KEY_STORAGE, val);
        appendSystemMsg("Gemini API key saved! Live Gemini 1.5 Flash activated.");
      } else {
        localStorage.removeItem(GEMINI_KEY_STORAGE);
        appendSystemMsg("Gemini API key cleared. Instant BM25 knowledge search activated.");
      }
      settingsEl.classList.add('hidden');
    });

    clearKeyBtn.addEventListener('click', () => {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
      apiKeyInput.value = '';
      appendSystemMsg("Gemini API key cleared. Instant BM25 knowledge search activated.");
      settingsEl.classList.add('hidden');
    });

    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => handleUserQuery(chip.getAttribute('data-query')));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (query) {
        handleUserQuery(query);
        input.value = '';
      }
    });

    async function handleUserQuery(query) {
      const status = checkBanStatus();
      if (status.banned) {
        appendUserMsg(query);
        lockInput(`Suspended (${status.remainingMinutes}m remaining)`);
        appendSystemMsg(`🚫 System Notice: Suspended. Try again in ${status.remainingMinutes} minute(s).`);
        return;
      }

      if (TOXICITY_REGEX.test(query)) {
        appendUserMsg(query);
        let strikes = parseInt(localStorage.getItem(STRIKE_STORAGE) || '0', 10) + 1;
        localStorage.setItem(STRIKE_STORAGE, strikes.toString());

        if (strikes === 1) {
          appendSystemMsg(`⚠️ Warning (1/3): Please refrain from offensive language.`);
        } else if (strikes === 2) {
          appendSystemMsg(`⚠️ Warning (2/3): Final warning. Profanity will trigger a 1-hour suspension.`);
        } else {
          localStorage.setItem(BAN_STORAGE, (Date.now() + 3600000).toString());
          lockInput("Suspended (60m remaining)");
          appendSystemMsg(`🚫 Suspended for 1 hour due to repeated guidelines violations.`);
        }
        return;
      }

      appendUserMsg(query);
      const apiKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      const loadingEl = appendAiMsg("Thinking...");

      // Generative Gemini API Route
      if (apiKey) {
        try {
          const aiResponse = await queryGeminiApi(apiKey, query);
          const formatted = window.WuWaFormatter ? window.WuWaFormatter.formatText(aiResponse) : aiResponse;
          loadingEl.querySelector('.msg-bubble').innerHTML = formatted.replace(/\n/g, '<br>');
          scrollToBottom();
          return;
        } catch (err) {
          console.warn("Gemini API failed, using local knowledge fallback.", err);
        }
      }

      // Local BM25 Route
      setTimeout(() => {
        if (!window.WuWaAiKnowledge) {
          loadingEl.querySelector('.msg-bubble').textContent = "Knowledge engine initializing, please retry.";
          return;
        }

        const { matches, learnedMatch } = window.WuWaAiKnowledge.getRankedMatches(query);

        if (learnedMatch) {
          renderResponse(loadingEl, learnedMatch.response);
          return;
        }

        if (matches.length === 0) {
          const fallback = {
            text: `I couldn't find a direct match. Did you mean to ask about one of these?`,
            link: "index.html",
            linkText: "Explore Documentation Home"
          };
          renderResponse(loadingEl, fallback);
          renderDisambiguation(loadingEl, query, [
            { id: "cvars-recommended", title: "Recommended CVars" },
            { id: "shizuku-setup", title: "Shizuku Setup" },
            { id: "ram-hardware", title: "RAM Requirements" }
          ]);
          return;
        }

        // Output best match
        const topMatch = matches[0];
        renderResponse(loadingEl, topMatch.doc.response);

        // Ambiguity Check: If 2nd result exists and score is close to 1st, show learning chips
        if (matches.length > 1 && (topMatch.score - matches[1].score) < 0.6) {
          renderDisambiguation(loadingEl, query, [
            { id: topMatch.doc.id, title: topMatch.doc.title || topMatch.doc.id },
            { id: matches[1].doc.id, title: matches[1].doc.title || matches[1].doc.id }
          ]);
        }
      }, 80);
    }

    function renderResponse(container, responseObj) {
      const resolved = resolvePath(responseObj.link);
      const textFormatted = window.WuWaFormatter ? window.WuWaFormatter.formatText(responseObj.text) : responseObj.text;
      const linkHtml = responseObj.link ? `<br><a href="${resolved}" class="chat-doc-link">🔗 ${responseObj.linkText} →</a>` : '';
      container.querySelector('.msg-bubble').innerHTML = `${textFormatted}${linkHtml}`;
      scrollToBottom();
    }

    function renderDisambiguation(container, rawQuery, topics) {
      const clarifyBox = document.createElement('div');
      clarifyBox.className = 'clarify-box';
      clarifyBox.style.marginTop = '8px';
      clarifyBox.style.fontSize = '0.85em';
      clarifyBox.innerHTML = `<em>Help me learn: Which topic did you intend?</em><br>`;

      topics.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'prompt-chip';
        btn.style.margin = '4px 4px 0 0';
        btn.textContent = t.title;
        btn.onclick = () => {
          window.WuWaAiKnowledge.reinforceTopic(rawQuery, t.id);
          clarifyBox.innerHTML = `<em>✓ Learned! Future queries will prioritize "${t.title}".</em>`;
        };
        clarifyBox.appendChild(btn);
      });

      container.querySelector('.msg-bubble').appendChild(clarifyBox);
      scrollToBottom();
    }

    function appendUserMsg(text) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg msg-user';
      msg.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
      messages.appendChild(msg);
      scrollToBottom();
    }

    function appendAiMsg(initialHtml) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg msg-ai';
      msg.innerHTML = `<div class="msg-bubble">${initialHtml}</div>`;
      messages.appendChild(msg);
      scrollToBottom();
      return msg;
    }

    function appendSystemMsg(text) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg msg-system';
      msg.innerHTML = `<div class="msg-bubble-system">${escapeHtml(text)}</div>`;
      messages.appendChild(msg);
      scrollToBottom();
    }

    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
  }

  function initAiChat() {
    renderWidgetDOM();
  }

  window.WuWaAiChat = { initAiChat };
})(window);