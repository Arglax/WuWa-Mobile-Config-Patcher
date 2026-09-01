/**
 * WuWa Mobile Config Patcher - Floating AI Chat Assistant Widget
 * Features: Local intent skill matching, optional free Gemini API mode,
 * and automatic Toxicity Moderation Guard with 3-Strike Warning & 1-Hour Soft Ban.
 */
(function (window) {
  'use strict';

  const GEMINI_KEY_STORAGE = 'wuwa_gemini_api_key';
  const STRIKE_STORAGE = 'wuwa_ai_strikes';
  const BAN_STORAGE = 'wuwa_ai_ban_until';

  const TOXICITY_REGEX = /\b(fuck|fucking|fucker|fuk|shit|shitting|shitty|bitch|asshole|bastard|idiot|stupid|dumb|dumbass|stfu|cunt|dick|pussy|shut\s*up|hate\s*you|useless\s*bot|garbage\s*bot|trash\s*bot)\b/i;

  const AI_SYSTEM_PROMPT = `You are WuWa Assistant, an expert AI helper for the Android app 'WuWa Config Patcher' (v1.5.0, package io.github.arglax.configpatcher).
App Summary:
- 1-Click Patching: Injects graphics INIs into Wuthering Waves scoped storage via Shizuku/Root.
- Elevated Access Backends: ROOT (Red), SHIZUKU (Green), AXMANAGER (Blue), SHIZUKU_UNAUTHORIZED (Orange), NONE (Gray).
- Recommended CVars: r.MobileContentScaleFactor (0.8-1.5), r.ShadowQuality (0-3), r.BloomQuality (0-1), r.VSync (0/1), r.VolumetricFog (0), s.AsyncLoadingThreadEnabled (1).
- Recommended RAM: 8GB+ RAM required for C# Environment & High/Extreme presets; 6GB for Medium/Stable; <6GB for Low/Vanilla.
- Live Config Editor: Smart Mode (A-Z sort, auto-fix, bulk delete), Text Mode (isolation search, font slider), One-Line Mode.
- Section Guards (CVarSectionGuard.kt): Enforces canonical section headers (r. -> RendererSettings, s. -> StreamingSettings, gc. -> GarbageCollectionSettings, cook. -> CookerSettings, SystemSettings). Misplaced CVars highlighted in Vibrant Red (#FF2222).
- Force C# Environment: Flag -ForceEnableCSharpEnvironment in UE4CommandLine.txt (Requires 8GB+ RAM). Verified by asterisk (*) in client version.
- Common Utilities: Decrypted Log Explorer (Client.log), Get Device Info (GPU, RAM, Device Score), Log Decryptor (Scheme A 0xA5/0xEF, Scheme B 0x55), Delete Logs (rm -rf), Revert to Vanilla.
- Advanced Tools (advanced-tools.html): CVar Analyzer (CVarAnalyzer.kt), 1000+ CVar Bank (AlteriaX), Duplicate Flagger, Forbidden CVar Stripper, Log CVar Extractor, Main Storage Reader.
- Support & Settings: Activity Logger (activity_log.txt), Bug Report Generator (BugReportDialog.kt), Settings Danger Zone (Clear Cache/Data/Logs/Delete Shaders).

Answer user questions clearly, concisely, with formatting and direct links. Always maintain polite and helpful tone.`;

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

  function getLocalAnswer(query) {
    if (window.WuWaAiKnowledge && window.WuWaAiKnowledge.findBestMatch) {
      return window.WuWaAiKnowledge.findBestMatch(query);
    }
    return {
      text: `I'm the WuWa Config Patcher AI Assistant! Ask me about recommended CVars, RAM requirements, Shizuku setup, C# Environment, or Section Guards.`,
      link: "index.html",
      linkText: "Explore Documentation Home"
    };
  }

  async function queryGeminiApi(apiKey, userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${AI_SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}` }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

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
      <!-- Floating Action Button -->
      <button id="ai-chat-fab" class="ai-chat-fab" aria-label="Open AI Assistant Chat" title="Open WuWa AI Assistant">
        <span class="fab-icon">💬</span>
        <span class="fab-label">AI Assistant</span>
      </button>

      <!-- Floating Chat Window -->
      <div id="ai-chat-window" class="ai-chat-window hidden" role="dialog" aria-modal="true">
        <!-- Chat Header -->
        <div class="ai-chat-header">
          <div class="header-info">
            <span class="ai-avatar">🤖</span>
            <div>
              <h4>WuWa AI Assistant</h4>
              <span class="ai-status">Online • Knowledge v1.5.0</span>
            </div>
          </div>
          <div class="header-actions">
            <button id="ai-chat-settings-btn" class="chat-header-btn" title="API Settings">⚙️</button>
            <button id="ai-chat-close-btn" class="chat-header-btn" title="Close Chat">&times;</button>
          </div>
        </div>

        <!-- Settings Modal Inside Chat -->
        <div id="ai-chat-settings" class="ai-chat-settings hidden">
          <h5>Gemini API Settings (Optional)</h5>
          <p>Supply a free Google Gemini API Key for dynamic AI responses. If omitted, instant zero-latency local knowledge search is used.</p>
          <input type="password" id="gemini-api-key-input" placeholder="Paste Gemini API Key (AIzaSy...)" autocomplete="off">
          <div class="settings-btn-row">
            <button id="save-gemini-key-btn" class="btn-chat-action">Save Key</button>
            <button id="clear-gemini-key-btn" class="btn-chat-secondary">Clear</button>
          </div>
        </div>

        <!-- Chat Messages Area -->
        <div id="ai-chat-messages" class="ai-chat-messages">
          <div class="chat-msg msg-ai">
            <div class="msg-bubble">
              👋 Hello! I am your <strong>WuWa Config Patcher AI Assistant</strong>. Ask me anything about recommended CVars, RAM requirements, Shizuku setup, Live Config Editor, C# Environment, or Log Diagnostics!
            </div>
          </div>

          <!-- Prompt Chips -->
          <div class="prompt-chips-container" id="prompt-chips-container">
            ${QUICK_PROMPTS.map(p => `
              <button class="prompt-chip" data-query="${p.query}">${p.label}</button>
            `).join('')}
          </div>
        </div>

        <!-- Chat Input Row -->
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

    // Check Ban Status on Widget Open
    fab.addEventListener('click', () => {
      windowEl.classList.toggle('hidden');
      if (!windowEl.classList.contains('hidden')) {
        const status = checkBanStatus();
        if (status.banned) {
          lockInput(`Suspended (${status.remainingMinutes}m remaining)`);
          appendSystemMsg(`🚫 System Notice: The AI Assistant is currently suspended due to conduct violations. Please try again in ${status.remainingMinutes} minute(s).`);
        } else {
          unlockInput();
          input.focus();
        }
      }
    });

    closeBtn.addEventListener('click', () => windowEl.classList.add('hidden'));

    // Toggle Settings
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
        appendSystemMsg("Gemini API key saved! AI responses will now use live Gemini 1.5 Flash.");
      } else {
        localStorage.removeItem(GEMINI_KEY_STORAGE);
        appendSystemMsg("Gemini API key cleared. Using instant local knowledge search.");
      }
      settingsEl.classList.add('hidden');
    });

    clearKeyBtn.addEventListener('click', () => {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
      apiKeyInput.value = '';
      appendSystemMsg("Gemini API key cleared. Using instant local knowledge search.");
      settingsEl.classList.add('hidden');
    });

    // Prompt Chips
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        handleUserQuery(query);
      });
    });

    // Form Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (query) {
        handleUserQuery(query);
        input.value = '';
      }
    });

    async function handleUserQuery(query) {
      // 1. Check Ban Status First
      const status = checkBanStatus();
      if (status.banned) {
        appendUserMsg(query);
        lockInput(`Suspended (${status.remainingMinutes}m remaining)`);
        appendSystemMsg(`🚫 System Notice: The AI Assistant is currently suspended due to conduct violations. Please try again in ${status.remainingMinutes} minute(s).`);
        return;
      }

      // 2. Check Toxicity & Swearing Guard
      if (TOXICITY_REGEX.test(query)) {
        appendUserMsg(query);
        let strikes = parseInt(localStorage.getItem(STRIKE_STORAGE) || '0', 10) + 1;
        localStorage.setItem(STRIKE_STORAGE, strikes.toString());

        if (strikes === 1) {
          appendSystemMsg(`⚠️ Warning (1/3): Please refrain from using offensive language or swearing. Let's keep the conversation respectful.`);
        } else if (strikes === 2) {
          appendSystemMsg(`⚠️ Warning (2/3): Final warning. Continued profanity or abusive language will result in an immediate 1-hour AI Assistant suspension.`);
        } else {
          const banUntil = Date.now() + 3600000; // 1 hour
          localStorage.setItem(BAN_STORAGE, banUntil.toString());
          lockInput("Suspended (60m remaining)");
          appendSystemMsg(`🚫 System Notice: Due to repeated violations of respectful conduct guidelines, the AI Assistant has been suspended for 1 hour. Please return later.`);
        }
        return;
      }

      // 3. Normal Query Processing
      appendUserMsg(query);

      const apiKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      const loadingEl = appendAiMsg("Thinking...");

      if (apiKey) {
        try {
          const aiResponse = await queryGeminiApi(apiKey, query);
          const formatted = window.WuWaFormatter ? window.WuWaFormatter.formatText(aiResponse) : aiResponse;

          const localFallback = getLocalAnswer(query);
          let linkHtml = '';
          if (localFallback && localFallback.link) {
            const resolved = resolvePath(localFallback.link);
            linkHtml = `<br><a href="${resolved}" class="chat-doc-link">🔗 ${localFallback.linkText} →</a>`;
          }

          loadingEl.querySelector('.msg-bubble').innerHTML = formatted.replace(/\n/g, '<br>') + linkHtml;
          scrollToBottom();
          return;
        } catch (err) {
          console.warn("Gemini API failed, using local knowledge fallback.", err);
        }
      }

      // Zero-Latency Local Intent Knowledge Search
      setTimeout(() => {
        const localRes = getLocalAnswer(query);
        const resolved = resolvePath(localRes.link);
        const textFormatted = window.WuWaFormatter ? window.WuWaFormatter.formatText(localRes.text) : localRes.text;
        const html = `${textFormatted}<br><a href="${resolved}" class="chat-doc-link">🔗 ${localRes.linkText} →</a>`;

        loadingEl.querySelector('.msg-bubble').innerHTML = html;
        scrollToBottom();
      }, 120);
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
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  function initAiChat() {
    renderWidgetDOM();
  }

  window.WuWaAiChat = { initAiChat };
})(window);
