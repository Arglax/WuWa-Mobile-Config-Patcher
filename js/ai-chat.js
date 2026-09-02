/**
 * WuWa Config Patcher - Floating AI Chat Assistant Widget (v1.6.0 merged)
 */
(function (window) {
  'use strict';

  const WORKER_PROXY_URL = 'https://wuwa-ai-proxy.your-subdomain.workers.dev';

  const GEMINI_KEY_STORAGE = 'wuwa_gemini_api_key';
  const STRIKE_STORAGE = 'wuwa_ai_strikes';
  const BAN_STORAGE = 'wuwa_ai_ban_until';
  const CONTEXT_STORAGE = 'wuwa_ai_context_history';
  const MAX_CONTEXT_TURNS = 25;
  const BAN_DURATION_MS = 3600000; // 1 hour

  const TOXICITY_REGEX = /\b(fuck|fucking|fucker|fuk|shit|shitting|shitty|bitch|asshole|bastard|idiot|stupid|dumb|dumbass|stfu|cunt|dick|pussy|shut\s*up|hate\s*you|useless\s*bot|garbage\s*bot|trash\s*bot)\b/i;

  const QUICK_PROMPTS = [
    { label: "🛠️ Recommended CVars", query: "what cvars can i put" },
    { label: "📱 RAM & Hardware", query: "recommended ram" },
    { label: "⚡ Shizuku Setup", query: "How do I setup Shizuku?" },
    { label: "🚀 C# Environment", query: "How to enable C# Environment?" },
    { label: "🛡️ Section Guards", query: "What are CVar Section Guards?" },
    { label: "🔍 CVar Analyzer", query: "How does CVar Analyzer work?" }
  ];

  // --------------------------------------------------------------------
  // Context memory
  // --------------------------------------------------------------------
  function loadContextHistory() {
    try { return JSON.parse(sessionStorage.getItem(CONTEXT_STORAGE) || '[]'); }
    catch (e) { return []; }
  }

  function saveContextHistory(history) {
    try { sessionStorage.setItem(CONTEXT_STORAGE, JSON.stringify(history.slice(-MAX_CONTEXT_TURNS * 2))); }
    catch (e) {}
  }

  function resolvePath(targetUrl) {
    if (window.WuWaPathResolver && window.WuWaPathResolver.resolvePath) {
      return window.WuWaPathResolver.resolvePath(targetUrl);
    }
    return targetUrl;
  }

  // --------------------------------------------------------------------
  // Cloud AI (proxy-first, KB-grounded, conversational)
  // --------------------------------------------------------------------
  function buildSystemPrompt() {
    let knowledgeBaseString = "No documentation loaded.";
    if (window.WuWaAiKnowledge && window.WuWaAiKnowledge.getLoadedTopics) {
      knowledgeBaseString = JSON.stringify(window.WuWaAiKnowledge.getLoadedTopics());
    }

    return `You are WuWa Assistant, a friendly and expert AI helper for the Android app 'WuWa Config Patcher' (v1.5.1) developed by Arglax.
App Documentation Source of Truth:
${knowledgeBaseString}

RULES:
1. For casual greetings, small talk (e.g., "how old are you", "who are you"), respond naturally and conversationally in a polite, friendly tone.
2. For app questions, answer using ONLY the provided documentation JSON. Include Markdown links matching 'linkText' and 'link': [Link Text](link_url).
3. If the user describes a bug/crash, follow the remediation sequence (Vanilla Revert -> Delete Shaders -> Strip Forbidden -> Check RAM -> Report to Arglax).`;
  }

  async function queryAI(userPrompt, contextHistory, customApiKey) {
    const dynamicPrompt = buildSystemPrompt();
    const contents = [
      { role: "user", parts: [{ text: dynamicPrompt }] },
      { role: "model", parts: [{ text: "Understood. I will converse naturally for small talk and use the documentation for technical questions." }] }
    ];

    contextHistory.slice(-MAX_CONTEXT_TURNS * 2).forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      });
    });

    contents.push({ role: "user", parts: [{ text: userPrompt }] });

    let targetUrl = customApiKey
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(customApiKey)}`
      : WORKER_PROXY_URL;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }
    throw new Error('Invalid AI response structure');
  }

  // --------------------------------------------------------------------
  // Strike / ban system
  // --------------------------------------------------------------------
  function checkBanStatus() {
    const banUntil = parseInt(localStorage.getItem(BAN_STORAGE) || '0', 10);
    if (banUntil && Date.now() < banUntil) {
      return { banned: true, remainingMinutes: Math.ceil((banUntil - Date.now()) / 60000) };
    }
    if (banUntil && Date.now() >= banUntil) {
      // Ban expired — reset strikes so the user starts clean
      localStorage.removeItem(BAN_STORAGE);
      localStorage.setItem(STRIKE_STORAGE, '0');
    }
    return { banned: false, remainingMinutes: 0 };
  }

  function registerToxicStrike() {
    let strikes = parseInt(localStorage.getItem(STRIKE_STORAGE) || '0', 10) + 1;
    localStorage.setItem(STRIKE_STORAGE, strikes.toString());
    if (strikes >= 3) {
      localStorage.setItem(BAN_STORAGE, (Date.now() + BAN_DURATION_MS).toString());
    }
    return strikes;
  }

  // --------------------------------------------------------------------
  // DOM
  // --------------------------------------------------------------------
  function renderWidgetDOM() {
    if (document.getElementById('ai-chat-root')) return;

    const root = document.createElement('div');
    root.id = 'ai-chat-root';
    root.innerHTML = `
      <button id="ai-chat-fab" class="ai-chat-fab" aria-label="Open AI Assistant" title="Open AI Assistant">
        <span class="fab-icon">💬</span>
        <span class="fab-label">AI Assistant</span>
      </button>

      <div id="ai-chat-window" class="ai-chat-window hidden" role="dialog" aria-modal="true">
        <div class="ai-chat-header">
          <div class="header-info">
            <span class="ai-avatar">🤖</span>
            <div>
              <h4>WuWa AI Assistant</h4>
              <span id="ai-connection-status" class="ai-status">Checking connection...</span>
            </div>
          </div>
          <div class="header-actions">
            <button id="ai-chat-clear-btn" class="chat-header-btn" title="Clear History">🗑️</button>
            <button id="ai-chat-settings-btn" class="chat-header-btn" title="API Settings">⚙️</button>
            <button id="ai-chat-close-btn" class="chat-header-btn" title="Close">&times;</button>
          </div>
        </div>

        <div id="ai-chat-settings" class="ai-chat-settings hidden">
          <h5>Custom Gemini API Settings (Optional)</h5>
          <p>The assistant works automatically online for free. Paste a personal key to use your own quota.</p>
          <input type="password" id="gemini-api-key-input" placeholder="Paste Gemini API Key (AQ... or AIza...)" autocomplete="off">
          <div class="settings-btn-row">
            <button id="save-gemini-key-btn" class="btn-chat-action">Save Key</button>
            <button id="clear-gemini-key-btn" class="btn-chat-secondary">Use Default</button>
          </div>
        </div>

        <div id="ai-chat-messages" class="ai-chat-messages">
          <div class="chat-msg msg-ai">
            <div class="msg-bubble">
              👋 Hello! I am your <strong>WuWa Config Patcher Assistant</strong>. Ask me anything about presets, CVars, Shizuku, or game troubleshooting!
            </div>
          </div>
          <div class="prompt-chips-container" id="prompt-chips-container">
            ${QUICK_PROMPTS.map(p => `<button class="prompt-chip" data-query="${p.query}">${p.label}</button>`).join('')}
          </div>
        </div>

        <form id="ai-chat-form" class="ai-chat-input-row">
          <input type="text" id="ai-chat-input" placeholder="Ask a question..." autocomplete="off">
          <button type="submit" id="ai-chat-send-btn" class="ai-chat-send-btn">➢</button>
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
    const clearBtn = document.getElementById('ai-chat-clear-btn');
    const settingsBtn = document.getElementById('ai-chat-settings-btn');
    const settingsEl = document.getElementById('ai-chat-settings');
    const apiKeyInput = document.getElementById('gemini-api-key-input');
    const saveKeyBtn = document.getElementById('save-gemini-key-btn');
    const clearKeyBtn = document.getElementById('clear-gemini-key-btn');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const messages = document.getElementById('ai-chat-messages');
    const statusEl = document.getElementById('ai-connection-status');

    function lockInput(placeholderText) {
      input.disabled = true;
      sendBtn.disabled = true;
      input.placeholder = placeholderText || "AI Assistant temporarily suspended.";
    }

    function unlockInput() {
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = "Ask a question...";
    }

    function updateStatusIndicator() {
      const customKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      if (!navigator.onLine) {
        statusEl.textContent = "Offline • Local BM25 Engine Active";
        statusEl.style.color = "#f59e0b";
      } else if (customKey) {
        statusEl.textContent = "Online • Custom Gemini Key Active";
        statusEl.style.color = "#10b981";
      } else {
        statusEl.textContent = "Online • Shared Assistant Active";
        statusEl.style.color = "#10b981";
      }
    }

    window.addEventListener('online', updateStatusIndicator);
    window.addEventListener('offline', updateStatusIndicator);

    fab.addEventListener('click', () => {
      windowEl.classList.toggle('hidden');
      if (!windowEl.classList.contains('hidden')) {
        updateStatusIndicator();
        const status = checkBanStatus();
        if (status.banned) {
          lockInput(`Suspended (${status.remainingMinutes}m remaining)`);
        } else {
          unlockInput();
          input.focus();
        }
      }
    });

    closeBtn.addEventListener('click', () => windowEl.classList.add('hidden'));

    clearBtn.addEventListener('click', () => {
      sessionStorage.removeItem(CONTEXT_STORAGE);
      appendSystemMsg("🧹 Conversation history cleared.");
    });

    settingsBtn.addEventListener('click', () => {
      settingsEl.classList.toggle('hidden');
      if (!settingsEl.classList.contains('hidden')) {
        apiKeyInput.value = localStorage.getItem(GEMINI_KEY_STORAGE) || '';
      }
    });

    saveKeyBtn.addEventListener('click', () => {
      localStorage.setItem(GEMINI_KEY_STORAGE, apiKeyInput.value.trim());
      settingsEl.classList.add('hidden');
      updateStatusIndicator();
      appendSystemMsg("✓ Custom Gemini API key saved.");
    });

    clearKeyBtn.addEventListener('click', () => {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
      apiKeyInput.value = '';
      settingsEl.classList.add('hidden');
      updateStatusIndicator();
      appendSystemMsg("✓ Reset to default shared assistant proxy.");
    });

    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => handleUserQuery(chip.getAttribute('data-query')));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (query) { handleUserQuery(query); input.value = ''; }
    });

    async function handleUserQuery(query) {
      // 1. Ban check
      const status = checkBanStatus();
      if (status.banned) {
        appendUserMsg(query);
        lockInput(`Suspended (${status.remainingMinutes}m remaining)`);
        appendSystemMsg(`🚫 Suspended (${status.remainingMinutes}m remaining).`);
        return;
      }

      // 2. Toxicity / strike escalation
      if (TOXICITY_REGEX.test(query)) {
        appendUserMsg(query);
        const strikes = registerToxicStrike();
        if (strikes === 1) {
          appendSystemMsg(`⚠️ Warning (1/3): Please keep the conversation respectful.`);
        } else if (strikes === 2) {
          appendSystemMsg(`⚠️ Warning (2/3): Final warning. Continued profanity will trigger a 1-hour suspension.`);
        } else {
          lockInput("Suspended (60m remaining)");
          appendSystemMsg(`🚫 Suspended for 1 hour due to repeated conduct violations.`);
        }
        return;
      }

      appendUserMsg(query);
      const contextHistory = loadContextHistory();
      const customApiKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      const loadingEl = appendAiMsg("Thinking...");

      // 3. Cloud AI first (proxy or custom key)
      if (navigator.onLine) {
        try {
          const aiResponse = await queryAI(query, contextHistory, customApiKey);
          let formatted = window.WuWaFormatter ? window.WuWaFormatter.formatText(aiResponse) : aiResponse;

          formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            const resolved = resolvePath(url);
            return `<br><a href="${resolved}" class="chat-doc-link">🔗 ${text} →</a>`;
          });

          loadingEl.querySelector('.msg-bubble').innerHTML = formatted.replace(/\n/g, '<br>');
          contextHistory.push({ role: 'user', text: query });
          contextHistory.push({ role: 'assistant', text: aiResponse });
          saveContextHistory(contextHistory);
          scrollToBottom();
          return;
        } catch (err) {
          console.warn("Proxy/Gemini API failed. Falling back to local BM25.", err);
        }
      }

      // 4. Local BM25 fallback (offline or cloud failure), with disambiguation/learning
      setTimeout(() => {
        if (!window.WuWaAiKnowledge) {
          loadingEl.querySelector('.msg-bubble').textContent = "Offline engine loading...";
          return;
        }

        const { matches, learnedMatch } = window.WuWaAiKnowledge.getRankedMatches(query, contextHistory);

        if (learnedMatch) {
          renderResponse(loadingEl, learnedMatch.response);
          contextHistory.push({ role: 'user', text: query });
          contextHistory.push({ role: 'assistant', text: learnedMatch.response.text });
          saveContextHistory(contextHistory);
          return;
        }

        if (matches.length === 0) {
          const fallback = {
            text: `I couldn't locate a precise match for that. Are you trying to resolve a crash, configure Shizuku, or find recommended CVars?`,
            link: "index.html",
            linkText: "Explore Documentation Home"
          };
          renderResponse(loadingEl, fallback);
          renderDisambiguation(loadingEl, query, [
            { id: "troubleshoot-crash-lag", title: "Game Crash / Stutter Fix" },
            { id: "cvars-recommended", title: "Recommended CVars" },
            { id: "elevated-backends", title: "Shizuku & Root Setup" }
          ]);
          return;
        }

        const topMatch = matches[0];
        renderResponse(loadingEl, topMatch.doc.response);

        contextHistory.push({ role: 'user', text: query });
        contextHistory.push({ role: 'assistant', text: topMatch.doc.response.text });
        saveContextHistory(contextHistory);

        // Ambiguity check: if 2nd result score is close, offer disambiguation/learning
        if (matches.length > 1 && (topMatch.score - matches[1].score) < 0.6) {
          renderDisambiguation(loadingEl, query, [
            { id: topMatch.doc.id, title: topMatch.doc.title || topMatch.doc.id },
            { id: matches[1].doc.id, title: matches[1].doc.title || matches[1].doc.id }
          ]);
        }
      }, 70);
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

    function scrollToBottom() { messages.scrollTop = messages.scrollHeight; }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
  }

  function initAiChat() { renderWidgetDOM(); }
  window.WuWaAiChat = { initAiChat };
})(window);