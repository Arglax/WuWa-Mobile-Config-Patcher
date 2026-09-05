/**
 * WuWa Config Patcher - Floating AI Chat Assistant Widget (v1.7.5)
 * Enhanced with Dynamic i18n Localization & Multilingual Cloud AI Prompts.
 */
(function (window) {
  'use strict';

  const WORKER_PROXY_URL = 'wuwa-ai-proxy.arglaxaqw.workers.dev';

  const GEMINI_KEY_STORAGE = 'wuwa_gemini_api_key';
  const STRIKE_STORAGE = 'wuwa_ai_strikes';
  const BAN_STORAGE = 'wuwa_ai_ban_until';
  const CONTEXT_STORAGE = 'wuwa_ai_context_history';
  const MAX_CONTEXT_TURNS = 25;
  const BAN_DURATION_MS = 3600000;
  const CLOUD_TIMEOUT_MS = 30000;

  function t(key, fallback = '', replacements = {}) {
    if (window.WuWaI18n && window.WuWaI18n.t) {
      return window.WuWaI18n.t(key, fallback, replacements);
    }
    let res = fallback || key;
    if (replacements && typeof res === 'string') {
      Object.keys(replacements).forEach(k => {
        res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), replacements[k]);
      });
    }
    return res;
  }

  function normalizeWorkerUrl(url) {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  const TOXICITY_REGEX = /\b(fuck|fucking|fucker|fuk|shit|shitting|shitty|bitch|asshole|bastard|idiot|stupid|dumb|dumbass|stfu|cunt|dick|pussy|shut\s*up|hate\s*you|useless\s*bot|garbage\s*bot|trash\s*bot)\b/i;

  function getQuickPrompts() {
    return [
      { key: "prompt_cvars", label: t("prompt_cvars", "🛠️ Recommended CVars"), query: "what cvars can i put" },
      { key: "prompt_ram", label: t("prompt_ram", "📱 RAM & Hardware"), query: "recommended ram" },
      { key: "prompt_shizuku", label: t("prompt_shizuku", "⚡ Shizuku Setup"), query: "How do I setup Shizuku?" },
      { key: "prompt_csharp", label: t("prompt_csharp", "🚀 C# Environment"), query: "How to enable C# Environment?" },
      { key: "prompt_guards", label: t("prompt_guards", "🛡️ Section Guards"), query: "What are CVar Section Guards?" },
      { key: "prompt_analyzer", label: t("prompt_analyzer", "🔍 CVar Analyzer"), query: "How does CVar Analyzer work?" }
    ];
  }

  function loadContextHistory() {
    try { return JSON.parse(sessionStorage.getItem(CONTEXT_STORAGE) || '[]'); }
    catch (e) { return []; }
  }

  function saveContextHistory(history) {
    try { sessionStorage.setItem(CONTEXT_STORAGE, JSON.stringify(history.slice(-MAX_CONTEXT_TURNS * 2))); }
    catch (e) {}
  }

  function resolvePath(targetUrl) {
    if (!targetUrl) return '#';
    if (window.WuWaPathResolver && window.WuWaPathResolver.resolvePath) {
      return window.WuWaPathResolver.resolvePath(targetUrl);
    }
    return targetUrl;
  }

  function markdownToHtml(text) {
    if (!text) return '';
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function formatMessageHtml(rawHtml) {
    if (!rawHtml) return rawHtml;

    const preprocessed = rawHtml
      .replace(/\r\n/g, '\n')
      .replace(/\n\n+/g, '<br><br>')
      .replace(/\n/g, '<br>');

    const normalized = preprocessed
      .replace(/(<br\s*\/?>\s*){2,}/gi, '@@PARA@@')
      .replace(/<br\s*\/?>/gi, '@@LINE@@');

    const paragraphs = normalized.split('@@PARA@@').map(p => p.trim()).filter(Boolean);

    const htmlParas = paragraphs.map(para => {
      const lines = para.split('@@LINE@@').map(l => l.trim()).filter(Boolean);
      let out = '';
      let listBuffer = [];
      let listType = null;

      function flushList() {
        if (listBuffer.length) {
          out += `<${listType} class="msg-list">${listBuffer.map(li => `<li>${li}</li>`).join('')}</${listType}>`;
          listBuffer = [];
          listType = null;
        }
      }

      lines.forEach(line => {
        const bulletMatch = line.match(/^[•\-*]\s+(.*)$/);
        const numberedMatch = line.match(/^(\d+)[.)]\s*(.*)$/);
        const isCallout = /^⚠️/.test(line);

        if (bulletMatch) {
          if (listType && listType !== 'ul') flushList();
          listType = 'ul';
          listBuffer.push(bulletMatch[1]);
        } else if (numberedMatch) {
          if (listType && listType !== 'ol') flushList();
          listType = 'ol';
          listBuffer.push(numberedMatch[2]);
        } else {
          flushList();
          out += isCallout
            ? `<p class="msg-callout">${line}</p>`
            : `<p class="msg-line">${line}</p>`;
        }
      });
      flushList();

      return `<div class="msg-para">${out}</div>`;
    });

    return htmlParas.join('');
  }

  function ensureHyperlink(responseText, userQuery, contextHistory) {
    const hasLink = /\[[^\]]+\]\([^)]+\)/.test(responseText);
    if (hasLink) return responseText;
    if (!window.WuWaAiKnowledge || !window.WuWaAiKnowledge.getRankedMatches) return responseText;

    const { matches, learnedMatch } = window.WuWaAiKnowledge.getRankedMatches(userQuery, contextHistory);
    const top = learnedMatch ? learnedMatch.response : (matches && matches[0] ? matches[0].doc.response : null);
    if (!top || !top.link) return responseText;

    return `${responseText}\n\n[${top.linkText || t('ai_doc_link_text', 'View Documentation')}](${top.link})`;
  }

  function extractLinkBlock(aiResponse) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match, lastMatch = null;
    while ((match = linkRegex.exec(aiResponse)) !== null) lastMatch = match;

    if (!lastMatch) return { bodyText: aiResponse, linkHtml: '' };

    const bodyText = aiResponse.slice(0, lastMatch.index) + aiResponse.slice(lastMatch.index + lastMatch[0].length);
    const resolved = resolvePath(lastMatch[2]);
    const linkHtml = `<div class="msg-link-block"><a href="${resolved}" class="chat-doc-link">🔗 ${lastMatch[1]} →</a></div>`;
    return { bodyText, linkHtml };
  }

  function buildPriorityContext(userQuery, contextHistory) {
    if (!window.WuWaAiKnowledge || !window.WuWaAiKnowledge.getRankedMatches) return null;
    const { matches } = window.WuWaAiKnowledge.getRankedMatches(userQuery, contextHistory);
    if (!matches || matches.length === 0) return null;

    return matches.slice(0, 4).map((m, i) => ({
      rank: i + 1,
      relevanceScore: Number(m.score.toFixed(2)),
      id: m.doc.id,
      title: m.doc.title,
      link: m.doc.response ? m.doc.response.link : 'index.html',
      linkText: m.doc.response ? m.doc.response.linkText : t('ai_doc_link_text', 'View Documentation'),
      summary: ((m.doc.response && m.doc.response.text) || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 400)
    }));
  }

  function buildTopicIndex() {
    if (!window.WuWaAiKnowledge || !window.WuWaAiKnowledge.getLoadedTopics) return [];
    return window.WuWaAiKnowledge.getLoadedTopics().map(t => ({
      id: t.id,
      title: t.title,
      link: t.response && t.response.link,
      linkText: t.response && t.response.linkText
    }));
  }

  function buildSystemPrompt(userQuery, contextHistory) {
    const priorityMatches = buildPriorityContext(userQuery, contextHistory);
    const topicIndex = buildTopicIndex();
    const curLang = window.WuWaI18n ? window.WuWaI18n.getCurrentLang() : 'en';
    const langConfig = (window.WuWaI18n && window.WuWaI18n.LANGUAGES && window.WuWaI18n.LANGUAGES[curLang])
      ? window.WuWaI18n.LANGUAGES[curLang]
      : { name: 'English', code: 'en' };

    return `You are WuWa Assistant, a friendly and expert AI helper for the Android app 'WuWa Config Patcher' (v1.6.0) developed by Arglax.

CRITICAL LANGUAGE REQUIREMENT:
The user's preferred language is ${langConfig.name} (Code: ${curLang}).
You MUST reply completely, naturally, and accurately in ${langConfig.name}.
Translate all advice, descriptions, steps, and conversational speech into ${langConfig.name}. Keep exact technical terms (e.g. Engine.ini, DeviceProfiles.ini, r.ShadowQuality, -ForceEnableCSharpEnvironment, Shizuku, libsu) in their original technical format.

END-USER APP NAVIGATION ROUTES GUIDE (v1.6.0):
When the user asks where a feature is located or how to navigate to it, provide these exact step-by-step navigation routes:
• Duplicate Flagger: Utilities -> Advanced -> Duplicate Flagger
• CVar Bank & Reference Library: Utilities -> Advanced -> CVar Bank
• Config Analysis Report: Utilities -> Advanced -> Analyze Config
• Auto Strip Forbidden CVars: Utilities -> Advanced -> Strip Forbidden
• Log CVar Extractor: Utilities -> Advanced -> Extract Log CVars
• Main Storage Reader: Utilities -> Advanced -> Main Storage
• Get Device Info & Hardware Stats: Utilities -> Common -> Get Device Info
• Decrypted Log Explorer: Utilities -> Common -> Decrypted Log Explorer
• Decrypt Log: Utilities -> Common -> Decrypt Log
• Revert to Vanilla: Utilities -> Common -> Revert to Vanilla
• View Backend Activity Log: Utilities -> Common -> View Backend Activity Log (or Support -> Report a Bug)
• 1-Click Patching & Presets: Config -> Config Presets -> Select Preset -> 1-Click Patch
• Live Config Editor: Editor -> Config Editor (Switch modes: Smart / Text / One-Line)
• Smart Mode Auto-Fix & A-Z Sort: Editor -> Config Editor -> Smart Mode -> Auto-Fix / Sort A-Z
• Misc Patch (UE Command Line): Editor -> Misc Patch
• App Language Selector: Settings -> App Language
• Check for App Updates: Settings -> Application Info -> Check for Updates
• Grant Root Access: Settings -> Application Info -> Grant Root
• Quick Jumps (Shizuku, Wireless Debugging, WuWaLab): Settings -> Quick Jumps
• Delete Shader Caches: Settings -> Danger Zone -> Delete Shaders
• Report a Bug / Feature Request: Support -> Support -> Report a Bug / Suggest a Feature
• Official Web Documentation & AI Assistant: Support -> Support -> Official Documentation & AI Assistant

PRIORITY_MATCHES (pre-ranked for THIS message by local BM25 search):
${priorityMatches ? JSON.stringify(priorityMatches) : "None."}

FULL_TOPIC_INDEX:
${JSON.stringify(topicIndex)}

RULES:
1. For casual greetings or small talk, respond conversationally and naturally in ${langConfig.name}, skipping any link.
2. For app/technical questions, ground your answer in PRIORITY_MATCHES. Do not invent CVar names or file paths.
3. Hyperlinking: when your answer relies on a documentation page, end your reply with ONE markdown link formatted as [linkText](link).
4. Structure answers with short paragraphs and bullet points.
5. If the user describes a bug/crash, follow the remediation sequence (Vanilla Revert -> Delete Shaders -> Strip Forbidden -> Check RAM -> Report to Arglax).`;
  }

  async function queryAI(userPrompt, contextHistory, customApiKey) {
    const dynamicPrompt = buildSystemPrompt(userPrompt, contextHistory);
    const contents = [
      { role: "user", parts: [{ text: dynamicPrompt }] },
      { role: "model", parts: [{ text: "Understood. I will converse naturally, translate all explanations into the specified language, and adhere to the PRIORITY_MATCHES grounding." }] }
    ];

    contextHistory.slice(-MAX_CONTEXT_TURNS * 2).forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      });
    });

    contents.push({ role: "user", parts: [{ text: userPrompt }] });

    const targetUrl = customApiKey
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(customApiKey)}`
      : normalizeWorkerUrl(WORKER_PROXY_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CLOUD_TIMEOUT_MS);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts.map(p => p.text).join('\n');
      }
      throw new Error('Invalid AI response structure');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function checkBanStatus() {
    const banUntil = parseInt(localStorage.getItem(BAN_STORAGE) || '0', 10);
    if (banUntil && Date.now() < banUntil) {
      return { banned: true, remainingMinutes: Math.ceil((banUntil - Date.now()) / 60000) };
    }
    if (banUntil && Date.now() >= banUntil) {
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

  const RESPONSE_FORMATTING_STYLE = `
    #ai-chat-root .msg-bubble { line-height: 1.55; }
    #ai-chat-root .msg-para { margin: 0 0 10px 0; }
    #ai-chat-root .msg-para:last-child { margin-bottom: 0; }
    #ai-chat-root .msg-line { margin: 0 0 6px 0; }
    #ai-chat-root .msg-line:last-child { margin-bottom: 0; }
    #ai-chat-root .msg-list { margin: 4px 0 10px 20px; padding: 0; }
    #ai-chat-root .msg-list:last-child { margin-bottom: 0; }
    #ai-chat-root .msg-list li { margin-bottom: 5px; line-height: 1.5; }
    #ai-chat-root .msg-list li:last-child { margin-bottom: 0; }
    #ai-chat-root .msg-callout {
      background: rgba(245, 158, 11, 0.12);
      border-left: 3px solid #f59e0b;
      padding: 6px 10px;
      border-radius: 4px;
      margin: 8px 0 10px 0;
    }
    #ai-chat-root .msg-bubble code {
      background: rgba(127, 127, 127, 0.16);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    #ai-chat-root .msg-link-block { margin-top: 10px; }
    #ai-chat-root .chat-doc-link { display: inline-block; }
    #ai-chat-root .clarify-box {
      margin-top: 10px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px dashed rgba(127, 127, 127, 0.4);
      border-radius: 6px;
      font-size: 0.85em;
    }
  `;

  function renderWidgetDOM() {
    if (document.getElementById('ai-chat-root')) return;

    const root = document.createElement('div');
    root.id = 'ai-chat-root';
    root.innerHTML = `
      <style>${RESPONSE_FORMATTING_STYLE}</style>
      <button id="ai-chat-fab" class="ai-chat-fab" aria-label="Open AI Assistant" title="Open AI Assistant">
        <span class="fab-icon">💬</span>
        <span class="fab-label" id="ai-chat-fab-label">${t('ai_fab_label', 'AI Assistant')}</span>
      </button>

      <div id="ai-chat-window" class="ai-chat-window hidden" role="dialog" aria-modal="true">
        <div class="ai-chat-header">
          <div class="header-info">
            <span class="ai-avatar">🤖</span>
            <div>
              <h4 id="ai-chat-header-title">${t('ai_assistant_title', 'WuWa AI Assistant')}</h4>
              <span id="ai-connection-status" class="ai-status">${t('ai_status_checking', 'Checking connection...')}</span>
            </div>
          </div>
          <div class="header-actions">
            <button id="ai-chat-clear-btn" class="chat-header-btn" title="Clear History">🗑️</button>
            <button id="ai-chat-settings-btn" class="chat-header-btn" title="API Settings">⚙️</button>
            <button id="ai-chat-close-btn" class="chat-header-btn" title="Close">&times;</button>
          </div>
        </div>

        <div id="ai-chat-settings" class="ai-chat-settings hidden">
          <h5 id="ai-settings-title">${t('ai_settings_title', 'Custom Gemini API Settings (Optional)')}</h5>
          <p id="ai-settings-desc">${t('ai_settings_desc', 'The assistant works automatically online for free. Paste a personal key to use your own quota.')}</p>
          <input type="password" id="gemini-api-key-input" placeholder="${t('ai_settings_placeholder', 'Paste Gemini API Key (AQ... or AIza...)')}" autocomplete="off">
          <div class="settings-btn-row">
            <button id="save-gemini-key-btn" class="btn-chat-action">${t('ai_btn_save_key', 'Save Key')}</button>
            <button id="clear-gemini-key-btn" class="btn-chat-secondary">${t('ai_btn_use_default', 'Use Default')}</button>
          </div>
        </div>

        <div id="ai-chat-messages" class="ai-chat-messages">
          <div class="chat-msg msg-ai" id="ai-chat-welcome-msg">
            <div class="msg-bubble">
              ${t('ai_msg_welcome', '👋 Hello! I am your <strong>WuWa Config Patcher Assistant</strong>. Ask me anything about presets, CVars, Shizuku, or game troubleshooting!')}
            </div>
          </div>
          <div class="prompt-chips-container" id="prompt-chips-container">
            ${getQuickPrompts().map(p => `<button class="prompt-chip" data-key="${p.key}" data-query="${p.query}">${p.label}</button>`).join('')}
          </div>
        </div>

        <form id="ai-chat-form" class="ai-chat-input-row">
          <input type="text" id="ai-chat-input" placeholder="${t('ai_input_placeholder', 'Ask a question...')}" autocomplete="off">
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
    const promptChipsContainer = document.getElementById('prompt-chips-container');

    function lockInput(placeholderText) {
      input.disabled = true;
      sendBtn.disabled = true;
      input.placeholder = placeholderText || t('ai_suspended', 'AI Assistant temporarily suspended.');
    }

    function unlockInput() {
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = t('ai_input_placeholder', 'Ask a question...');
    }

    function updateStatusIndicator() {
      const customKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      if (!navigator.onLine) {
        statusEl.textContent = t('ai_status_offline', 'Offline • Local Hybrid Engine Active');
        statusEl.style.color = "#f59e0b";
      } else if (customKey) {
        statusEl.textContent = t('ai_status_online_custom', 'Online • Custom Gemini Key Active');
        statusEl.style.color = "#10b981";
      } else {
        statusEl.textContent = t('ai_status_online_shared', 'Online • Shared Assistant Active');
        statusEl.style.color = "#10b981";
      }
    }

    function updateLocalizedUI() {
      const fabLabel = document.getElementById('ai-chat-fab-label');
      const headerTitle = document.getElementById('ai-chat-header-title');
      const settingsTitle = document.getElementById('ai-settings-title');
      const settingsDesc = document.getElementById('ai-settings-desc');

      if (fabLabel) fabLabel.textContent = t('ai_fab_label', 'AI Assistant');
      if (headerTitle) headerTitle.textContent = t('ai_assistant_title', 'WuWa AI Assistant');
      if (settingsTitle) settingsTitle.textContent = t('ai_settings_title', 'Custom Gemini API Settings (Optional)');
      if (settingsDesc) settingsDesc.textContent = t('ai_settings_desc', 'The assistant works automatically online for free. Paste a personal key to use your own quota.');
      if (apiKeyInput) apiKeyInput.placeholder = t('ai_settings_placeholder', 'Paste Gemini API Key (AQ... or AIza...)');
      if (saveKeyBtn) saveKeyBtn.textContent = t('ai_btn_save_key', 'Save Key');
      if (clearKeyBtn) clearKeyBtn.textContent = t('ai_btn_use_default', 'Use Default');

      if (!input.disabled) {
        input.placeholder = t('ai_input_placeholder', 'Ask a question...');
      }

      if (promptChipsContainer) {
        promptChipsContainer.innerHTML = getQuickPrompts()
          .map(p => `<button class="prompt-chip" data-key="${p.key}" data-query="${p.query}">${p.label}</button>`)
          .join('');
        bindPromptChips();
      }

      updateStatusIndicator();
    }

    window.addEventListener('online', updateStatusIndicator);
    window.addEventListener('offline', updateStatusIndicator);
    window.addEventListener('wuwa:langchange', updateLocalizedUI);

    fab.addEventListener('click', () => {
      windowEl.classList.toggle('hidden');
      if (!windowEl.classList.contains('hidden')) {
        updateStatusIndicator();
        const status = checkBanStatus();
        if (status.banned) {
          lockInput(t('ai_suspended', `Suspended (${status.remainingMinutes}m remaining)`, { m: status.remainingMinutes }));
        } else {
          unlockInput();
          input.focus();
        }
      }
    });

    closeBtn.addEventListener('click', () => windowEl.classList.add('hidden'));

    clearBtn.addEventListener('click', () => {
      sessionStorage.removeItem(CONTEXT_STORAGE);
      appendSystemMsg(t('ai_clear_history', "🧹 Conversation history cleared."));
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
      appendSystemMsg(t('ai_key_saved', "✓ Custom Gemini API key saved."));
    });

    clearKeyBtn.addEventListener('click', () => {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
      apiKeyInput.value = '';
      settingsEl.classList.add('hidden');
      updateStatusIndicator();
      appendSystemMsg(t('ai_key_cleared', "✓ Reset to default shared assistant proxy."));
    });

    function bindPromptChips() {
      document.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.onclick = () => handleUserQuery(chip.getAttribute('data-query'));
      });
    }
    bindPromptChips();

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
        const banMsg = t('ai_suspended', `Suspended (${status.remainingMinutes}m remaining)`, { m: status.remainingMinutes });
        lockInput(banMsg);
        appendSystemMsg(`🚫 ${banMsg}`);
        return;
      }

      if (TOXICITY_REGEX.test(query)) {
        appendUserMsg(query);
        const strikes = registerToxicStrike();
        if (strikes === 1) {
          appendSystemMsg(t('ai_warning_1', "⚠️ Warning (1/3): Please keep the conversation respectful."));
        } else if (strikes === 2) {
          appendSystemMsg(t('ai_warning_2', "⚠️ Warning (2/3): Final warning. Continued profanity will trigger a 1-hour suspension."));
        } else {
          lockInput(t('ai_suspended', "Suspended (60m remaining)", { m: 60 }));
          appendSystemMsg(t('ai_banned_msg', "🚫 Suspended for 1 hour due to repeated conduct violations."));
        }
        return;

        // --- Language UI Help & Command Interception ---
      const langHelpMatch = query.match(/(?:how\s*(?:do|to|can)\s*i\s*change\s*language|help\s*me\s*select\s*language|where\s*is\s*language)/i);
      const langCommandMatch = query.match(/(?:change|switch|set|translate)\s*(?:the\s*)?(?:language|lang)\s*(?:to|in)?\s*([a-zA-Z\-\s]+)/i) || 
                               query.match(/^(?:speak|talk)\s*(?:in\s*)?([a-zA-Z\-\s]+)$/i);

      if (langHelpMatch && !langCommandMatch) {
        appendUserMsg(query);
        appendAiMsg(t('ai_lang_help', "You can change the language using the dropdown menu at the top right of the header. Alternatively, just tell me: <strong>'change language to Spanish'</strong> or <strong>'speak in JA'</strong>!"));
        return;
      }

      if (langCommandMatch) {
        appendUserMsg(query);
        const requestedLang = langCommandMatch[1].replace(/please/i, '').trim().toLowerCase();
        let foundCode = null;
        let foundName = null;

        if (window.WuWaI18n && window.WuWaI18n.LANGUAGES) {
          for (const [code, config] of Object.entries(window.WuWaI18n.LANGUAGES)) {
            if (code.toLowerCase() === requestedLang || 
                config.name.toLowerCase() === requestedLang || 
                requestedLang.startsWith(config.name.toLowerCase()) || 
                requestedLang.startsWith(code.toLowerCase())) {
              foundCode = code;
              foundName = config.name;
              break;
            }
          }
        }

        if (foundCode) {
          window.WuWaI18n.setLanguage(foundCode);
          appendAiMsg(t('ai_lang_changed', `✅ Language successfully changed to {name}. I will now respond in this language.`, { name: foundName }));
        } else {
          appendAiMsg(t('ai_lang_unsupported', `❌ Sorry, the language "{lang}" is not currently supported. Supported options include: EN, PT, ES, ZH-CN, ZH-TW, JA, ID, VI, AR.`, { lang: requestedLang }));
        }
        return;
      }
      }

      appendUserMsg(query);
      const contextHistory = loadContextHistory();
      const customApiKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      const loadingEl = appendAiMsg(t('ai_thinking', "Thinking..."));

      if (navigator.onLine) {
        try {
          let aiResponse = await queryAI(query, contextHistory, customApiKey);
          aiResponse = ensureHyperlink(aiResponse, query, contextHistory);

          const { bodyText, linkHtml } = extractLinkBlock(aiResponse);

          let processed = window.WuWaFormatter ? window.WuWaFormatter.formatText(bodyText) : bodyText;
          processed = markdownToHtml(processed);
          const structuredHtml = formatMessageHtml(processed);

          loadingEl.querySelector('.msg-bubble').innerHTML = structuredHtml + linkHtml;

          contextHistory.push({ role: 'user', text: query });
          contextHistory.push({ role: 'assistant', text: aiResponse });
          saveContextHistory(contextHistory);
          scrollToBottom();
          return;
        } catch (err) {
          console.warn("Proxy/Gemini API failed or timed out. Falling back to local hybrid engine.", err);
        }
      }

      setTimeout(() => {
        if (!window.WuWaAiKnowledge) {
          loadingEl.querySelector('.msg-bubble').textContent = t('ai_offline_loading', "Offline engine loading, please retry in a moment.");
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

        if (!matches || matches.length === 0) {
          const fallback = {
            text: t('ai_offline_fallback', `I couldn't locate a precise match for that.<br>Are you trying to resolve a crash, configure Shizuku, or find recommended CVars?`),
            link: "index.html",
            linkText: t('ai_explore_docs', "Explore Documentation Home")
          };
          renderResponse(loadingEl, fallback);
          renderDisambiguation(loadingEl, query, [
            { id: "troubleshoot-crash-lag", title: t('nav_troubleshooting', "Game Crash / Stutter Fix") },
            { id: "cvars-recommended", title: t('prompt_cvars', "Recommended CVars") },
            { id: "elevated-backends", title: t('prompt_shizuku', "Shizuku & Root Setup") }
          ]);
          return;
        }

        const topMatch = matches[0];
        renderResponse(loadingEl, topMatch.doc.response);

        contextHistory.push({ role: 'user', text: query });
        contextHistory.push({ role: 'assistant', text: topMatch.doc.response.text });
        saveContextHistory(contextHistory);

        if (matches.length > 1) {
          const delta = topMatch.score - matches[1].score;
          const relativeDelta = delta / (topMatch.score || 1.0);
          if (delta < 0.8 || relativeDelta < 0.15) {
            renderDisambiguation(loadingEl, query, [
              { id: topMatch.doc.id, title: topMatch.doc.title || topMatch.doc.id },
              { id: matches[1].doc.id, title: matches[1].doc.title || matches[1].doc.id }
            ]);
          }
        }
      }, 50);
    }

    function renderResponse(container, responseObj) {
      const resolved = resolvePath(responseObj.link);
      const textFormatted = window.WuWaFormatter ? window.WuWaFormatter.formatText(responseObj.text) : responseObj.text;
      const parsedMarkdown = markdownToHtml(textFormatted);
      const structuredHtml = formatMessageHtml(parsedMarkdown);
      const linkHtml = responseObj.link
        ? `<div class="msg-link-block"><a href="${resolved}" class="chat-doc-link">🔗 ${responseObj.linkText || t('ai_doc_link_text', 'View Documentation')} →</a></div>`
        : '';

      container.querySelector('.msg-bubble').innerHTML = structuredHtml + linkHtml;
      scrollToBottom();
    }

    function renderDisambiguation(container, rawQuery, topics) {
      const clarifyBox = document.createElement('div');
      clarifyBox.className = 'clarify-box';
      clarifyBox.innerHTML = `<em>${t('ai_clarify_title', 'Help me learn: Which topic did you intend?')}</em><br>`;

      topics.forEach(tDoc => {
        const btn = document.createElement('button');
        btn.className = 'prompt-chip';
        btn.style.margin = '4px 4px 0 0';
        btn.textContent = tDoc.title;
        btn.onclick = () => {
          if (window.WuWaAiKnowledge && window.WuWaAiKnowledge.reinforceTopic) {
            window.WuWaAiKnowledge.reinforceTopic(rawQuery, tDoc.id);
          }
          clarifyBox.innerHTML = `<em>${t('ai_clarify_learned', '✓ Learned! Future queries will prioritize "{title}".', { title: tDoc.title })}</em>`;
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