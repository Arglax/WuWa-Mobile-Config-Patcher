/**
 * WuWa Mobile Config Patcher - Floating AI Chat Assistant Widget
 * Features: 5-Message Conversation Context Window, BM25 Offline Search,
 * Gemini API Multi-Turn Chat, Remediation Disambiguation, and 3-Strike Toxicity Guard.
 */
(function (window) {
  'use strict';

  const GEMINI_KEY_STORAGE = 'wuwa_gemini_api_key';
  const STRIKE_STORAGE = 'wuwa_ai_strikes';
  const BAN_STORAGE = 'wuwa_ai_ban_until';
  const CONTEXT_STORAGE = 'wuwa_ai_context_history';
  const MAX_CONTEXT_TURNS = 25;

  const TOXICITY_REGEX = /\b(fuck|fucking|fucker|fuk|shit|shitting|shitty|bitch|asshole|bastard|idiot|stupid|dumb|dumbass|stfu|cunt|dick|pussy|shut\s*up|hate\s*you|useless\s*bot|garbage\s*bot|trash\s*bot)\b/i;

  const AI_SYSTEM_PROMPT = `You are WuWa Assistant, an expert AI helper for the Android app 'WuWa Config Patcher' (v1.5.1, package io.github.arglax.configpatcher, developed by Arglax).
Core Knowledge Summary:
- 1-Click Patching: Injects graphic INIs (Engine.ini, DeviceProfiles.ini, Scalability.ini) into scoped storage via Shizuku/Root. Backup snapshot created in app_main_storage/backups/.
- Elevation Backends: ROOT (Red #E35D6A), SHIZUKU (Green #47D764), AXMANAGER (Blue #2AA37D), SHIZUKU_UNAUTHORIZED (Orange #F7C948), NONE (Gray #A8B4AF).
- Live Config Editor: Smart Mode (A-Z sort, auto-fix, bulk delete), Text Mode (isolation search, font slider, defensive OffsetMapping crash protection for \\r\\n), One-Line Mode.
- Section Guards (CVarSectionGuard.kt): Enforces canonical section headers (r. -> RendererSettings, s. -> StreamingSettings, gc. -> GarbageCollectionSettings, cook. -> CookerSettings, SystemSettings). Misplaced CVars highlighted in Vibrant Red (#FF2222). Engine.ini prefixes auto-stripped.
- C# Environment: -ForceEnableCSharpEnvironment in UE4CommandLine.txt (Requires 8GB+ RAM). Confirmed by asterisk (*) on client splash screen and Sharphereal in Client.log.
- Utilities: Decrypted Log Explorer (Client.log with line numbers & filter chips), Get Device Info (GPU, RAM, Device Score, C# env), Log Decryptor (Scheme A XOR 0xA5/0xEF, Scheme B XOR 0x55, Plaintext), Delete Logs (rm -rf), Revert to Vanilla (deletes modified INIs to restore clean defaults).
- Advanced Tools: CVar Analyzer (cross-checks active INIs against decrypted log), 1000+ CVar Bank (AlteriaX Pastebin & UE Docs), Duplicate Flagger, Strip Forbidden (auto-strips 51 WuWa v3.6 forbidden CVars), Log CVar Extractor, Main Storage Reader.
- Danger Zone: Delete Shaders (VulkanProgramBinaryCache & ProgramBinaryCache), Clear Cache/Data/Activity Log.
- Troubleshooting Hierarchy: If user describes a bug/crash:
  1. Suggest Reverting to Vanilla (Utilities > Common > Vanilla mode).
  2. Suggest Deleting Shaders (Settings > Danger Zone > Delete Shaders).
  3. Suggest checking RAM requirements (turn off C# if <8GB RAM).
  4. Suggest running Strip Forbidden in Advanced Tools.
  5. Only if all self-remediation steps fail, instruct user to open Bug Report Generator (Support > Report a Bug) to send activity_log.txt and hardware diagnostics to developer Arglax on Discord or GitHub.

Answer user questions clearly, accurately, with markdown formatting and direct documentation links. Maintain a polite and helpful tone.`;

  const QUICK_PROMPTS = [
    { label: "🛠️ Recommended CVars", query: "what cvars can i put" },
    { label: "📱 RAM & Hardware", query: "recommended ram" },
    { label: "⚡ Shizuku Setup", query: "How do I setup Shizuku?" },
    { label: "🚀 C# Environment", query: "How to enable C# Environment?" },
    { label: "🛡️ Section Guards", query: "What are CVar Section Guards?" },
    { label: "🔍 CVar Analyzer", query: "How does CVar Analyzer work?" }
  ];

  // Conversation Context Memory Management
  function loadContextHistory() {
    try {
      return JSON.parse(sessionStorage.getItem(CONTEXT_STORAGE) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveContextHistory(history) {
    try {
      sessionStorage.setItem(CONTEXT_STORAGE, JSON.stringify(history.slice(-MAX_CONTEXT_TURNS * 2)));
    } catch (e) {}
  }

  function resolvePath(targetUrl) {
    if (window.WuWaPathResolver && window.WuWaPathResolver.resolvePath) {
      return window.WuWaPathResolver.resolvePath(targetUrl);
    }
    return targetUrl;
  }

  async function queryGeminiApi(apiKey, userPrompt, contextHistory) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    
    // Assemble system prompt and up to 5 prior message turns
    const contents = [
      { role: "user", parts: [{ text: AI_SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Understood. I am ready to assist users of WuWa Config Patcher with full technical accuracy." }] }
    ];

    contextHistory.slice(-MAX_CONTEXT_TURNS * 2).forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      });
    });

    contents.push({
      role: "user",
      parts: [{ text: userPrompt }]
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
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
              <span class="ai-status">Online • Knowledge v1.5.1 (Context Memory)</span>
            </div>
          </div>
          <div class="header-actions">
            <button id="ai-chat-clear-btn" class="chat-header-btn" title="Clear Conversation History">🗑️</button>
            <button id="ai-chat-settings-btn" class="chat-header-btn" title="API Settings">⚙️</button>
            <button id="ai-chat-close-btn" class="chat-header-btn" title="Close Chat">&times;</button>
          </div>
        </div>

        <div id="ai-chat-settings" class="ai-chat-settings hidden">
          <h5>Gemini API Settings (Optional)</h5>
          <p>Supply a free Google Gemini API Key for multi-turn generative conversation. If omitted, instant zero-latency local BM25 ranking is used.</p>
          <input type="password" id="gemini-api-key-input" placeholder="Paste Gemini API Key (AIzaSy...)" autocomplete="off">
          <div class="settings-btn-row">
            <button id="save-gemini-key-btn" class="btn-chat-action">Save Key</button>
            <button id="clear-gemini-key-btn" class="btn-chat-secondary">Clear</button>
          </div>
        </div>

        <div id="ai-chat-messages" class="ai-chat-messages">
          <div class="chat-msg msg-ai">
            <div class="msg-bubble">
              👋 Hello! I am your <strong>WuWa Config Patcher Assistant</strong>. Ask me anything about CVars, RAM recommendations, Shizuku setup, C# Environment, or resolving game crashes!
            </div>
          </div>

          <div class="prompt-chips-container" id="prompt-chips-container">
            ${QUICK_PROMPTS.map(p => `<button class="prompt-chip" data-query="${p.query}">${p.label}</button>`).join('')}
          </div>
        </div>

        <form id="ai-chat-form" class="ai-chat-input-row">
          <input type="text" id="ai-chat-input" placeholder="Ask a question about the app or troubleshooting..." autocomplete="off">
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

    function lockInput(placeholderText) {
      input.disabled = true;
      sendBtn.disabled = true;
      input.placeholder = placeholderText || "AI Assistant temporarily suspended.";
    }

    function unlockInput() {
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = "Ask a question about the app or troubleshooting...";
    }

    fab.addEventListener('click', () => {
      windowEl.classList.toggle('hidden');
      if (!windowEl.classList.contains('hidden')) {
        const status = checkBanStatus();
        if (status.banned) {
          lockInput(`Suspended (${status.remainingMinutes}m remaining)`);
          appendSystemMsg(`🚫 System Notice: The AI Assistant is temporarily suspended. Please return in ${status.remainingMinutes} minute(s).`);
        } else {
          unlockInput();
          input.focus();
        }
      }
    });

    closeBtn.addEventListener('click', () => windowEl.classList.add('hidden'));

    // Clear context history
    clearBtn.addEventListener('click', () => {
      sessionStorage.removeItem(CONTEXT_STORAGE);
      appendSystemMsg("🧹 Conversation history cleared. New topic context started.");
    });

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
        appendSystemMsg("Gemini API key saved! Multi-turn Gemini 1.5 Flash activated.");
      } else {
        localStorage.removeItem(GEMINI_KEY_STORAGE);
        appendSystemMsg("Gemini API key cleared. Instant offline BM25 knowledge search activated.");
      }
      settingsEl.classList.add('hidden');
    });

    clearKeyBtn.addEventListener('click', () => {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
      apiKeyInput.value = '';
      appendSystemMsg("Gemini API key cleared. Instant offline BM25 knowledge search activated.");
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
        appendSystemMsg(`🚫 Suspended (${status.remainingMinutes}m remaining).`);
        return;
      }

      if (TOXICITY_REGEX.test(query)) {
        appendUserMsg(query);
        let strikes = parseInt(localStorage.getItem(STRIKE_STORAGE) || '0', 10) + 1;
        localStorage.setItem(STRIKE_STORAGE, strikes.toString());

        if (strikes === 1) {
          appendSystemMsg(`⚠️ Warning (1/3): Please keep the conversation respectful.`);
        } else if (strikes === 2) {
          appendSystemMsg(`⚠️ Warning (2/3): Final warning. Continued profanity will trigger a 1-hour suspension.`);
        } else {
          localStorage.setItem(BAN_STORAGE, (Date.now() + 3600000).toString());
          lockInput("Suspended (60m remaining)");
          appendSystemMsg(`🚫 Suspended for 1 hour due to repeated conduct violations.`);
        }
        return;
      }

      appendUserMsg(query);
      const contextHistory = loadContextHistory();
      const apiKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      const loadingEl = appendAiMsg("Thinking...");

      // 1. Live Gemini Mode (Generative + Multi-Turn)
      if (apiKey) {
        try {
          const aiResponse = await queryGeminiApi(apiKey, query, contextHistory);
          const formatted = window.WuWaFormatter ? window.WuWaFormatter.formatText(aiResponse) : aiResponse;
          loadingEl.querySelector('.msg-bubble').innerHTML = formatted.replace(/\n/g, '<br>');
          
          contextHistory.push({ role: 'user', text: query });
          contextHistory.push({ role: 'assistant', text: aiResponse });
          saveContextHistory(contextHistory);
          
          scrollToBottom();
          return;
        } catch (err) {
          console.warn("Gemini API failed, switching to local BM25 engine.", err);
        }
      }

      // 2. Local BM25 Engine with Context Memory
      setTimeout(() => {
        if (!window.WuWaAiKnowledge) {
          loadingEl.querySelector('.msg-bubble').textContent = "Knowledge engine initializing, please retry.";
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

        // Update context window
        contextHistory.push({ role: 'user', text: query });
        contextHistory.push({ role: 'assistant', text: topMatch.doc.response.text });
        saveContextHistory(contextHistory);

        // Ambiguity Check: If 2nd result score is very close, display disambiguation learning buttons
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