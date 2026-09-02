/**
 * WuWa Mobile Config Patcher - V2 AI Engine
 * Features: Dynamic JSON Fetching, BM25 Ranking, Stemming, Bigram Typo Fix, and Local Learning
 */
(function (window) {
  'use strict';

  const LEARNED_CACHE_KEY = 'wuwa_ai_learned_associations';

  function stemWord(word) {
    if (word.length < 4) return word;
    return word
      .replace(/(ing|edly|ingly|ed)$/, '')
      .replace(/(ies|s|es)$/, '')
      .replace(/(tion|tions|tional)$/, 't')
      .replace(/(ment|ments)$/, '')
      .replace(/(able|ible)$/, '');
  }

  const SYNONYM_GROUPS = [
    ['c#', 'csharp', 'mono', 'scripting', 'sharphereal'],
    ['ram', 'memory', 'hardware', 'specs', 'specifications'],
    ['cvars', 'cvar', 'tweaks', 'console', 'settings', 'config'],
    ['shizuku', 'wireless', 'adb', 'debugging', 'pairing', 'pair'],
    ['clean', 'restore', 'reset', 'vanilla', 'defaults']
  ];
  const SYNONYM_MAP = new Map();
  SYNONYM_GROUPS.forEach(group => group.forEach(word => SYNONYM_MAP.set(word, group)));

  function expandAndStem(text) {
    const rawTokens = text.toLowerCase().replace(/[^a-z0-9#\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    const expanded = new Set();
    
    rawTokens.forEach(token => {
      expanded.add(stemWord(token));
      const synonyms = SYNONYM_MAP.get(token);
      if (synonyms) synonyms.forEach(s => expanded.add(stemWord(s)));
    });
    return Array.from(expanded);
  }

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
        const tokens = expandAndStem(doc.keywords.join(' ') + ' ' + doc.id);
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

    search(query) {
      const rawTokens = expandAndStem(query);
      const tokens = this.correctTypos(rawTokens);
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

  let engine = new BM25Engine();
  let loadedTopics = [];

  // Active Disambiguation & Self-Learning
  function reinforceTopic(userQuery, topicId) {
    const memory = JSON.parse(localStorage.getItem(LEARNED_CACHE_KEY) || '{}');
    const cleanKey = userQuery.toLowerCase().trim();
    memory[cleanKey] = topicId;
    localStorage.setItem(LEARNED_CACHE_KEY, JSON.stringify(memory));

    // Reinforce live session weights
    const target = loadedTopics.find(t => t.id === topicId);
    if (target) {
      const tokens = expandAndStem(userQuery);
      target.keywords.push(...tokens);
      engine.index(loadedTopics);
    }
  }

  function getRankedMatches(rawQuery) {
    if (!rawQuery) return { matches: [], learnedMatch: null };
    const cleanQuery = rawQuery.toLowerCase().trim();

    // Check learned memory
    const memory = JSON.parse(localStorage.getItem(LEARNED_CACHE_KEY) || '{}');
    if (memory[cleanQuery]) {
      const directDoc = loadedTopics.find(t => t.id === memory[cleanQuery]);
      if (directDoc) {
        return { matches: [{ doc: directDoc, score: 99.0 }], learnedMatch: directDoc };
      }
    }

    const matches = engine.search(rawQuery);
    return { matches, learnedMatch: null };
  }

  function findBestMatch(rawQuery) {
    const { matches, learnedMatch } = getRankedMatches(rawQuery);
    if (learnedMatch) return learnedMatch.response;
    if (matches.length > 0) return matches[0].doc.response;

    return {
      text: `I couldn't find an exact match for that. You can ask me about recommended CVars, RAM requirements, Shizuku setup, or C# Environment.`,
      link: "index.html",
      linkText: "Explore Documentation Home"
    };
  }

  // Asynchronously initialize from assets/ai-knowledge.json
  async function initKnowledgeBase() {
    try {
      const targetPath = (window.WuWaPathResolver && window.WuWaPathResolver.resolvePath) 
        ? window.WuWaPathResolver.resolvePath('assets/ai-knowledge.json') 
        : 'assets/ai-knowledge.json';

      const response = await fetch(targetPath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      loadedTopics = await response.json();
      engine.index(loadedTopics);
    } catch (err) {
      console.warn("Could not fetch remote assets/ai-knowledge.json, using baseline topics.", err);
    }
  }

  initKnowledgeBase();

  window.WuWaAiKnowledge = {
    findBestMatch,
    getRankedMatches,
    reinforceTopic,
    initKnowledgeBase,
    getLoadedTopics: () => loadedTopics
  };
})(window);