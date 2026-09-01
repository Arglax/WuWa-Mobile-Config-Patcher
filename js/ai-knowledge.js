/**
 * WuWa Mobile Config Patcher - AI Skill Knowledge Base & Intent Matching Engine
 * Features: Exact Phrase Priority Matching (+10 pts), normalized word stemming, and deep documentation links.
 */
(function (window) {
  'use strict';

  function normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase()
      .replace(/\bc#\b/g, 'csharp')
      .replace(/\bc-sharp\b/g, 'csharp')
      .replace(/\bc\s+sharp\b/g, 'csharp')
      .replace(/\brequired\b/g, 'require')
      .replace(/\brequires\b/g, 'require')
      .replace(/\brequirements\b/g, 'require')
      .replace(/\bneeded\b/g, 'need')
      .replace(/\bneeding\b/g, 'need')
      .replace(/\bneeds\b/g, 'need')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const SKILL_TOPICS = [
    {
      id: "greetings",
      keywords: ["how are you", "hello", "hi", "hey", "who are you", "what can you do", "help", "who made you"],
      response: {
        text: `I'm doing great! 😊 I am your <strong>WuWa Config Patcher AI Assistant</strong>. Ask me anything about recommended CVars, RAM requirements, Shizuku setup, C# Environment, Section Guards, or Log Diagnostics!`,
        link: "index.html",
        linkText: "Explore Documentation Home"
      }
    },

    {
      id: "section-guards",
      keywords: ["what are cvar section guards", "cvar section guards", "section guard", "section guards", "engine section guards", "vibrant red", "misplaced cvars", "misplaced", "autofix", "auto-fix", "renderer", "streaming", "garbage", "cooker", "cvars=", "prefix"],
      response: {
        text: `<strong>Engine CVar Section Guards (CVarSectionGuard.kt):</strong><br>
        Unreal Engine ignores misplaced CVars. The patcher enforces canonical section headers:<br>
        • <code>r.</code> CVars $\\rightarrow$ <code>[/Script/Engine.RendererSettings]</code><br>
        • <code>s.</code> CVars $\\rightarrow$ <code>[/Script/Engine.StreamingSettings]</code><br>
        • <code>gc.</code> CVars $\\rightarrow$ <code>[/Script/Engine.GarbageCollectionSettings]</code><br>
        • General CVars $\\rightarrow$ <code>[SystemSettings]</code><br><br>
        Misplaced lines & <code>CVars=</code> prefixes are painted in bold <strong style="color: #FF2222;">Vibrant Red (#FF2222)</strong>. Tapping <strong>Save</strong> provides a 1-tap <strong>Auto-Fix Sections</strong> remediation button!`,
        link: "pages/config-editor.html#cvar-guards",
        linkText: "View CVar Section Guards Reference"
      }
    },

    {
      id: "csharp-environment",
      keywords: ["how to enable c# environment", "c# environment", "csharp environment", "enable c# environment", "c#", "csharp", "mono", "scripting", "asterisk", "sharphereal", "force", "unity", "pipeline"],
      response: {
        text: `<strong>Enabling C# Environment Scripting:</strong><br>
        1. Go to <strong>Editor Tab &gt; Misc Patch</strong> subtab.<br>
        2. Check <code>-ForceEnableCSharpEnvironment</code> and tap <strong>Patch</strong>.<br>
        3. Launch Wuthering Waves. An <strong>asterisk (*)</strong> at the end of the client version string on the splash screen confirms C# is active!<br><br>
        <em>Log Verification:</em> Decrypt <code>Client.log</code> in Utilities and search for <code>Sharphereal</code> initialization entries.<br>
        <em>Hardware Note:</em> Requires at least <strong>8 GB RAM</strong>.`,
        link: "pages/enable-csharp.html",
        linkText: "View C# Environment Guide"
      }
    },

    {
      id: "log-tools",
      keywords: ["i need help with log tools", "help with log tools", "log tools", "client.log", "decrypt log", "decrypted log", "log decryptor", "log explorer", "get device info", "delete logs"],
      response: {
        text: `<strong>Common Utilities & Log Tools:</strong><br>
        • <strong>Decrypted Log Explorer:</strong> Search through <code>Client.log</code> with line numbers and filter chips (<code>LogConfig</code>, <code>Vulkan</code>, <code>RHI</code>, <code>Sharphereal</code>).<br>
        • <strong>Log Decryptor (`LogDecryptor.kt`):</strong> Decrypts obfuscated logs using <strong>Scheme A</strong> (XOR <code>0xA5/0xEF</code>) or <strong>Scheme B</strong> (XOR <code>0x55</code>).<br>
        • <strong>Get Device Info:</strong> Scans real GPU model, physical RAM, CPU topology, and game-evaluated <strong>Device Score</strong>.<br>
        • <strong>Delete Logs:</strong> Clears bloated log files safely to free up internal storage.`,
        link: "pages/utilities-diagnostics.html",
        linkText: "Open Common Utilities & Log Diagnostics"
      }
    },

    {
      id: "ram-hardware",
      keywords: ["recommended ram", "ram requirements", "ram requirement", "required ram", "hardware recommendations", "ram", "memory", "gb", "hardware", "device score", "spec", "specs", "gpu", "cpu"],
      response: {
        text: `<strong>RAM & Hardware Recommendations for WuWa Config Patcher:</strong><br>
        • <strong>8 GB Physical RAM or higher:</strong> Recommended for running Extreme / High Visual presets and the <strong>C# Environment</strong> pipeline.<br>
        • <strong>6 GB Physical RAM:</strong> Best suited for <code>STABLE</code> or <code>PERFORMANCE</code> presets.<br>
        • <strong>Under 6 GB RAM:</strong> Recommended to use Low presets or Vanilla defaults to avoid memory pressure during map loading.<br><br>
        <em>Check Your Device Score:</em> Go to <strong>Utilities &gt; Common &gt; Get Device Info</strong> (invokes <code>DeviceStatsCollector.kt</code>) to extract your exact GPU renderer, physical RAM, CPU topology, and game-evaluated <code>DeviceScore</code>!`,
        link: "pages/utilities-diagnostics.html",
        linkText: "View Hardware Diagnostics Guide"
      }
    },

    {
      id: "cvars-recommended",
      keywords: ["what cvars can i put", "recommended cvars", "popular cvars", "cvar", "cvars", "graphic settings", "fps settings", "preset", "tweak", "tweaks"],
      response: {
        text: `<strong>Popular & Recommended CVars for Wuthering Waves:</strong><br>
        • <code>r.MobileContentScaleFactor</code> = <code>0.8</code> to <code>1.5</code> (Section: <code>[SystemSettings]</code> — scales 3D render resolution).<br>
        • <code>r.ShadowQuality</code> = <code>0</code> to <code>3</code> (Section: <code>[SystemSettings]</code> — shadow map resolution).<br>
        • <code>r.BloomQuality</code> = <code>0</code> or <code>1</code> (Section: <code>[SystemSettings]</code> — bloom/glare post-processing).<br>
        • <code>r.VSync</code> = <code>0</code> or <code>1</code> (Section: <code>[SystemSettings]</code> — vertical sync toggle).<br>
        • <code>r.VolumetricFog</code> = <code>0</code> (Section: <code>[/Script/Engine.RendererSettings]</code> — disables heavy fog for FPS boost).<br>
        • <code>s.AsyncLoadingThreadEnabled</code> = <code>1</code> (Section: <code>[/Script/Engine.StreamingSettings]</code> — background streaming thread).<br><br>
        <em>Tip:</em> Always ensure CVars are placed in their proper section header, or use <strong>Auto-Fix Sections</strong> in Smart Mode!`,
        link: "pages/advanced-tools.html#cvar-bank",
        linkText: "Explore 1000+ CVar Bank & Reference"
      }
    },

    {
      id: "shizuku-setup",
      keywords: ["how do i setup shizuku", "shizuku setup", "setup shizuku", "wireless debugging", "pairing", "shizuku", "backend", "access", "xiaomi", "miui", "hyperos"],
      response: {
        text: `<strong>Setting up Shizuku (Wireless Debugging):</strong><br>
        1. Enable <strong>Developer Options</strong> in Android Settings (tap <em>Build Number</em> 7 times).<br>
        2. Enable <strong>USB Debugging</strong> and <strong>Wireless Debugging</strong>.<br>
        3. Open Shizuku, tap <strong>Pairing</strong> &gt; <strong>Pair device with pairing code</strong>.<br>
        4. Enter the 6-digit code in Shizuku's notification prompt.<br>
        5. Return to Shizuku, tap <strong>Start</strong>, and grant access in WuWa Config Patcher.<br><br>
        <em>Xiaomi / HyperOS / MIUI Fix:</em> You must enable <strong>"USB Debugging (Security Settings)"</strong> inside Developer Options.`,
        link: "pages/setup-shizuku.html",
        linkText: "View Complete Setup Shizuku Guide"
      }
    },

    {
      id: "cvar-analyzer",
      keywords: ["how does cvar analyzer work", "cvar analyzer", "analyze config", "config analyzer", "applied percentage", "failed cvars", "stripped cvars"],
      response: {
        text: `<strong>Config & Engine Diagnostics:</strong><br>
        • <strong>Analyze Config (`CVarAnalyzer.kt`):</strong> Cross-checks active INI CVars against decrypted <code>Client.log</code> execution blocks to prove if commands applied, failed, or were deleted by game code.<br>
        • <strong>Log Decryptor (`LogDecryptor.kt`):</strong> Decrypts obfuscated logs using <strong>Scheme A</strong> (XOR <code>0xA5/0xEF</code>), <strong>Scheme B</strong> (XOR <code>0x55</code>), or plaintext.<br>
        • <strong>Delete Logs:</strong> Executes elevated <code>rm -rf</code> on <code>.../Saved/Logs/</code> to reclaim storage space.`,
        link: "pages/advanced-tools.html#cvar-analyzer",
        linkText: "Open CVar Analyzer & Log Tools"
      }
    },

    {
      id: "revert-vanilla",
      keywords: ["revert to vanilla", "vanilla mode", "restore stock settings", "delete shaders", "shader cache", "revert", "vanilla", "stutter", "lag", "crash", "black screen"],
      response: {
        text: `<strong>Reverting to Clean Vanilla Defaults:</strong><br>
        1. Go to <strong>Utilities &gt; Common &gt; Vanilla mode</strong>.<br>
        2. Tap the red <strong>Revert to Vanilla</strong> button and confirm.<br>
        3. This safely removes <code>Engine.ini</code>, <code>DeviceProfiles.ini</code>, and <code>Scalability.ini</code>, prompting the game to regenerate factory Kuro Games defaults upon launch.<br><br>
        <em>Shader Compilation Crashes:</em> Go to <strong>Settings &gt; Danger Zone &gt; Delete Shaders</strong> (`DeleteShadersDialog.kt`) to clear Vulkan or OpenGL shader caches!`,
        link: "pages/patching-configs.html#revert",
        linkText: "View Vanilla Revert & Shader Guide"
      }
    },

    {
      id: "bug-reporting",
      keywords: ["report a bug", "bug reporting", "activity log", "activity_log.txt", "support", "discord", "github", "gcash", "donate", "danger zone"],
      response: {
        text: `<strong>Bug Reporting & Diagnostics:</strong><br>
        • <strong>Activity Logger (`ActionLogger.kt`):</strong> Records all binder events and operations in <code>context.filesDir/activity_log.txt</code>.<br>
        • <strong>Report a Bug Generator (`BugReportDialog.kt`):</strong> Tap <strong>"Report a Bug / Suggest a Feature"</strong> on Support tab to compile hardware specs and backend logs to send via Email or Discord.<br>
        • <strong>Creator Support:</strong> Support Arglax directly via GCash / InstaPay QR dialog on the Support tab.`,
        link: "pages/bug-reporting.html",
        linkText: "View Support & Activity Logger Guide"
      }
    }
  ];

  function findBestMatch(rawQuery) {
    if (!rawQuery) return null;
    const rawLower = rawQuery.toLowerCase().trim();
    const normalized = normalizeText(rawQuery);
    const tokens = normalized.split(/\s+/).filter(t => t.length > 1);

    let bestTopic = null;
    let maxScore = 0;

    SKILL_TOPICS.forEach((topic) => {
      let score = 0;

      topic.keywords.forEach((keyword) => {
        const cleanKeyword = normalizeText(keyword);

        // 1. Direct Multi-Word Phrase Match (+10 Score Priority)
        if (cleanKeyword.includes(' ') && (rawLower.includes(keyword.toLowerCase()) || normalized.includes(cleanKeyword))) {
          score += 10;
        }
        // 2. Exact Word / Substring Match (+5 Score)
        else if (rawLower.includes(keyword.toLowerCase()) || normalized.includes(cleanKeyword)) {
          score += cleanKeyword.length >= 4 ? 5 : 3;
        }
        // 3. Partial Token Match (+1.5 Score)
        else {
          tokens.forEach((token) => {
            if (cleanKeyword.includes(token) || token.includes(cleanKeyword)) {
              score += 1.5;
            }
          });
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestTopic = topic;
      }
    });

    // High confidence match threshold
    if (maxScore >= 2 && bestTopic) {
      return bestTopic.response;
    }

    // Ranked search across SEARCH_DATABASE in search.js
    if (window.WuWaSearch && window.WuWaSearch.SEARCH_DATABASE) {
      const database = window.WuWaSearch.SEARCH_DATABASE;
      let bestSearchItem = null;
      let highestSearchScore = 0;

      database.forEach((item) => {
        const fullText = normalizeText(item.title + ' ' + item.section + ' ' + item.keywords + ' ' + item.snippet);
        let searchScore = 0;

        tokens.forEach((token) => {
          if (fullText.includes(token)) searchScore += 1;
        });

        if (searchScore > highestSearchScore) {
          highestSearchScore = searchScore;
          bestSearchItem = item;
        }
      });

      if (bestSearchItem && highestSearchScore >= 1) {
        return {
          text: `<strong>${bestSearchItem.title}:</strong><br>${bestSearchItem.snippet}`,
          link: bestSearchItem.url,
          linkText: `Open ${bestSearchItem.title}`
        };
      }
    }

    // Default Fallback
    return {
      text: `I'm the WuWa Config Patcher AI Assistant! Ask me about recommended CVars, RAM requirements, Shizuku setup, C# Environment, Section Guards, or CVar Analyzer.`,
      link: "index.html",
      linkText: "Explore Documentation Home"
    };
  }

  window.WuWaAiKnowledge = {
    SKILL_TOPICS,
    normalizeText,
    findBestMatch
  };
})(window);
