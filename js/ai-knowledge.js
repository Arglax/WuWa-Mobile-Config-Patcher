/**
 * WuWa Mobile Config Patcher - V2.5 AI Engine
 * Features: Multi-Turn Context Window, BM25 Probabilistic Ranking, Algorithmic Suffix Stemming,
 * Bigram Typo Correction, Dynamic JSON Asset Loading, and Local Association Memory.
 */
(function (window) {
  'use strict';

  const LEARNED_CACHE_KEY = 'wuwa_ai_learned_associations';

  // 1. Suffix Stemmer
  function stemWord(word) {
    if (!word || word.length < 4) return word;
    return word
      .replace(/(ing|edly|ingly|ed)$/, '')
      .replace(/(ies|s|es)$/, '')
      .replace(/(tion|tions|tional)$/, 't')
      .replace(/(ment|ments)$/, '')
      .replace(/(able|ible)$/, '');
  }

  // 2. Technical Synonym Dictionary
  const SYNONYM_GROUPS = [
    ['c#', 'csharp', 'mono', 'scripting', 'sharphereal'],
    ['ram', 'memory', 'hardware', 'specs', 'specifications', 'score'],
    ['cvars', 'cvar', 'tweaks', 'console', 'settings', 'config', 'presets', 'preset'],
    ['shizuku', 'wireless', 'adb', 'debugging', 'pairing', 'pair', 'backend', 'elevation', 'root', 'libsu'],
    ['clean', 'restore', 'reset', 'vanilla', 'defaults', 'revert'],
    ['crash', 'crashing', 'lag', 'stutter', 'stuttering', 'freeze', 'freezing', 'blackscreen', 'black', 'bug', 'error', 'fails'],
    ['shaders', 'shader', 'vulkan', 'opengl', 'binary', 'cache'],
    ['forbidden', 'blacklisted', 'unsupported', 'stripped', 'deleted']
  ];
  const SYNONYM_MAP = new Map();
  SYNONYM_GROUPS.forEach(group => group.forEach(word => SYNONYM_MAP.set(word, group)));

  function expandAndStem(text) {
    if (!text) return [];
    const rawTokens = text.toLowerCase().replace(/[^a-z0-9#\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    const expanded = new Set();
    
    rawTokens.forEach(token => {
      expanded.add(stemWord(token));
      const synonyms = SYNONYM_MAP.get(token);
      if (synonyms) synonyms.forEach(s => expanded.add(stemWord(s)));
    });
    return Array.from(expanded);
  }

  // 3. Typo Handling (Character Bigrams)
  function getBigrams(str) {
    const v = [];
    for (let i = 0; i < str.length - 1; i++) v.push(str.slice(i, i + 2));
    return v;
  }

  function stringSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    if (s1.length < 2 || s2.length < 2) return 0.0;
    const b1 = getBigrams(s1), b2 = getBigrams(s2);
    let intersection = 0;
    const map = new Map();
    b1.forEach(bg => map.set(bg, (map.get(bg) || 0) + 1));
    b2.forEach(bg => {
      if (map.get(bg) > 0) {
        map.set(bg, map.get(bg) - 1);
        intersection++;
      }
    });
    return (2.0 * intersection) / (b1.length + b2.length);
  }

  // 4. BM25 Search Engine
  class BM25Engine {
    constructor(k1 = 1.2, b = 0.75) {
      this.k1 = k1;
      this.b = b;
      this.docs = [];
      this.idf = new Map();
      this.docTermFreqs = [];
      this.docLengths = [];
      this.avgDocLength = 0;
      this.knownVocabulary = new Set();
    }

    index(documents) {
      this.docs = documents;
      let totalLength = 0;
      const docFreqs = new Map();

      this.docs.forEach((doc, i) => {
        const tokens = expandAndStem((doc.keywords || []).join(' ') + ' ' + (doc.id || '') + ' ' + (doc.title || ''));
        this.docLengths[i] = tokens.length;
        totalLength += tokens.length;
        
        const tf = new Map();
        const uniqueTokens = new Set(tokens);
        
        tokens.forEach(token => {
          tf.set(token, (tf.get(token) || 0) + 1);
          this.knownVocabulary.add(token);
        });
        this.docTermFreqs[i] = tf;

        uniqueTokens.forEach(token => {
          docFreqs.set(token, (docFreqs.get(token) || 0) + 1);
        });
      });

      this.avgDocLength = totalLength / (this.docs.length || 1);
      
      docFreqs.forEach((df, term) => {
        const idfValue = Math.log(1 + (this.docs.length - df + 0.5) / (df + 0.5));
        this.idf.set(term, Math.max(idfValue, 0.01));
      });
    }

    correctTypos(tokens) {
      return tokens.map(token => {
        if (this.knownVocabulary.has(token)) return token;
        let bestMatch = token;
        let maxSim = 0;
        this.knownVocabulary.forEach(vocab => {
          const sim = stringSimilarity(token, vocab);
          if (sim > maxSim) { maxSim = sim; bestMatch = vocab; }
        });
        return maxSim > 0.70 ? bestMatch : token;
      });
    }

    search(queryTokens) {
      const tokens = this.correctTypos(queryTokens);
      const scores = new Array(this.docs.length).fill(0);

      tokens.forEach(token => {
        const idf = this.idf.get(token);
        if (!idf) return;

        this.docs.forEach((doc, i) => {
          const tf = this.docTermFreqs[i].get(token) || 0;
          if (tf === 0) return;
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * (1 - this.b + this.b * (this.docLengths[i] / this.avgDocLength));
          scores[i] += idf * (numerator / denominator);
        });
      });

      return scores
        .map((score, index) => ({ doc: this.docs[index], score }))
        .filter(res => res.score > 0)
        .sort((a, b) => b.score - a.score);
    }
  }

  const engine = new BM25Engine();
  let loadedTopics = [];
  let loadError = null;

  // 5. Context-Enriched Query Resolution
function buildEnrichedQueryTokens(rawQuery, contextWindow) {
    const currentTokens = expandAndStem(rawQuery);
    
    // If user's query is brief (<= 3 words), incorporate context from the last 6 messages
    if (currentTokens.length <= 3 && Array.isArray(contextWindow) && contextWindow.length > 0) {
      const recentHistory = contextWindow.slice(-6); // Only look at the last 6 messages
      const contextTokens = [];
      recentHistory.forEach(item => {
        if (item.text) {
          contextTokens.push(...expandAndStem(item.text));
        }
      });
      // Mix current tokens with recent context
      return Array.from(new Set([...currentTokens, ...contextTokens]));
    }

    return currentTokens;
  }

  function reinforceTopic(userQuery, topicId) {
    const memory = JSON.parse(localStorage.getItem(LEARNED_CACHE_KEY) || '{}');
    const cleanKey = userQuery.toLowerCase().trim();
    memory[cleanKey] = topicId;
    localStorage.setItem(LEARNED_CACHE_KEY, JSON.stringify(memory));

    const target = loadedTopics.find(t => t.id === topicId);
    if (target) {
      const tokens = expandAndStem(userQuery);
      if (!target.keywords) target.keywords = [];
      target.keywords.push(...tokens);
      engine.index(loadedTopics);
    }
  }

  function getRankedMatches(rawQuery, contextWindow = []) {
    if (!rawQuery) return { matches: [], learnedMatch: null };
    const cleanQuery = rawQuery.toLowerCase().trim();

    // Check learned association override
    const memory = JSON.parse(localStorage.getItem(LEARNED_CACHE_KEY) || '{}');
    if (memory[cleanQuery]) {
      const directDoc = loadedTopics.find(t => t.id === memory[cleanQuery]);
      if (directDoc) {
        return { matches: [{ doc: directDoc, score: 99.0 }], learnedMatch: directDoc };
      }
    }

    const ownTokens = expandAndStem(rawQuery);
    const ownMatches = engine.search(ownTokens);
    if (ownMatches.length > 0) {
      return { matches: ownMatches, learnedMatch: null };
    }

    const queryTokens = buildEnrichedQueryTokens(rawQuery, contextWindow);
    const matches = engine.search(queryTokens);
    return { matches, learnedMatch: null };
  }

  function findBestMatch(rawQuery, contextWindow = []) {
    const { matches, learnedMatch } = getRankedMatches(rawQuery, contextWindow);
    if (learnedMatch) return learnedMatch.response;
    if (matches.length > 0) return matches[0].doc.response;

    return {
      text: `I couldn't find a direct match. Did you experience a game crash, stutter, Shizuku connection issue, or need help with CVars and section guards? Try asking: "how to fix crash", "recommended ram", or "shizuku setup".`,
      link: "index.html",
      linkText: "Explore Documentation Home"
    };
  }

  async function initKnowledgeBase() {
    try {
      const targetPath = (window.WuWaPathResolver && window.WuWaPathResolver.resolvePath)
        ? window.WuWaPathResolver.resolvePath('assets/ai-knowledge.json')
        : 'assets/ai-knowledge.json';

      const response = await fetch(targetPath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      loadedTopics = await response.json();
      engine.index(loadedTopics);
      loadError = null;
    } catch (err) {
      // Most common cause: the page was opened as a file:// URL, which blocks fetch()
      // for local JSON. Recorded here (not just console.warn) so ai-chat.js can surface
      // a human-readable reason instead of a generic "no match found" dead end.
      loadError = (err && err.message) ? err.message : String(err);
      console.warn("Could not fetch assets/ai-knowledge.json — local BM25 engine has no docs.", err);
    }
  }

  initKnowledgeBase();

  window.WuWaAiKnowledge = {
    findBestMatch,
    getRankedMatches,
    reinforceTopic,
    initKnowledgeBase,
    getLoadedTopics: () => loadedTopics,
    getStatus: () => ({ loaded: loadedTopics.length > 0, error: loadError })
  };
})(window);