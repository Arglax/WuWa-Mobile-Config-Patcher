/**
 * WuWa Mobile Config Patcher - Multi-Language Localization Engine (i18n)
 * Supports: EN, PT, ES, ZH-CN, ZH-TW, JA, ID, VI, AR (with RTL support).
 */
(function (window) {
  'use strict';

  const STORAGE_KEY = 'wuwa_docs_lang';

  const LANGUAGES = {
    'en': { code: 'EN', name: 'English', dir: 'ltr' },
    'pt': { code: 'PT', name: 'Português', dir: 'ltr' },
    'es': { code: 'ES', name: 'Español', dir: 'ltr' },
    'zh-CN': { code: 'ZH-CN', name: '简体中文', dir: 'ltr' },
    'zh-TW': { code: 'ZH-TW', name: '繁體中文', dir: 'ltr' },
    'ja': { code: 'JA', name: '日本語', dir: 'ltr' },
    'id': { code: 'ID', name: 'Bahasa Indonesia', dir: 'ltr' },
    'vi': { code: 'VI', name: 'Tiếng Việt', dir: 'ltr' },
    'ar': { code: 'AR', name: 'العربية', dir: 'rtl' }
  };

  const TRANSLATIONS = {
    'en': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "Search documentation, CVars, tools...",
      nav_getting_started: "GETTING STARTED",
      nav_overview: "Overview & Features",
      nav_prerequisites: "Prerequisites & Setup",
      nav_core_workflows: "CORE WORKFLOWS (END-USER)",
      nav_one_click: "1-Click & Custom Presets",
      nav_revert: "Reverting to Vanilla",
      nav_editor: "Live Config Editor",
      nav_csharp: "Enabling C# Environment",
      nav_creator_tools: "CREATOR & ADVANCED TOOLS",
      nav_utilities: "Utilities & Log Diagnostics",
      nav_advanced_suite: "Advanced Diagnostic Suite",
      nav_cvar_guards: "Engine CVar Section Guards",
      nav_cvar_bank: "CVar Bank & Reference Library",
      nav_manual: "Manual Mode Guide (Old School)",
      nav_troubleshooting: "Troubleshooting & FAQ",
      nav_support: "Support & Activity Logger",
      btn_github: "GitHub Repo",
      card_view_details: "View Quick Steps & Mechanics →",
      modal_casual_tab: "End-User Quick Steps",
      modal_technical_tab: "Creator & Technical Mechanics",
      modal_full_page: "View Full Documentation Page",
      footer_text: "WuWa Config Patcher • Developed by Arglax • Official Documentation Site",
      
      // AI Chat Widget
      ai_fab_label: "AI Assistant",
      ai_assistant_title: "WuWa AI Assistant",
      ai_status_checking: "Checking connection...",
      ai_status_offline: "Offline • Local Hybrid Engine Active",
      ai_status_online_custom: "Online • Custom Gemini Key Active",
      ai_status_online_shared: "Online • Shared Assistant Active",
      ai_settings_title: "Custom Gemini API Settings (Optional)",
      ai_settings_desc: "The assistant works automatically online for free. Paste a personal key to use your own quota.",
      ai_settings_placeholder: "Paste Gemini API Key (AQ... or AIza...)",
      ai_btn_save_key: "Save Key",
      ai_btn_use_default: "Use Default",
      ai_msg_welcome: "👋 Hello! I am your <strong>WuWa Config Patcher Assistant</strong>. Ask me anything about presets, CVars, Shizuku, or game troubleshooting!",
      ai_input_placeholder: "Ask a question...",
      ai_thinking: "Thinking...",
      ai_clear_history: "🧹 Conversation history cleared.",
      ai_key_saved: "✓ Custom Gemini API key saved.",
      ai_key_cleared: "✓ Reset to default shared assistant proxy.",
      ai_suspended: "Suspended ({m}m remaining)",
      ai_warning_1: "⚠️ Warning (1/3): Please keep the conversation respectful.",
      ai_warning_2: "⚠️ Warning (2/3): Final warning. Continued profanity will trigger a 1-hour suspension.",
      ai_banned_msg: "🚫 Suspended for 1 hour due to repeated conduct violations.",
      ai_offline_fallback: "I couldn't locate a precise match for that.<br>Are you trying to resolve a crash, configure Shizuku, or find recommended CVars?",
      ai_explore_docs: "Explore Documentation Home",
      ai_clarify_title: "Help me learn: Which topic did you intend?",
      ai_clarify_learned: "✓ Learned! Future queries will prioritize \"{title}\".",
      ai_doc_link_text: "View Documentation",
      ai_offline_loading: "Offline engine loading, please retry in a moment.",

      // Quick Prompt Chips
      prompt_cvars: "🛠️ Recommended CVars",
      prompt_ram: "📱 RAM & Hardware",
      prompt_shizuku: "⚡ Shizuku Setup",
      prompt_csharp: "🚀 C# Environment",
      prompt_guards: "🛡️ Section Guards",
      prompt_analyzer: "🔍 CVar Analyzer"
    },

    'pt': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "Pesquisar documentação, CVars, ferramentas...",
      nav_getting_started: "PRIMEIROS PASSOS",
      nav_overview: "Visão Geral e Recursos",
      nav_prerequisites: "Pré-requisitos e Configuração",
      nav_core_workflows: "FLUXOS PRINCIPAIS (USUÁRIO)",
      nav_one_click: "Correção em 1-Clique e Presets",
      nav_revert: "Reverter para Vanilla",
      nav_editor: "Editor de Configuração ao Vivo",
      nav_csharp: "Ativando Ambiente C#",
      nav_creator_tools: "FERRAMENTAS AVANÇADAS",
      nav_utilities: "Utilitários e Diagnósticos de Log",
      nav_advanced_suite: "Suíte de Diagnóstico Avançado",
      nav_cvar_guards: "Guardas de Seção CVar",
      nav_cvar_bank: "Banco de CVars e Referência",
      nav_manual: "Guia do Modo Manual",
      nav_troubleshooting: "Solução de Problemas e FAQ",
      nav_support: "Suporte e Registro de Atividades",
      btn_github: "Repositório GitHub",
      card_view_details: "Ver Passos Rápidos e Mecânica →",
      modal_casual_tab: "Passos Rápidos para Usuários",
      modal_technical_tab: "Mecânica Técnica e Criadores",
      modal_full_page: "Ver Página Completa da Documentação",
      footer_text: "WuWa Config Patcher • Desenvolvido por Arglax • Site Oficial de Documentação",

      ai_fab_label: "Assistente de IA",
      ai_assistant_title: "Assistente de IA WuWa",
      ai_status_checking: "Verificando conexão...",
      ai_status_offline: "Offline • Motor Híbrido Local Ativo",
      ai_status_online_custom: "Online • Chave Gemini Personalizada Ativa",
      ai_status_online_shared: "Online • Assistente Compartilhado Ativo",
      ai_settings_title: "Configurações Personalizadas da API Gemini (Opcional)",
      ai_settings_desc: "O assistente funciona online gratuitamente. Cole uma chave pessoal para usar sua própria cota.",
      ai_settings_placeholder: "Cole a Chave da API Gemini (AQ... ou AIza...)",
      ai_btn_save_key: "Salvar Chave",
      ai_btn_use_default: "Usar Padrão",
      ai_msg_welcome: "👋 Olá! Sou o <strong>Assistente do WuWa Config Patcher</strong>. Pergunte-me qualquer coisa sobre presets, CVars, Shizuku ou solução de problemas do jogo!",
      ai_input_placeholder: "Faça uma pergunta...",
      ai_thinking: "Pensando...",
      ai_clear_history: "🧹 Histórico de conversa limpo.",
      ai_key_saved: "✓ Chave personalizada da API Gemini salva.",
      ai_key_cleared: "✓ Redefinido para o proxy padrão do assistente compartilhado.",
      ai_suspended: "Suspenso ({m}m restantes)",
      ai_warning_1: "⚠️ Aviso (1/3): Por favor, mantenha a conversa respeitosa.",
      ai_warning_2: "⚠️ Aviso (2/3): Último aviso. Mais palavrões resultarão em uma suspensão de 1 hora.",
      ai_banned_msg: "🚫 Suspenso por 1 hora devido a repetidas violações de conduta.",
      ai_offline_fallback: "Não consegui encontrar uma correspondência exata para isso.<br>Você está tentando resolver um travamento, configurar o Shizuku ou encontrar CVars recomendadas?",
      ai_explore_docs: "Explorar Início da Documentação",
      ai_clarify_title: "Ajude-me a aprender: Qual tópico você pretendia?",
      ai_clarify_learned: "✓ Aprendido! Perguntas futuras priorizarão \"{title}\".",
      ai_doc_link_text: "Ver Documentação",
      ai_offline_loading: "Carregando motor offline, tente novamente em instantes.",

      prompt_cvars: "🛠️ CVars Recomendadas",
      prompt_ram: "📱 RAM e Hardware",
      prompt_shizuku: "⚡ Configuração do Shizuku",
      prompt_csharp: "🚀 Ambiente C#",
      prompt_guards: "🛡️ Guardas de Seção",
      prompt_analyzer: "🔍 Analisador de CVar"
    },

    'es': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "Buscar documentación, CVars, herramientas...",
      nav_getting_started: "PRIMEROS PASOS",
      nav_overview: "Visión General y Funciones",
      nav_prerequisites: "Requisitos Previos y Configuración",
      nav_core_workflows: "FLUJOS PRINCIPALES (USUARIO)",
      nav_one_click: "Parche en 1-Clic y Ajustes",
      nav_revert: "Revertir a Vanilla",
      nav_editor: "Editor de Configuración en Vivo",
      nav_csharp: "Habilitar Entorno C#",
      nav_creator_tools: "HERRAMIENTAS AVANZADAS",
      nav_utilities: "Utilidades y Diagnósticos de Log",
      nav_advanced_suite: "Suite de Diagnóstico Avanzado",
      nav_cvar_guards: "Guardias de Sección CVar",
      nav_cvar_bank: "Banco de CVars y Referencia",
      nav_manual: "Guía de Modo Manual",
      nav_troubleshooting: "Solución de Problemas y FAQ",
      nav_support: "Soporte y Registro de Actividad",
      btn_github: "Repositorio GitHub",
      card_view_details: "Ver Pasos Rápidos y Mecánica →",
      modal_casual_tab: "Pasos Rápidos para Usuario",
      modal_technical_tab: "Mecánica Técnica y Creadores",
      modal_full_page: "Ver Página Completa de Documentación",
      footer_text: "WuWa Config Patcher • Desarrollado por Arglax • Sitio Oficial de Documentación",

      ai_fab_label: "Asistente de IA",
      ai_assistant_title: "Asistente de IA WuWa",
      ai_status_checking: "Comprobando conexión...",
      ai_status_offline: "Desconectado • Motor Híbrido Local Activo",
      ai_status_online_custom: "En línea • Clave Gemini Personalizada Activa",
      ai_status_online_shared: "En línea • Asistente Compartido Activo",
      ai_settings_title: "Configuración de API Gemini Personalizada (Opcional)",
      ai_settings_desc: "El asistente funciona en línea gratis. Pega tu clave personal para usar tu propia cuota.",
      ai_settings_placeholder: "Pega la clave de API Gemini (AQ... o AIza...)",
      ai_btn_save_key: "Guardar Clave",
      ai_btn_use_default: "Usar Predeterminado",
      ai_msg_welcome: "👋 ¡Hola! Soy el <strong>Asistente de WuWa Config Patcher</strong>. ¡Pregúntame cualquier cosa sobre ajustes preestablecidos, CVars, Shizuku o solución de errores del juego!",
      ai_input_placeholder: "Haz una pregunta...",
      ai_thinking: "Pensando...",
      ai_clear_history: "🧹 Historial de conversación borrado.",
      ai_key_saved: "✓ Clave personalizada de API Gemini guardada.",
      ai_key_cleared: "✓ Restablecido al proxy predeterminado del asistente compartido.",
      ai_suspended: "Suspendido ({m}m restantes)",
      ai_warning_1: "⚠️ Advertencia (1/3): Por favor, mantén una conversación respetuosa.",
      ai_warning_2: "⚠️ Advertencia (2/3): Advertencia final. Continuar con malas palabras activará una suspensión de 1 hora.",
      ai_banned_msg: "🚫 Suspendido durante 1 hora por infracciones reiteradas de conducta.",
      ai_offline_fallback: "No pude encontrar una coincidencia exacta para eso.<br>¿Estás intentando resolver un bloqueo, configurar Shizuku o buscar CVars recomendadas?",
      ai_explore_docs: "Explorar Inicio de Documentación",
      ai_clarify_title: "Ayúdame a aprender: ¿Qué tema querías consultar?",
      ai_clarify_learned: "✓ ¡Aprendido! Futuras consultas darán prioridad a \"{title}\".",
      ai_doc_link_text: "Ver Documentación",
      ai_offline_loading: "Cargando motor sin conexión, inténtalo de nuevo en un momento.",

      prompt_cvars: "🛠️ CVars Recomendadas",
      prompt_ram: "📱 RAM y Hardware",
      prompt_shizuku: "⚡ Configuración Shizuku",
      prompt_csharp: "🚀 Entorno C#",
      prompt_guards: "🛡️ Guardias de Sección",
      prompt_analyzer: "🔍 Analizador de CVar"
    },

    'zh-CN': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "搜索文档、CVars 参数、工具...",
      nav_getting_started: "快速入门",
      nav_overview: "概览与核心功能",
      nav_prerequisites: "前置准备与权限配置",
      nav_core_workflows: "核心工作流（普通用户）",
      nav_one_click: "一键补丁与预设方案",
      nav_revert: "一键还原官方默认",
      nav_editor: "实时 INI 配置编辑器",
      nav_csharp: "开启 C# 脚本环境",
      nav_creator_tools: "创作者与高级工具",
      nav_utilities: "实用工具与日志诊断",
      nav_advanced_suite: "高级诊断分析套件",
      nav_cvar_guards: "引擎 CVar 节点保护规则",
      nav_cvar_bank: "CVar 数据库与参考库",
      nav_manual: "手动模式指南（旧版）",
      nav_troubleshooting: "故障排除与常见问题",
      nav_support: "支持与运行日志记录",
      btn_github: "GitHub 仓库",
      card_view_details: "查看快速指南与原理解析 →",
      modal_casual_tab: "普通用户快速指南",
      modal_technical_tab: "创作者与技术原理",
      modal_full_page: "查看完整文档页面",
      footer_text: "WuWa Config Patcher • 由 Arglax 开发 • 官方技术文档网站",

      ai_fab_label: "AI 助手",
      ai_assistant_title: "WuWa AI 助手",
      ai_status_checking: "正在检查连接...",
      ai_status_offline: "离线 • 本地混合引擎运行中",
      ai_status_online_custom: "在线 • 自定义 Gemini 密钥生效",
      ai_status_online_shared: "在线 • 共享公共助手生效",
      ai_settings_title: "自定义 Gemini API 设置（可选）",
      ai_settings_desc: "本助手默认可免费在线使用。如果您希望使用自己的 Google AI Studio 额度，请在下方填入密钥。",
      ai_settings_placeholder: "粘贴 Gemini API 密钥 (AQ... 或 AIza...)",
      ai_btn_save_key: "保存密钥",
      ai_btn_use_default: "使用默认代理",
      ai_msg_welcome: "👋 您好！我是 <strong>WuWa Config Patcher 助手</strong>。欢迎咨询关于配置预设、CVars 参数、Shizuku 配置或游戏闪退排查的问题！",
      ai_input_placeholder: "输入您的问题...",
      ai_thinking: "正在思考...",
      ai_clear_history: "🧹 对话历史已清空。",
      ai_key_saved: "✓ 自定义 Gemini API 密钥已保存！",
      ai_key_cleared: "✓ 已恢复使用默认共享助手代理。",
      ai_suspended: "已暂停使用（剩余 {m} 分钟）",
      ai_warning_1: "⚠️ 警告 (1/3)：请保持文明友善交流。",
      ai_warning_2: "⚠️ 警告 (2/3)：最后警告。再次发送不当词汇将被封禁 1 小时。",
      ai_banned_msg: "🚫 因多次违规发言，已被暂停使用 1 小时。",
      ai_offline_fallback: "未能找到精准匹配的内容。<br>您是否需要解决游戏闪退、配置 Shizuku 或查看推荐 CVars 参数？",
      ai_explore_docs: "浏览文档首页",
      ai_clarify_title: "帮助助手学习：您是指以下哪个主题？" ,
      ai_clarify_learned: "✓ 已学习！未来相似查询将优先推荐 “{title}”。",
      ai_doc_link_text: "查看相关文档",
      ai_offline_loading: "本地离线引擎加载中，请稍候重试。",

      prompt_cvars: "🛠️ 推荐 CVars 参数",
      prompt_ram: "📱 RAM 内存与硬件需求",
      prompt_shizuku: "⚡ Shizuku 权限配置",
      prompt_csharp: "🚀 开启 C# 脚本环境",
      prompt_guards: "🛡️ CVar 节点保护规则",
      prompt_analyzer: "🔍 CVar 分析诊断器"
    },

    'zh-TW': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "搜尋文件、CVars 參數、工具...",
      nav_getting_started: "快速入門",
      nav_overview: "概覽與核心功能",
      nav_prerequisites: "前置準備與權限設定",
      nav_core_workflows: "核心工作流程（一般使用者）",
      nav_one_click: "一鍵修補與預設方案",
      nav_revert: "一鍵還原官方預設",
      nav_editor: "即時 INI 設定編輯器",
      nav_csharp: "開啟 C# 腳本環境",
      nav_creator_tools: "創作者與進階工具",
      nav_utilities: "實用工具與日誌診斷",
      nav_advanced_suite: "進階診斷分析套件",
      nav_cvar_guards: "引擎 CVar 區段保護規則",
      nav_cvar_bank: "CVar 資料庫與參考庫",
      nav_manual: "手動模式指南（舊版）",
      nav_troubleshooting: "故障排除與常見問題",
      nav_support: "支援與執行日誌紀錄",
      btn_github: "GitHub 儲存庫",
      card_view_details: "檢視快速指南與原理解析 →",
      modal_casual_tab: "一般使用者快速指南",
      modal_technical_tab: "創作者與技術原理",
      modal_full_page: "檢視完整文件頁面",
      footer_text: "WuWa Config Patcher • 由 Arglax 開發 • 官方技術文件網站",

      ai_fab_label: "AI 助手",
      ai_assistant_title: "WuWa AI 助手",
      ai_status_checking: "正在檢查連線...",
      ai_status_offline: "離線 • 本地混合引擎運作中",
      ai_status_online_custom: "線上 • 自訂 Gemini 金鑰生效",
      ai_status_online_shared: "線上 • 共用公用助手生效",
      ai_settings_title: "自訂 Gemini API 設定（選填）",
      ai_settings_desc: "本助手預設可免費線上使用。若您希望使用自己的 Google AI Studio 配額，請於下方貼上金鑰。",
      ai_settings_placeholder: "貼上 Gemini API 金鑰 (AQ... 或 AIza...)",
      ai_btn_save_key: "儲存金鑰",
      ai_btn_use_default: "使用預設代理",
      ai_msg_welcome: "👋 您好！我是 <strong>WuWa Config Patcher 助手</strong>。歡迎詢問關於設定預設、CVars 參數、Shizuku 設定或遊戲閃退疑難排解！",
      ai_input_placeholder: "請輸入您的問題...",
      ai_thinking: "正在思考...",
      ai_clear_history: "🧹 對話紀錄已清除。",
      ai_key_saved: "✓ 自訂 Gemini API 金鑰已儲存！",
      ai_key_cleared: "✓ 已重設為預設共用助手代理。",
      ai_suspended: "已暫停使用（剩餘 {m} 分鐘）",
      ai_warning_1: "⚠️ 警告 (1/3)：請保持文明友善的交流。",
      ai_warning_2: "⚠️ 警告 (2/3)：最後警告。若持續使用不當言詞將被停權 1 小時。",
      ai_banned_msg: "🚫 因多次違規發言，已停權 1 小時。",
      ai_offline_fallback: "找不到完全相符的內容。<br>您是否想解決遊戲閃退、設定 Shizuku 或查詢推薦 CVars 參數？",
      ai_explore_docs: "瀏覽文件首頁",
      ai_clarify_title: "協助助手學習：您是指下列哪個主題？",
      ai_clarify_learned: "✓ 已學習！未來的相似查詢將優先推薦「{title}」。",
      ai_doc_link_text: "檢視相關文件",
      ai_offline_loading: "本地離線引擎載入中，請稍候重試。",

      prompt_cvars: "🛠️ 推薦 CVars 參數",
      prompt_ram: "📱 RAM 記憶體與硬體需求",
      prompt_shizuku: "⚡ Shizuku 權限設定",
      prompt_csharp: "🚀 開啟 C# 腳本環境",
      prompt_guards: "🛡️ CVar 區段保護規則",
      prompt_analyzer: "🔍 CVar 分析診斷器"
    },

    'ja': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "ドキュメント、CVars、ツールを検索...",
      nav_getting_started: "はじめに",
      nav_overview: "概要と機能",
      nav_prerequisites: "事前準備と権限設定",
      nav_core_workflows: "基本ワークフロー（一般ユーザー）",
      nav_one_click: "1-クリックパッチとプリセット",
      nav_revert: "公式デフォルトに復元",
      nav_editor: "ライブ設定エディタ",
      nav_csharp: "C# スクリプト環境の有効化",
      nav_creator_tools: "クリエイター＆上級ツール",
      nav_utilities: "ユーティリティとログ診断",
      nav_advanced_suite: "高度な診断スイート",
      nav_cvar_guards: "エンジン CVar セクションガード",
      nav_cvar_bank: "CVar バンクとリファレンス",
      nav_manual: "手動モードガイド",
      nav_troubleshooting: "トラブルシューティングと FAQ",
      nav_support: "サポートとアクティビティログ",
      btn_github: "GitHub リポジトリ",
      card_view_details: "手順と技術詳細を見る →",
      modal_casual_tab: "ユーザー向けクイック手順",
      modal_technical_tab: "技術的仕組みとクリエイター向け",
      modal_full_page: "ドキュメントの全文を見る",
      footer_text: "WuWa Config Patcher • Developed by Arglax • 公式ドキュメントサイト",

      ai_fab_label: "AI アシスタント",
      ai_assistant_title: "WuWa AI アシスタント",
      ai_status_checking: "接続を確認中...",
      ai_status_offline: "オフライン • ローカルハイブリッドエンジン稼働中",
      ai_status_online_custom: "オンライン • カスタム Gemini キー適用中",
      ai_status_online_shared: "オンライン • 共有アシスタント稼働中",
      ai_settings_title: "カスタム Gemini API 設定 (任意)",
      ai_settings_desc: "アシスタントは無料で自動オンライン動作します。個人の Google AI Studio 枠を使用する場合はキーを貼り付けてください。",
      ai_settings_placeholder: "Gemini API キーを貼り付け (AQ... または AIza...)",
      ai_btn_save_key: "キーを保存",
      ai_btn_use_default: "デフォルトを使用",
      ai_msg_welcome: "👋 こんにちは！<strong>WuWa Config Patcher アシスタント</strong>です。プリセット、CVars、Shizuku 設定、ゲームのクラッシュ対策など気軽にお尋ねください！",
      ai_input_placeholder: "質問を入力...",
      ai_thinking: "考え中...",
      ai_clear_history: "🧹 会話履歴を消去しました。",
      ai_key_saved: "✓ カスタム Gemini API キーを保存しました。",
      ai_key_cleared: "✓ デフォルトの共有アシスタントプロキシにリセットしました。",
      ai_suspended: "一時停止中 (残り {m} 分)",
      ai_warning_1: "⚠️ 警告 (1/3): 適切な言葉遣いでご利用ください。",
      ai_warning_2: "⚠️ 警告 (2/3): 最終警告です。不適切な発言が続く場合、1時間利用停止となります。",
      ai_banned_msg: "🚫 ガイドライン違反が繰り返されたため、1時間利用停止となりました。",
      ai_offline_fallback: "正確に一致する情報が見つかりませんでした。<br>ゲームのクラッシュ解決、Shizuku の設定、おすすめの CVars についてお調べですか？",
      ai_explore_docs: "ドキュメントトップを開く",
      ai_clarify_title: "学習にご協力ください: どちらのトピックをお探しでしたか？",
      ai_clarify_learned: "✓ 学習完了！次回から「{title}」が優先されます。",
      ai_doc_link_text: "ドキュメントを見る",
      ai_offline_loading: "オフラインエンジン起動中、少々お待ちください。",

      prompt_cvars: "🛠️ おすすめ CVars",
      prompt_ram: "📱 RAM・ハードウェア要件",
      prompt_shizuku: "⚡ Shizuku 設定手順",
      prompt_csharp: "🚀 C# 環境の有効化",
      prompt_guards: "🛡️ セクションガード規則",
      prompt_analyzer: "🔍 CVar アナライザー"
    },

    'id': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "Cari dokumentasi, CVars, alat...",
      nav_getting_started: "MEMULAI",
      nav_overview: "Ikhtisar & Fitur Utama",
      nav_prerequisites: "Prasyarat & Pengaturan Akses",
      nav_core_workflows: "ALUR KERJA UTAMA (PENGGUNA)",
      nav_one_click: "Tambalan 1-Klik & Preset",
      nav_revert: "Kembalikan ke Asli (Vanilla)",
      nav_editor: "Editor Konfigurasi Langsung",
      nav_csharp: "Mengaktifkan Lingkungan C#",
      nav_creator_tools: "ALAT PEMBUAT & TINGKAT LANJUT",
      nav_utilities: "Utilitas & Diagnostik Log",
      nav_advanced_suite: "Paket Diagnostik Lanjutan",
      nav_cvar_guards: "Penjaga Bagian CVar Engine",
      nav_cvar_bank: "Bank CVar & Referensi",
      nav_manual: "Panduan Mode Manual",
      nav_troubleshooting: "Pemecahan Masalah & FAQ",
      nav_support: "Dukungan & Log Aktivitas",
      btn_github: "Repositori GitHub",
      card_view_details: "Lihat Langkah Cepat & Mekanisme →",
      modal_casual_tab: "Langkah Cepat Pengguna",
      modal_technical_tab: "Mekanisme Teknis & Pembuat",
      modal_full_page: "Lihat Halaman Dokumentasi Lengkap",
      footer_text: "WuWa Config Patcher • Dikembangkan oleh Arglax • Situs Dokumentasi Resmi",

      ai_fab_label: "Asisten AI",
      ai_assistant_title: "Asisten AI WuWa",
      ai_status_checking: "Memeriksa koneksi...",
      ai_status_offline: "Offline • Mesin Hibrida Lokal Aktif",
      ai_status_online_custom: "Online • Kunci Gemini Khusus Aktif",
      ai_status_online_shared: "Online • Asisten Bersama Aktif",
      ai_settings_title: "Pengaturan Kunci API Gemini Khusus (Opsional)",
      ai_settings_desc: "Asisten bekerja online secara otomatis dan gratis. Tempel kunci pribadi untuk kuota Google AI Studio Anda sendiri.",
      ai_settings_placeholder: "Tempel Kunci API Gemini (AQ... atau AIza...)",
      ai_btn_save_key: "Simpan Kunci",
      ai_btn_use_default: "Gunakan Default",
      ai_msg_welcome: "👋 Halo! Saya <strong>Asisten WuWa Config Patcher</strong>. Tanyakan apa saja seputar preset, CVars, Shizuku, atau perbaikan crash game!",
      ai_input_placeholder: "Ajukan pertanyaan...",
      ai_thinking: "Sedang berpikir...",
      ai_clear_history: "🧹 Riwayat percakapan dihapus.",
      ai_key_saved: "✓ Kunci API Gemini kustom berhasil disimpan.",
      ai_key_cleared: "✓ Diatur ulang ke proksi asisten bersama default.",
      ai_suspended: "Ditangguhkan (sisa {m} menit)",
      ai_warning_1: "⚠️ Peringatan (1/3): Harap jaga percakapan tetap sopan.",
      ai_warning_2: "⚠️ Peringatan (2/3): Peringatan terakhir. Kata kasar berikutnya akan memicu penangguhan 1 jam.",
      ai_banned_msg: "🚫 Ditangguhkan selama 1 jam karena pelanggaran pedoman berulang.",
      ai_offline_fallback: "Tidak dapat menemukan kecocokan yang tepat untuk itu.<br>Apakah Anda sedang mencari solusi crash game, pengaturan Shizuku, atau rekomendasi CVars?",
      ai_explore_docs: "Jelajahi Beranda Dokumentasi",
      ai_clarify_title: "Bantu saya belajar: Topik mana yang Anda maksud?",
      ai_clarify_learned: "✓ Dipelajari! Kueri selanjutnya akan memprioritaskan \"{title}\".",
      ai_doc_link_text: "Lihat Dokumentasi",
      ai_offline_loading: "Memuat mesin offline, silakan coba lagi sesaat lagi.",

      prompt_cvars: "🛠️ Rekomendasi CVars",
      prompt_ram: "📱 RAM & Perangkat Keras",
      prompt_shizuku: "⚡ Pengaturan Shizuku",
      prompt_csharp: "🚀 Lingkungan C#",
      prompt_guards: "🛡️ Penjaga Bagian",
      prompt_analyzer: "🔍 Analisis CVar"
    },

    'vi': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "Tìm kiếm tài liệu, CVars, công cụ...",
      nav_getting_started: "BẮT ĐẦU",
      nav_overview: "Tổng quan & Tính năng",
      nav_prerequisites: "Yêu cầu & Cấu hình Quyền",
      nav_core_workflows: "QUY TRÌNH CHÍNH (NGƯỜI DÙNG)",
      nav_one_click: "Vá 1-Chạm & Mẫu Cài Đặt",
      nav_revert: "Khôi Phục Bản Gốc (Vanilla)",
      nav_editor: "Trình Chỉnh Sửa Config Trực Tiếp",
      nav_csharp: "Kích Hoạt Môi Trường C#",
      nav_creator_tools: "CÔNG CỤ NÂNG CAO & SÁNG TẠO",
      nav_utilities: "Tiện Ích & Chẩn Đoán Nhật Ký",
      nav_advanced_suite: "Bộ Chẩn Đoán Nâng Cao",
      nav_cvar_guards: "Quy Tắc Bảo Vệ Mục CVar",
      nav_cvar_bank: "Ngân Hàng CVar & Tham Khảo",
      nav_manual: "Hướng Dẫn Chế Độ Thủ Công",
      nav_troubleshooting: "Xử Lý Sự Cố & FAQ",
      nav_support: "Hỗ Trợ & Nhật Ký Hoạt Động",
      btn_github: "Kho Lưu Trữ GitHub",
      card_view_details: "Xem Hướng Dẫn & Cơ Chế Kỹ Thuật →",
      modal_casual_tab: "Hướng Dẫn Nhanh Cho Người Dùng",
      modal_technical_tab: "Cơ Chế Kỹ Thuật & Nhà Sáng Tạo",
      modal_full_page: "Xem Trang Tài Liệu Đầy Đủ",
      footer_text: "WuWa Config Patcher • Phát triển bởi Arglax • Trang Tài Liệu Chính Thức",

      ai_fab_label: "Trợ Lý AI",
      ai_assistant_title: "Trợ Lý AI WuWa",
      ai_status_checking: "Đang kiểm tra kết nối...",
      ai_status_offline: "Ngoại tuyến • Công Cụ Hybrid Cục Bộ Đang Bật",
      ai_status_online_custom: "Trực tuyến • Khóa Gemini Cá Nhân Đang Dùng",
      ai_status_online_shared: "Trực tuyến • Trợ Lý Dùng Chung Đang Bật",
      ai_settings_title: "Cài Đặt Khóa API Gemini Tùy Chỉnh (Tùy chọn)",
      ai_settings_desc: "Trợ lý hoạt động trực tuyến miễn phí. Dán khóa cá nhân để dùng hạn ngạch Google AI Studio của bạn.",
      ai_settings_placeholder: "Dán Khóa API Gemini (AQ... hoặc AIza...)",
      ai_btn_save_key: "Lưu Khóa",
      ai_btn_use_default: "Dùng Mặc Định",
      ai_msg_welcome: "👋 Xin chào! Tôi là <strong>Trợ Lý WuWa Config Patcher</strong>. Hãy hỏi tôi về preset, CVars, Shizuku hoặc sửa lỗi crash game!",
      ai_input_placeholder: "Đặt câu hỏi...",
      ai_thinking: "Đang suy nghĩ...",
      ai_clear_history: "🧹 Đã xóa lịch sử trò chuyện.",
      ai_key_saved: "✓ Đã lưu khóa API Gemini tùy chỉnh.",
      ai_key_cleared: "✓ Đã đặt lại về proxy trợ lý dùng chung mặc định.",
      ai_suspended: "Tạm ngưng (còn {m} phút)",
      ai_warning_1: "⚠️ Cảnh báo (1/3): Vui lòng giữ văn hóa giao tiếp lịch sự.",
      ai_warning_2: "⚠️ Cảnh báo (2/3): Cảnh báo cuối. Tiếp tục vi phạm sẽ bị tạm ngưng 1 giờ.",
      ai_banned_msg: "🚫 Bị tạm ngưng 1 giờ do vi phạm quy tắc nhiều lần.",
      ai_offline_fallback: "Không tìm thấy nội dung khớp chính xác.<br>Bạn đang cần sửa lỗi crash game, cài đặt Shizuku hay tìm CVars gợi ý?",
      ai_explore_docs: "Khám Phá Trang Chủ Tài Liệu",
      ai_clarify_title: "Giúp AI học tập: Bạn muốn tìm chủ đề nào?",
      ai_clarify_learned: "✓ Đã ghi nhớ! Lần sau truy vấn sẽ ưu tiên \"{title}\".",
      ai_doc_link_text: "Xem Tài Liệu",
      ai_offline_loading: "Đang tải công cụ ngoại tuyến, vui lòng thử lại sau giây lát.",

      prompt_cvars: "🛠️ CVars Gợi Ý",
      prompt_ram: "📱 RAM & Phần Cứng",
      prompt_shizuku: "⚡ Cài Đặt Shizuku",
      prompt_csharp: "🚀 Môi Trường C#",
      prompt_guards: "🛡️ Quy Tắc Section Guard",
      prompt_analyzer: "🔍 Trình Phân Tích CVar"
    },

    'ar': {
      app_title: "WuWa Config Patcher",
      search_placeholder: "ابحث في التوثيق، CVars، الأدوات...",
      nav_getting_started: "البدء",
      nav_overview: "نظرة عامة والميزات",
      nav_prerequisites: "المتطلبات وإعدادات الوصول",
      nav_core_workflows: "مسارات العمل الرئيسية (للمستخدم)",
      nav_one_click: "التصحيح بضغطة واحدة والإعدادات",
      nav_revert: "الاستعادة للوضع الأصلي",
      nav_editor: "محرر التكوين المباشر",
      nav_csharp: "تمكين بيئة C#",
      nav_creator_tools: "أدوات المطورين والمتقدمة",
      nav_utilities: "الأدوات المساعدة وتشخيص السجلات",
      nav_advanced_suite: "مجموعة التشخيص المتقدمة",
      nav_cvar_guards: "قواعد حماية أقسام CVar",
      nav_cvar_bank: "بنك CVars والمرجع",
      nav_manual: "دليل الوضع اليدوي",
      nav_troubleshooting: "استكشاف الأخطاء وإصلاحها والأسئلة الشائعة",
      nav_support: "الدعم وسجل النشاط",
      btn_github: "مستودع GitHub",
      card_view_details: "عرض الخطوات السريعة وآلية العمل ←",
      modal_casual_tab: "خطوات سريعة للمستخدم",
      modal_technical_tab: "الآلية التقنية وللمطورين",
      modal_full_page: "عرض صفحة التوثيق الكاملة",
      footer_text: "WuWa Config Patcher • تم التطوير بواسطة Arglax • الموقع الرسمي للتوثيق",

      ai_fab_label: "مساعد الذكاء الاصطناعي",
      ai_assistant_title: "مساعد WuWa الذكي",
      ai_status_checking: "جارٍ التحقق من الاتصال...",
      ai_status_offline: "غير متصل • المحرك الهجين المحلي نشط",
      ai_status_online_custom: "متصل • مفتاح Gemini المخصص نشط",
      ai_status_online_shared: "متصل • المساعد المشترك نشط",
      ai_settings_title: "إعدادات مفتاح Gemini API المخصص (اختياري)",
      ai_settings_desc: "المساعد يعمل تلقائياً عبر الإنترنت مجاناً. ألصق مفتاحك الشخصي لاستخدام حصتك الخاصة في Google AI Studio.",
      ai_settings_placeholder: "ألصق مفتاح Gemini API (AQ... أو AIza...)",
      ai_btn_save_key: "حفظ المفتاح",
      ai_btn_use_default: "استخدام الافتراضي",
      ai_msg_welcome: "👋 أهلاً بك! أنا <strong>مساعد WuWa Config Patcher</strong>. اسألني عن الإعدادات المسبقة، CVars، Shizuku، أو حل مشاكل تعطل اللعبة!",
      ai_input_placeholder: "اطرح سؤالاً...",
      ai_thinking: "جارٍ التفكير...",
      ai_clear_history: "🧹 تم مسح سجل المحادثة.",
      ai_key_saved: "✓ تم حفظ مفتاح Gemini API المخصص.",
      ai_key_cleared: "✓ تمت إعادة التعيين إلى وكيل المساعد الافتراضي.",
      ai_suspended: "معلق (متبقي {m} دقيقة)",
      ai_warning_1: "⚠️ تحذير (1/3): يرجى الحفاظ على أسلوب محترم في المحادثة.",
      ai_warning_2: "⚠️ تحذير (2/3): تحذير أخير. الاستمرار في الألفاظ غير اللائقة سيؤدي إلى تعليق الحساب لمدة ساعة.",
      ai_banned_msg: "🚫 تم التعليق لمدة ساعة واحدة بسبب تكرار مخالفة القواعد.",
      ai_offline_fallback: "لم أتمكن من العثور على تطابق دقيق لذلك.<br>هل تحاول حل مشكلة تعطل، ضبط Shizuku، أو تبحث عن CVars الموصى بها؟",
      ai_explore_docs: "استكشاف الصفحة الرئيسية للتوثيق",
      ai_clarify_title: "ساعدني في التعلم: ما هو الموضوع الذي قصدته؟",
      ai_clarify_learned: "✓ تم التعلم! ستعطي الاستعلامات المستقبلية الأولوية لـ \"{title}\".",
      ai_doc_link_text: "عرض التوثيق",
      ai_offline_loading: "جارٍ تحميل المحرك المحلي، يرجى المحاولة بعد قليل.",

      prompt_cvars: "🛠️ CVars الموصى بها",
      prompt_ram: "📱 RAM والعتاد",
      prompt_shizuku: "⚡ إعداد Shizuku",
      prompt_csharp: "🚀 بيئة C#",
      prompt_guards: "🛡️ حماية الأقسام",
      prompt_analyzer: "🔍 فاحص CVar"
    }
  };

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }

  function t(key, fallback = '', replacements = {}) {
    const lang = getCurrentLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    let str = dict[key] !== undefined ? dict[key] : (TRANSLATIONS['en'][key] !== undefined ? TRANSLATIONS['en'][key] : fallback);

    if (replacements && typeof str === 'string') {
      Object.keys(replacements).forEach(k => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), replacements[k]);
      });
    }
    return str;
  }

  function setLanguage(langCode) {
    const lang = LANGUAGES[langCode] ? langCode : 'en';
    const langConfig = LANGUAGES[lang];

    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', langConfig.dir || 'ltr');

    applyTranslations(lang);
    updateSelectorUI(lang);

    window.dispatchEvent(new CustomEvent('wuwa:langchange', { detail: { lang } }));
  }

  function applyTranslations(langCode) {
    const dict = TRANSLATIONS[langCode] || TRANSLATIONS['en'];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.setAttribute('placeholder', dict[key]);
        } else {
          el.textContent = dict[key];
        }
      }
    });
  }

  function updateSelectorUI(activeLang) {
    const selectorPills = document.querySelectorAll('.lang-select-code');
    const selectBoxes = document.querySelectorAll('.lang-select-box');

    const config = LANGUAGES[activeLang] || LANGUAGES['en'];

    selectorPills.forEach((pill) => {
      pill.textContent = config.code;
    });

    selectBoxes.forEach((box) => {
      box.value = activeLang;
    });
  }

  function renderSelectorDOM() {
    const wrappers = document.querySelectorAll('.lang-selector-wrapper');

    wrappers.forEach((wrapper) => {
      if (wrapper.querySelector('.lang-select-box')) return;

      const currentLang = getCurrentLang();
      const currentConfig = LANGUAGES[currentLang] || LANGUAGES['en'];

      wrapper.innerHTML = `
        <div class="lang-selector-container">
          <span class="lang-select-code" id="lang-code-display">${currentConfig.code}</span>
          <select class="lang-select-box" aria-label="Select Language">
            ${Object.keys(LANGUAGES).map((key) => `
              <option value="${key}" ${key === currentLang ? 'selected' : ''}>${LANGUAGES[key].name}</option>
            `).join('')}
          </select>
          <span class="lang-arrow">▾</span>
        </div>
      `;

      const selectBox = wrapper.querySelector('.lang-select-box');
      if (selectBox) {
        selectBox.addEventListener('change', (e) => {
          setLanguage(e.target.value);
        });
      }
    });
  }

  function initI18n() {
    renderSelectorDOM();
    const current = getCurrentLang();
    setLanguage(current);
  }

  window.WuWaI18n = {
    LANGUAGES,
    TRANSLATIONS,
    getCurrentLang,
    setLanguage,
    t,
    initI18n
  };
})(window);