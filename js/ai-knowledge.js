/**
 * WuWa Mobile Config Patcher - V2.8 Hybrid AI Engine & Brute-Force Retrieval
 */
(function (window) {
  'use strict';

  const LEARNED_CACHE_KEY = 'wuwa_ai_learned_associations';
  const PHRASE_BOOST = 8.5;
  const PROXIMITY_BOOST = 4.0;

  // 1. Natural Language Stopwords (filtered for BM25 calculation without losing negation)
  const STOP_WORDS = new Set([
    'a', 'about', 'after', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
    'be', 'because', 'been', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing',
    'for', 'from', 'get', 'got', 'had', 'has', 'have', 'how', 'i', 'if', 'in', 'into',
    'is', 'it', 'its', 'just', 'me', 'my', 'of', 'on', 'or', 'our', 'please', 'shall',
    'should', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there',
    'these', 'they', 'this', 'to', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
    'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your'
  ]);

  // 2. Irregular Suffix & Grammatical Overrides
  const IRREGULAR_STEMS = new Map([
    ['deleted', 'delete'], ['deleting', 'delete'],
    ['cached', 'cache'], ['caching', 'cache'],
    ['analyzed', 'analyze'], ['analyzing', 'analyze'], ['analysed', 'analyze'], ['analysing', 'analyze'],
    ['stripped', 'strip'], ['stripping', 'strip'],
    ['crashed', 'crash'], ['crashing', 'crash'],
    ['patched', 'patch'], ['patching', 'patch'],
    ['paired', 'pair'], ['pairing', 'pair'],
    ['optimized', 'optimize'], ['optimizing', 'optimize'],
    ['unauthorized', 'unauthorized'], ['reverted', 'revert'],
    ['lagging', 'lag'], ['lagged', 'lag'],
    ['stuttering', 'stutter'], ['stuttered', 'stutter']
  ]);

  function stemWord(word) {
    if (!word) return word;
    if (IRREGULAR_STEMS.has(word)) return IRREGULAR_STEMS.get(word);
    if (word.length < 4) return word;
    return word
      .replace(/(ing|edly|ingly|ed)$/, '')
      .replace(/(ies|s|es)$/, '')
      .replace(/(tion|tions|tional)$/, 't')
      .replace(/(ment|ments)$/, '')
      .replace(/(able|ible)$/, '');
  }

  // 3. Concept Clusters & Synonyms
  const SYNONYM_GROUPS = [
    ['c#', 'csharp', 'mono', 'scripting', 'sharphereal', 'ue4commandline'],
    ['ram', 'memory', 'hardware', 'specs', 'specifications', 'score', 'gb', 'tier', 'vram', 'soc', 'gpu', 'cpu'],
    ['cvars', 'cvar', 'tweaks', 'console', 'presets', 'preset', 'variables', 'parameters'],
    ['shizuku', 'wireless', 'adb', 'debugging', 'pairing', 'pair', 'backend', 'elevation', 'root', 'libsu', 'axmanager'],
    ['clean', 'restore', 'reset', 'vanilla', 'defaults', 'revert', 'recovery'],
    ['crash', 'crashing', 'lag', 'stutter', 'stuttering', 'freeze', 'freezing', 'blackscreen', 'black', 'forceclose', 'fc'],
    ['shaders', 'shader', 'vulkan', 'opengl', 'binary', 'cache', 'pso'],
    ['forbidden', 'blacklisted', 'unsupported', 'stripped', 'deleted', 'illegal'],
    ['duplicate', 'duplicates', 'repeated', 'dupe', 'dupes', 'conflicting'],
    ['extract', 'extractor', 'export', 'frequency', 'remarks', 'dump'],
    ['network', 'netcode', 'multiplayer', 'ping', 'latency'],
    ['tab', 'tabs', 'navigation', 'nav', 'screen', 'screens', 'structure', 'ui'],
    ['editor', 'edit', 'editing', 'mode', 'modes', 'smart', 'text', 'oneline'],
    ['analyzer', 'analyse', 'analyze', 'analysis', 'diagnostic', 'diagnostics', 'insight', 'insights', 'verification'],
    ['bank', 'library', 'reference', 'database', 'alteriax'],
    ['backup', 'storage', 'import', 'mainstorage', 'snapshots'],
    ['decrypt', 'decryptor', 'decryption', 'log', 'logs', 'explorer', 'clientlog'],
    ['settings', 'preferences', 'preference', 'options', 'tooltips', 'shortcuts'],
    ['danger', 'zone', 'clear', 'delete', 'wipe', 'cleanup'],
    ['bug', 'report', 'reporting', 'issue', 'discord', 'github', 'activitylog'],
    ['donate', 'donation', 'gcash', 'instapay', 'support', 'creator', 'arglax'],
    ['manual', 'filemanager', 'zarchiver', 'mtmanager', 'fvfile'],
    ['version', 'changelog', 'update', 'updates', 'developer', 'author']
  ];
  const SYNONYM_MAP = new Map();
  SYNONYM_GROUPS.forEach(group => group.forEach(word => SYNONYM_MAP.set(word, group)));

  // 4. Identifier / Compound Term Decomposer
  const COMPOUND_TERMS = {
    configscreen: ['config', 'screen'],
    editorscreen: ['editor', 'screen'],
    utilitiesscreen: ['utilities', 'utility', 'screen'],
    settingsscreen: ['settings', 'screen'],
    supportscreen: ['support', 'screen'],
    githubapi: ['github', 'api'],
    zipextractor: ['zip', 'extractor', 'extract'],
    offsetmapping: ['offset', 'mapping'],
    configanalysisdialog: ['config', 'analysis', 'analyzer', 'dialog'],
    configanalyzer: ['config', 'analyzer', 'analysis'],
    duplicatecvarflagger: ['duplicate', 'cvar', 'flagger', 'flag'],
    duplicateflaggerdialog: ['duplicate', 'flagger', 'flag', 'dialog'],
    forbiddencvarstripper: ['forbidden', 'cvar', 'stripper', 'strip'],
    forbiddencvardialog: ['forbidden', 'cvar', 'dialog'],
    cvarextractor: ['cvar', 'extractor', 'extract'],
    cvarextractordialog: ['cvar', 'extractor', 'extract', 'dialog'],
    mainstoragereaderdialog: ['main', 'storage', 'reader', 'dialog'],
    devicestatscollector: ['device', 'stats', 'statistics', 'collector'],
    actionlogger: ['action', 'logger', 'log'],
    bugreportdialog: ['bug', 'report', 'dialog'],
    wuwalab: ['wuwa', 'lab'],
    networkemulationprofiles: ['network', 'emulation', 'profiles'],
    axmanager: ['ax', 'manager', 'shizuku'],
    blackscreen: ['black', 'screen', 'crash'],
    forceclose: ['force', 'close', 'crash'],
    notworking: ['not', 'working', 'broken']
  };

  // 5. Hardcoded Domain Typo Matrix
  const KNOWN_TYPO_FIXES = new Map([
    ['shizuko', 'shizuku'], ['shizuka', 'shizuku'], ['shizuk', 'shizuku'],
    ['shizuzu', 'shizuku'], ['shiziku', 'shizuku'], ['sizuku', 'shizuku'],
    ['shuziku', 'shizuku'], ['shuzuku', 'shizuku'], ['shizukku', 'shizuku'],
    ['wireles', 'wireless'], ['wirelss', 'wireless'], ['wereless', 'wireless'],
    ['pairng', 'pairing'], ['pare', 'pair'], ['debbuging', 'debugging'], ['debuging', 'debugging'],
    ['unauthorizd', 'unauthorized'], ['unauthorise', 'unauthorized'], ['unautorized', 'unauthorized'],
    ['permision', 'permission'], ['permisson', 'permission'], ['premision', 'permission'],
    ['recomend', 'recommend'], ['recomended', 'recommend'], ['reccommend', 'recommend'], ['recomendation', 'recommend'],
    ['requiremnt', 'requirement'], ['requirment', 'requirement'], ['requirments', 'requirement'], ['requiement', 'requirement'],
    ['confgi', 'config'], ['confing', 'config'], ['cofnig', 'config'], ['configg', 'config'], ['confg', 'config'],
    ['patchh', 'patch'], ['pathc', 'patch'], ['ptach', 'patch'], ['pacth', 'patch'],
    ['patchig', 'patching'], ['pathcing', 'patching'], ['patcing', 'patching'],
    ['cvarr', 'cvar'], ['cvra', 'cvar'], ['csvar', 'cvar'], ['cvaar', 'cvar'], ['c-var', 'cvar'], ['c-vars', 'cvars'],
    ['csharpp', 'csharp'], ['c-sharp', 'csharp'], ['cshrp', 'csharp'], ['c_sharp', 'csharp'],
    ['wutherin', 'wuthering'], ['wutheirng', 'wuthering'], ['wuthring', 'wuthering'],
    ['axmanger', 'axmanager'], ['axmanaher', 'axmanager'], ['axmanagr', 'axmanager'],
    ['vram', 'ram'], ['harware', 'hardware'], ['hadware', 'hardware'], ['hardwear', 'hardware'],
    ['freqency', 'frequency'], ['frequancy', 'frequency'],
    ['crashign', 'crash'], ['crashng', 'crash'], ['carsh', 'crash'], ['crsh', 'crash'], ['craash', 'crash'],
    ['stutterin', 'stutter'], ['studder', 'stutter'], ['stuttr', 'stutter'], ['stutring', 'stutter'],
    ['frezee', 'freeze'], ['frezze', 'freeze'], ['freez', 'freeze'], ['frezing', 'freeze'],
    ['blackscren', 'blackscreen'], ['blacksreen', 'blackscreen'],
    ['analizer', 'analyzer'], ['anlyzer', 'analyzer'], ['analzyer', 'analyzer'], ['anaylzer', 'analyzer'],
    ['analzer', 'analyzer'], ['analyser', 'analyzer'], ['analysys', 'analysis'], ['anaylsis', 'analysis'],
    ['duplcate', 'duplicate'], ['duplciate', 'duplicate'], ['dupicate', 'duplicate'],
    ['forbiden', 'forbidden'], ['forbbiden', 'forbidden'],
    ['elevatd', 'elevated'], ['elevted', 'elevated'],
    ['grpahics', 'graphics'], ['graphcis', 'graphics'], ['grafix', 'graphics'],
    ['perfomance', 'performance'], ['performace', 'performance'], ['preformance', 'performance'],
    ['prefernces', 'preferences'], ['prefrences', 'preferences'], ['preferances', 'preferences'],
    ['navigaton', 'navigation'], ['navagation', 'navigation'], ['navigtion', 'navigation'],
    ['setttings', 'settings'], ['settigns', 'settings'], ['setings', 'settings'],
    ['decyptor', 'decryptor'], ['dcryptor', 'decryptor'], ['decriptor', 'decryptor'],
    ['decrpyt', 'decrypt'], ['decrpt', 'decrypt'],
    ['strorage', 'storage'], ['stroage', 'storage'], ['storag', 'storage'],
    ['verion', 'version'], ['virsion', 'version'],
    ['chagelog', 'changelog'], ['changlog', 'changelog'],
    ['devloper', 'developer'], ['develper', 'developer'], ['develoepr', 'developer'],
    ['reportin', 'reporting'], ['reprot', 'report'],
    ['discrod', 'discord'],
    ['donat', 'donate'], ['doante', 'donate'],
    ['manuel', 'manual'],
    ['zarchiever', 'zarchiver'], ['zarciver', 'zarchiver'],
    ['bakup', 'backup'], ['bacup', 'backup'],
    ['dangar', 'danger'],
    ['snyc', 'sync'], ['syncc', 'sync'],
    ['xaiomi', 'xiaomi'], ['redmi', 'xiaomi'], ['poco', 'xiaomi'], ['hyperos', 'hyperos']
  ]);

  const STATIC_VOCAB = new Set();
  SYNONYM_GROUPS.forEach(group => group.forEach(word => STATIC_VOCAB.add(word)));
  KNOWN_TYPO_FIXES.forEach(correct => STATIC_VOCAB.add(correct));
  Object.keys(COMPOUND_TERMS).forEach(key => {
    STATIC_VOCAB.add(key);
    COMPOUND_TERMS[key].forEach(w => STATIC_VOCAB.add(w));
  });

  // 6. Phonetic Matching (Soundex Approximation)
  function getSoundex(s) {
    if (!s) return '';
    const a = s.toLowerCase().split('');
    const firstLetter = a[0];
    const codes = {
      b: 1, f: 1, p: 1, v: 1,
      c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
      d: 3, t: 3,
      l: 4,
      m: 5, n: 5,
      r: 6
    };
    const res = [firstLetter];
    let prev = codes[firstLetter] || 0;
    for (let i = 1; i < a.length; i++) {
      const code = codes[a[i]] || 0;
      if (code !== 0 && code !== prev) {
        res.push(code);
      }
      prev = code;
      if (res.length === 4) break;
    }
    while (res.length < 4) res.push(0);
    return res.join('');
  }

  // QWERTY keyboard adjacency matrix for typo penalty
  const KEYBOARD_ADJACENCY = {
    q: 'wa', w: 'qeas', e: 'wrsd', r: 'edft', t: 'rfgy', y: 'tghu', u: 'yhji', i: 'ujko', o: 'iklp', p: 'ol',
    a: 'qwsz', s: 'awedxz', d: 'serfcx', f: 'drtgvc', g: 'ftyhbv', h: 'gyujnb', j: 'huikmn', k: 'jiolm', l: 'kop',
    z: 'asx', x: 'zsdc', c: 'xdfv', v: 'cfgb', b: 'vghn', n: 'bhjm', m: 'njk'
  };

  function keyAdjacent(c1, c2) {
    const neighbors = KEYBOARD_ADJACENCY[c1];
    return !!neighbors && neighbors.indexOf(c2) !== -1;
  }

  function keyboardWeightedEditDistance(a, b) {
    const al = a.length, bl = b.length;
    const d = [];
    for (let i = 0; i <= al; i++) { d[i] = new Array(bl + 1); d[i][0] = i; }
    for (let j = 0; j <= bl; j++) d[0][j] = j;

    for (let i = 1; i <= al; i++) {
      for (let j = 1; j <= bl; j++) {
        const same = a[i - 1] === b[j - 1];
        const subCost = same ? 0 : (keyAdjacent(a[i - 1], b[j - 1]) ? 0.45 : 1.0);
        let val = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + subCost);
        // Transposition (Damerau)
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          const transCost = keyAdjacent(a[i - 1], a[i - 2]) ? 0.45 : 0.7;
          val = Math.min(val, d[i - 2][j - 2] + transCost);
        }
        d[i][j] = val;
      }
    }
    return d[al][bl];
  }

  function getNgrams(str, n = 2) {
    const v = [];
    for (let i = 0; i <= str.length - n; i++) v.push(str.slice(i, i + n));
    return v;
  }

  function ngramSimilarity(s1, s2, n = 2) {
    if (s1 === s2) return 1.0;
    if (s1.length < n || s2.length < n) return 0.0;
    const b1 = getNgrams(s1, n), b2 = getNgrams(s2, n);
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

  function weightedSimilarity(a, b) {
    if (a === b) return 1.0;
    const bigramScore = ngramSimilarity(a, b, 2);
    const trigramScore = ngramSimilarity(a, b, 3);
    const dist = keyboardWeightedEditDistance(a, b);
    const distScore = Math.max(0, 1 - dist / Math.max(a.length, b.length));
    const soundexBonus = (getSoundex(a) === getSoundex(b)) ? 0.15 : 0.0;

    return (bigramScore * 0.25) + (trigramScore * 0.15) + (distScore * 0.5) + soundexBonus;
  }

  const EDIT_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789#';

  function generateEdits(word) {
    const splits = [];
    for (let i = 0; i <= word.length; i++) splits.push([word.slice(0, i), word.slice(i)]);
    const result = new Set();
    splits.forEach(([l, r]) => {
      if (r) result.add(l + r.slice(1));
      if (r.length > 1) result.add(l + r[1] + r[0] + r.slice(2));
      if (r) {
        for (const c of EDIT_ALPHABET) result.add(l + c + r.slice(1));
      }
      for (const c of EDIT_ALPHABET) result.add(l + c + r);
    });
    return result;
  }

  function bruteForceSpellFix(token, vocabSet, maxLenForEdits2 = 9) {
    if (!token || token.length < 2) return token;
    if (vocabSet.has(token)) return token;

    const knownFix = KNOWN_TYPO_FIXES.get(token);
    if (knownFix && vocabSet.has(knownFix)) return knownFix;

    // Fast Pass 1: 1-edit distance
    const edits1Set = generateEdits(token);
    const hits1 = [];
    edits1Set.forEach(w => { if (vocabSet.has(w)) hits1.push(w); });
    if (hits1.length === 1) return hits1[0];
    if (hits1.length > 1) {
      let topCandidate = hits1[0], topScore = -1;
      hits1.forEach(c => {
        const sc = weightedSimilarity(token, c);
        if (sc > topScore) { topScore = sc; topCandidate = c; }
      });
      return topCandidate;
    }

    // Fast Pass 2: 2-edit distance (bounded length)
    if (token.length <= maxLenForEdits2) {
      const hits2 = new Set();
      for (const e1 of edits1Set) {
        const edits2Set = generateEdits(e1);
        for (const e2 of edits2Set) {
          if (vocabSet.has(e2)) hits2.add(e2);
        }
        if (hits2.size >= 3) break;
      }
      if (hits2.size > 0) {
        let topCandidate = null, topScore = -1;
        hits2.forEach(c => {
          const sc = weightedSimilarity(token, c);
          if (sc > topScore) { topScore = sc; topCandidate = c; }
        });
        if (topCandidate && topScore >= 0.65) return topCandidate;
      }
    }

    // Pass 3: Exhaustive Vocabulary Scan
    let best = null, bestScore = 0;
    vocabSet.forEach(vocab => {
      const score = weightedSimilarity(token, vocab);
      if (score > bestScore) { bestScore = score; best = vocab; }
    });

    return bestScore >= 0.70 ? best : token;
  }

  function preClean(text) {
    let t = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();

    t = t
      .replace(/won'?t/g, 'will not')
      .replace(/can'?t/g, 'can not')
      .replace(/n'?t\b/g, ' not')
      .replace(/'re\b/g, ' are')
      .replace(/'ll\b/g, ' will')
      .replace(/'ve\b/g, ' have')
      .replace(/'m\b/g, ' am')
      .replace(/c\s*#|c\s*sharp/g, 'csharp');

    // Run-length compression (soooo -> soo)
    t = t.replace(/([a-z])\1{2,}/g, '$1$1');

    // Keep units intact while exposing their constituent tokens
    t = t.replace(/(\d+)\s*(gb|mb|fps|hz|ghz)\b/g, (m, num, unit) => `${num}${unit} ${num} ${unit}`);

    return t;
  }

  function tokenizeAndNormalize(text) {
    if (!text) return [];
    const cleaned = preClean(text);
    const rawTokens = cleaned.replace(/[^a-z0-9#\s\.\_\-]/g, ' ').split(/\s+/).filter(t => t.length > 0);

    const withCompounds = [];
    rawTokens.forEach(token => {
      withCompounds.push(token);
      const cleanToken = token.replace(/[\.\_\-]/g, '');
      if (COMPOUND_TERMS[cleanToken]) {
        withCompounds.push(...COMPOUND_TERMS[cleanToken]);
      }
    });
    return withCompounds;
  }

  function stemAndExpand(tokens) {
    const expanded = new Set();
    tokens.forEach(token => {
      const stemmed = stemWord(token);
      expanded.add(stemmed);
      const synonyms = SYNONYM_MAP.get(token) || SYNONYM_MAP.get(stemmed);
      if (synonyms) synonyms.forEach(s => expanded.add(stemWord(s)));
    });
    return Array.from(expanded);
  }

  // 7. Multi-Field BM25+ Engine (BM25F)
  class BM25Engine {
    constructor(k1 = 1.25, b = 0.75, delta = 1.0) {
      this.k1 = k1;
      this.b = b;
      this.delta = delta; // BM25+ lower bound offset
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
      this.knownVocabulary = new Set();

      this.docs.forEach((doc, i) => {
        // Field weighted tokens: Keywords (4x), Title (3.5x), Body (1.5x)
        const kwTokens = stemAndExpand(tokenizeAndNormalize((doc.keywords || []).join(' ')));
        const titleTokens = stemAndExpand(tokenizeAndNormalize(doc.title || ''));
        const bodyTokens = stemAndExpand(tokenizeAndNormalize((doc.response && doc.response.text) ? doc.response.text : ''));

        const tf = new Map();

        const addFieldTokens = (tokens, weight) => {
          tokens.forEach(tok => {
            tf.set(tok, (tf.get(tok) || 0) + weight);
            this.knownVocabulary.add(tok);
          });
        };

        addFieldTokens(kwTokens, 4.0);
        addFieldTokens(titleTokens, 3.5);
        addFieldTokens(bodyTokens, 1.5);

        const docLen = (kwTokens.length * 4.0) + (titleTokens.length * 3.5) + (bodyTokens.length * 1.5);
        this.docLengths[i] = docLen;
        totalLength += docLen;
        this.docTermFreqs[i] = tf;

        const uniqueTokens = new Set([...kwTokens, ...titleTokens, ...bodyTokens]);
        uniqueTokens.forEach(token => {
          docFreqs.set(token, (docFreqs.get(token) || 0) + 1);
        });
      });

      this.avgDocLength = totalLength / (this.docs.length || 1);

      docFreqs.forEach((df, term) => {
        // BM25 standard IDF with smoothing
        const idfValue = Math.log(1 + (this.docs.length - df + 0.5) / (df + 0.5));
        this.idf.set(term, Math.max(idfValue, 0.05));
      });
    }

    getCombinedVocab() {
      const combined = new Set(STATIC_VOCAB);
      this.knownVocabulary.forEach(t => combined.add(t));
      return combined;
    }

    search(queryTokens, rawQuery = '') {
      const scores = new Array(this.docs.length).fill(0);
      const matchedTermsCount = new Array(this.docs.length).fill(0);

      queryTokens.forEach(token => {
        const idf = this.idf.get(token);
        if (!idf) return;

        this.docs.forEach((doc, i) => {
          const tf = this.docTermFreqs[i].get(token) || 0;
          if (tf === 0) return;

          matchedTermsCount[i]++;
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * (1 - this.b + this.b * (this.docLengths[i] / this.avgDocLength));
          // BM25+ addition: + delta ensures non-zero baseline reward for term match
          scores[i] += idf * ((numerator / denominator) + this.delta);
        });
      });

      // Proximity & bigram boost
      if (queryTokens.length >= 2 && rawQuery) {
        const cleanRaw = rawQuery.toLowerCase();
        for (let j = 0; j < queryTokens.length - 1; j++) {
          const bigram = queryTokens[j] + ' ' + queryTokens[j + 1];
          if (cleanRaw.includes(bigram)) {
            this.docs.forEach((doc, i) => {
              const kwStr = (doc.keywords || []).join(' ').toLowerCase();
              if (kwStr.includes(bigram)) {
                scores[i] += PROXIMITY_BOOST;
              }
            });
          }
        }
      }

      // Coverage boost: reward documents that match a higher proportion of query tokens
      this.docs.forEach((doc, i) => {
        if (queryTokens.length > 0 && matchedTermsCount[i] > 1) {
          const coverageRatio = matchedTermsCount[i] / queryTokens.length;
          scores[i] *= (1 + coverageRatio * 0.4);
        }
      });

      return scores
        .map((score, index) => ({ doc: this.docs[index], score }))
        .filter(res => res.score > 0)
        .sort((a, b) => b.score - a.score);
    }
  }

  const engine = new BM25Engine();
  let loadedTopics = [];

  function expandAndStemQuery(text) {
    const rawTokens = tokenizeAndNormalize(text);
    const corrected = rawTokens.map(tok => bruteForceSpellFix(tok, engine.getCombinedVocab()));
    // Filter pure stopwords from BM25 scoring unless the entire query consists of stopwords
    const contentTokens = corrected.filter(t => !STOP_WORDS.has(t));
    const finalTokens = contentTokens.length > 0 ? contentTokens : corrected;
    return stemAndExpand(finalTokens);
  }

  // 8. Dynamic Offline Intent & Conversational Synthesizer ("Mini-LLM Fallback")
  function evaluateDeterministicIntents(rawQuery, contextHistory = []) {
    const q = rawQuery.toLowerCase().trim();

    // Intent A: Interactive RAM & Hardware Advisor
    const ramMatch = q.match(/\b(4|6|8|12|16|24)\s*(?:gb|g)?\s*(?:ram)?\b/i) ||
                     q.match(/(?:poco\s*x6\s*pro|snapdragon|dimensity|adreno|mali)/i);

    const asksAboutHardware = q.includes('ram') || q.includes('spec') || q.includes('run') || q.includes('can i') || q.includes('enough') || q.includes('hardware');

    if (ramMatch && asksAboutHardware) {
      const ramSize = parseInt(ramMatch[1], 10);
      let advice = '';

      if (ramSize === 4) {
        advice = `For **4 GB RAM**, Wuthering Waves will experience severe memory strain, stutters, and spontaneous force-closes. <strong>Recommendation:</strong> Do NOT enable the C# Environment, stick exclusively to vanilla defaults or the lowest PERFORMANCE presets, and close all background apps before playing.`;
      } else if (ramSize === 6) {
        advice = `For **6 GB RAM**, your device meets the baseline requirement for <code>STABLE</code> and <code>PERFORMANCE</code> presets.<br><br>⚠️ <strong>Crucial Warning:</strong> Do <strong>NOT</strong> enable <code>-ForceEnableCSharpEnvironment</code> in Misc Patch. The experimental C# runtime requires at least 8 GB RAM; running it on 6 GB triggers out-of-memory crashes during intensive combat and realm teleportation.`;
      } else if (ramSize === 8) {
        advice = `For **8 GB RAM**, you are in the recommended sweet spot! 8 GB is the <strong>exact minimum recommended RAM</strong> to safely run Kuro's <strong>C# Environment</strong> (<code>-ForceEnableCSharpEnvironment</code>). You can comfortably use <code>STABLE</code> or <code>PERFORMANCE</code> presets. If you experience stutters in open-world combat, verify your Vulkan shaders in Settings &gt; Danger Zone.`;
      } else if (ramSize >= 12) {
        advice = `With **${ramSize} GB RAM**, your hardware has abundant headroom! You can run <code>HIGH_VISUAL</code> or <code>EXTREME</code> presets alongside the <strong>C# Environment</strong> without memory constraints. Consider setting <code>r.MobileContentScaleFactor = 1.2</code> to <code>1.5</code> for crisp 3D resolution.`;
      }

      if (advice) {
        return {
          id: 'synthetic-ram-advisor',
          title: `Hardware Analysis: ${ramSize || 'Device'} RAM`,
          response: {
            text: advice,
            link: 'pages/utilities-diagnostics.html',
            linkText: 'Open Device Stats Collector'
          }
        };
      }
    }

    // Intent B: Section Guard & "Red Text" Diagnosis
    if (q.includes('red') || q.includes('vibrant red') || q.includes('#ff2222') || q.includes('prefix error')) {
      return {
        id: 'synthetic-red-cvars',
        title: 'Section Guard Red Highlight Fix',
        response: {
          text: `CVars highlighted in <strong style="color: #FF2222;">Vibrant Red (#FF2222)</strong> indicate either an invalid prefix (such as <code>CVars=</code> or <code>+CVars=</code> inside <code>Engine.ini</code>) or a variable placed under the wrong section header.<br><br><strong>Instant Fix:</strong><br>1. Tap <strong>Save</strong> in the Config Editor.<br>2. Select <strong>Auto-Fix Sections</strong> in the prompt. The patcher will automatically strip illegal prefixes and route variables to their canonical headers (<code>[/Script/Engine.RendererSettings]</code>, <code>[/Script/Engine.StreamingSettings]</code>, etc.). Whitelisted sections like <code>[Core.Paths]</code> remain completely untouched.`,
          link: 'pages/config-editor.html#cvar-guards',
          linkText: 'View Section Guards Guide'
        }
      };
    }

    // Intent C: Xiaomi / HyperOS / MIUI Shizuku Elevation Failure
    if ((q.includes('xiaomi') || q.includes('hyperos') || q.includes('miui') || q.includes('unauthorized')) &&
        (q.includes('shizuku') || q.includes('permission') || q.includes('backend') || q.includes('access'))) {
      return {
        id: 'synthetic-xiaomi-fix',
        title: 'Xiaomi / HyperOS Shizuku Permission Resolution',
        response: {
          text: `Xiaomi devices running MIUI or HyperOS enforce an extra security layer that blocks standard ADB file injections.<br><br><strong>Mandatory Fix:</strong><br>1. Open Android <strong>Settings &gt; Additional Settings &gt; Developer Options</strong>.<br>2. Scroll down and enable <strong>"USB Debugging (Security Settings)"</strong> (this requires a signed-in Mi Account and 3 security confirmation prompts).<br>3. Re-open the Shizuku app, tap <strong>Stop</strong>, then <strong>Start</strong>.<br>4. Return to WuWa Config Patcher and tap <strong>Refresh</strong> under Settings &gt; Application Info.`,
          link: 'pages/setup-shizuku.html',
          linkText: 'View Shizuku Setup Guide'
        }
      };
    }

    // Intent D: Game Crash / Stutter Fast Remediation Checklist
    if ((q.includes('crash') || q.includes('black screen') || q.includes('freeze') || q.includes('wont open')) &&
        (q.includes('how to') || q.includes('fix') || q.includes('help') || q.includes('game keeps') || q.length < 25)) {
      return {
        id: 'synthetic-crash-flow',
        title: 'Game Crash Fast Recovery',
        response: {
          text: `<strong>Emergency Remediation Steps:</strong><br>1. <strong>Revert to Vanilla:</strong> Go to <strong>Utilities &gt; Common &gt; Vanilla mode</strong> and tap <strong>Revert to Vanilla</strong> to wipe corrupt INIs.<br>2. <strong>Wipe Shader Caches:</strong> Go to <strong>Settings &gt; Danger Zone &gt; Delete Shaders</strong> to flush Vulkan / OpenGL binaries.<br>3. <strong>Strip Forbidden CVars:</strong> Go to <strong>Utilities &gt; Advanced &gt; Strip Forbidden</strong> and tap <strong>Auto Strip All</strong>.<br>4. <strong>Turn off C#:</strong> If your phone has less than 8 GB RAM, uncheck <code>-ForceEnableCSharpEnvironment</code> under Editor &gt; Misc Patch.`,
          link: 'pages/patching-configs.html#revert',
          linkText: 'Open Recovery & Revert Guide'
        }
      };
    }

    return null;
  }

  // 9. Co-reference Query Context Enrichment
  function buildEnrichedQueryTokens(rawQuery, contextWindow) {
    let cleanQuery = rawQuery;

    // Resolve anaphora / co-reference from previous assistant context
    if (Array.isArray(contextWindow) && contextWindow.length > 0) {
      const lastUserMsg = [...contextWindow].reverse().find(m => m.role === 'user');
      if (lastUserMsg && lastUserMsg.text) {
        const prevText = lastUserMsg.text.toLowerCase();
        // If current query is brief or anaphoric, inject previous topic anchors
        if (rawQuery.length < 18 || /^(it|this|that|why|how|what about|still)\b/i.test(rawQuery)) {
          if (prevText.includes('shizuku')) cleanQuery += ' shizuku';
          else if (prevText.includes('c#') || prevText.includes('csharp')) cleanQuery += ' csharp';
          else if (prevText.includes('ram')) cleanQuery += ' ram hardware';
          else if (prevText.includes('crash') || prevText.includes('lag')) cleanQuery += ' crash stutter';
          else if (prevText.includes('cvar')) cleanQuery += ' cvars';
        }
      }
    }

    return {
      cleanQuery,
      tokens: expandAndStemQuery(cleanQuery)
    };
  }

  function applyPhraseBoost(matches, cleanQuery) {
    if (!cleanQuery) return matches;
    return matches.map(m => {
      const keywords = m.doc.keywords || [];
      const hit = keywords.some(k => {
        const kw = k.toLowerCase();
        if (kw === cleanQuery) return true;
        const isPhrase = kw.includes(' ') && kw.length >= 5;
        if (!isPhrase) return false;
        return cleanQuery.includes(kw) || (cleanQuery.length >= 6 && kw.includes(cleanQuery));
      });
      return hit ? { doc: m.doc, score: m.score + PHRASE_BOOST } : m;
    }).sort((a, b) => b.score - a.score);
  }

  function reinforceTopic(userQuery, topicId) {
    const memory = JSON.parse(localStorage.getItem(LEARNED_CACHE_KEY) || '{}');
    const cleanKey = userQuery.toLowerCase().trim();
    memory[cleanKey] = topicId;
    localStorage.setItem(LEARNED_CACHE_KEY, JSON.stringify(memory));

    const target = loadedTopics.find(t => t.id === topicId);
    if (target) {
      const { tokens } = buildEnrichedQueryTokens(userQuery, []);
      if (!target.keywords) target.keywords = [];
      target.keywords.push(...tokens);
      engine.index(loadedTopics);
    }
  }

  function getRankedMatches(rawQuery, contextWindow = []) {
    if (!rawQuery) return { matches: [], learnedMatch: null };
    const cleanQuery = rawQuery.toLowerCase().trim();

    // 1. Direct learned override
    const memory = JSON.parse(localStorage.getItem(LEARNED_CACHE_KEY) || '{}');
    if (memory[cleanQuery]) {
      const directDoc = loadedTopics.find(t => t.id === memory[cleanQuery]);
      if (directDoc) {
        return { matches: [{ doc: directDoc, score: 99.0 }], learnedMatch: directDoc };
      }
    }

    // 2. High-precision Deterministic Intent Synthesis
    const syntheticIntent = evaluateDeterministicIntents(rawQuery, contextWindow);
    if (syntheticIntent) {
      return {
        matches: [{ doc: syntheticIntent, score: 100.0 }],
        learnedMatch: syntheticIntent
      };
    }

    // 3. Multi-field BM25+ search with enriched tokens & phrase boost
    const { cleanQuery: enrichedQuery, tokens: queryTokens } = buildEnrichedQueryTokens(rawQuery, contextWindow);
    const rawMatches = engine.search(queryTokens, enrichedQuery);
    const matches = applyPhraseBoost(rawMatches, cleanQuery);

    return { matches, learnedMatch: null };
  }

  function findBestMatch(rawQuery, contextWindow = []) {
    const { matches, learnedMatch } = getRankedMatches(rawQuery, contextWindow);
    if (learnedMatch) return learnedMatch.response;
    if (matches.length > 0) return matches[0].doc.response;

    return {
      text: `I couldn't find a direct match. Did you experience a game crash, stutter, Shizuku connection issue, or need help with CVars and section guards? Try asking: "how to fix crash", "recommended ram", or "shizuku setup".`,
      link: 'index.html',
      linkText: 'Explore Documentation Home'
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
    } catch (err) {
      console.warn('Could not fetch remote assets/ai-knowledge.json, using baseline topics.', err);
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