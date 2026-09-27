// EduBook — ai-engine.js
//
// A self-contained "AI layer" for the app. Everything works out of the box
// with zero configuration using local heuristics (fuzzy matching, statistics
// over the existing book data, and rule-based chat) — no API key needed to
// demo every feature.
//
// If you want to swap any feature for a real LLM (OpenAI, Anthropic, etc.),
// there is exactly ONE integration point: AIEngine.callLLM(prompt). Fill in
// AI_PROVIDER_CONFIG below and flip its `enabled` flag — every feature that
// can benefit from a real model (summaries, chat replies) will automatically
// prefer callLLM() and fall back to the local heuristic if it fails or is
// disabled, so nothing breaks if you don't configure a provider.
(function (global) {

  // ------------------------------------------------------------------
  // 1. OPTIONAL real-LLM hook (disabled by default — fully local otherwise)
  // ------------------------------------------------------------------
  var AI_PROVIDER_CONFIG = {
    enabled: false,               // set true once endpoint/key are filled in
    endpoint: '',                 // e.g. 'https://api.openai.com/v1/chat/completions'
    apiKey: '',                   // NEVER hardcode a real key in a shipped front-end file —
                                   // proxy this through your own php/ai_proxy.php instead.
    model: 'gpt-4o-mini'
  };

  async function callLLM(prompt) {
    if (!AI_PROVIDER_CONFIG.enabled || !AI_PROVIDER_CONFIG.endpoint) return null;
    try {
      // Recommended: point this at your own php/ai_proxy.php, which holds the
      // real API key server-side and forwards the prompt — never ship a key
      // to the browser. This fetch is intentionally generic.
      var res = await fetch(AI_PROVIDER_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: AI_PROVIDER_CONFIG.model, prompt: prompt })
      });
      if (!res.ok) return null;
      var data = await res.json();
      return data.text || data.reply || null;
    } catch (e) {
      return null;
    }
  }

  // ------------------------------------------------------------------
  // 2. Small string-similarity toolkit (no external library required)
  // ------------------------------------------------------------------
  var SYNONYMS = {
    'maths': 'mathematics', 'math': 'mathematics', 'eng': 'engineering',
    'cs': 'computer science', 'csc': 'computer science', 'ece': 'electronics',
    'eee': 'electrical', 'mech': 'mechanical', 'civil': 'civil engineering',
    'mba': 'management', 'mca': 'computer applications', 'phy': 'physics',
    'chem': 'chemistry', 'bio': 'biology', 'eco': 'economics', 'econ': 'economics',
    'psy': 'psychology', 'psyc': 'psychology', 'hist': 'history', 'lit': 'literature'
  };

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function expandTokens(s) {
    return normalize(s).split(' ').filter(Boolean).map(function (t) { return SYNONYMS[t] || t; });
  }

  // Levenshtein distance, capped for short strings (title/author words).
  function editDistance(a, b) {
    a = a || ''; b = b || '';
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = new Array(n + 1);
    var curr = new Array(n + 1);
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      curr[0] = i;
      for (var jj = 1; jj <= n; jj++) {
        var cost = a[i - 1] === b[jj - 1] ? 0 : 1;
        curr[jj] = Math.min(prev[jj] + 1, curr[jj - 1] + 1, prev[jj - 1] + cost);
      }
      var tmp = prev; prev = curr; curr = tmp;
    }
    return prev[n];
  }

  function similarity(a, b) {
    a = normalize(a); b = normalize(b);
    if (!a || !b) return 0;
    var dist = editDistance(a, b);
    var maxLen = Math.max(a.length, b.length);
    return 1 - dist / maxLen;
  }

  // ------------------------------------------------------------------
  // 3. Smart Search — fuzzy, typo-tolerant, synonym-aware
  // ------------------------------------------------------------------
  function smartSearch(query, books) {
    var qTokens = expandTokens(query);
    if (!qTokens.length) return [];

    var scored = books.map(function (book) {
      var haystack = expandTokens([book.title, book.author, book.category, book.isbn].join(' '));
      var score = 0;

      qTokens.forEach(function (qt) {
        var best = 0;
        haystack.forEach(function (ht) {
          if (ht === qt) best = Math.max(best, 1);
          else if (ht.indexOf(qt) !== -1 || qt.indexOf(ht) !== -1) best = Math.max(best, 0.75);
          else best = Math.max(best, similarity(qt, ht) > 0.72 ? similarity(qt, ht) * 0.7 : 0);
        });
        score += best;
      });

      return { book: book, score: score / qTokens.length };
    });

    return scored
      .filter(function (s) { return s.score > 0.28; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (s) { return s.book; });
  }

  // ------------------------------------------------------------------
  // 4. Personalized recommendations
  // ------------------------------------------------------------------
  function getRecommendations(allBooks, opts) {
    opts = opts || {};
    var limit = opts.limit || 6;
    var wishlistIds = opts.wishlistIds || [];
    var wishlistBooks = allBooks.filter(function (b) { return wishlistIds.indexOf(b.id) !== -1; });

    var categoryWeight = {};
    wishlistBooks.forEach(function (b) {
      categoryWeight[b.category] = (categoryWeight[b.category] || 0) + 2;
    });

    if (!Object.keys(categoryWeight).length) {
      // Cold start: fall back to trending/popular-looking picks.
      return allBooks.filter(function (b) { return b.status !== 'Sold'; }).slice(0, limit);
    }

    var wishlistIdSet = wishlistIds;
    var scored = allBooks
      .filter(function (b) { return wishlistIdSet.indexOf(b.id) === -1 && b.status !== 'Sold'; })
      .map(function (b) {
        var score = categoryWeight[b.category] || 0.2;
        if (b.discountPrice != null) score += 0.5; // slight nudge for good deals
        return { book: b, score: score };
      })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (s) { return s.book; });

    return scored.slice(0, limit);
  }

  // ------------------------------------------------------------------
  // 5. Book summaries (templated locally; upgrades automatically to a
  //    real LLM if AI_PROVIDER_CONFIG.enabled is turned on)
  // ------------------------------------------------------------------
  function localSummary(book) {
    var category = book.category || 'this subject';
    var pricePart = book.discountPrice != null
      ? 'now discounted to \u20b9' + book.discountPrice + ' from \u20b9' + book.price
      : 'listed at \u20b9' + book.price;
    return '"' + book.title + '" by ' + (book.author || 'an unlisted author') +
      ' is a ' + category + ' textbook, ' + pricePart + '. ' +
      (book.status === 'Sold' ? 'This copy has already sold.' : 'Good pick if you\u2019re studying ' + category + '.');
  }

  async function summarize(book) {
    var llm = await callLLM('Write a 1-2 sentence student-friendly summary of the textbook "' +
      book.title + '" by ' + book.author + ' (category: ' + book.category + ').');
    return llm || localSummary(book);
  }

  // ------------------------------------------------------------------
  // 6. Price suggestion for sellers
  // ------------------------------------------------------------------
  function suggestPrice(category, referenceBooks) {
    var cat = normalize(category);
    var relevant = referenceBooks.filter(function (b) {
      return normalize(b.category).indexOf(cat) !== -1 || cat.indexOf(normalize(b.category)) !== -1;
    });
    var pool = relevant.length ? relevant : referenceBooks;
    if (!pool.length) return null;

    var prices = pool.map(function (b) { return b.discountPrice != null ? b.discountPrice : b.price; }).filter(Boolean);
    if (!prices.length) return null;

    prices.sort(function (a, b) { return a - b; });
    var mid = prices[Math.floor(prices.length / 2)];
    var low = Math.round(mid * 0.85 / 5) * 5;
    var high = Math.round(mid * 1.15 / 5) * 5;
    return { low: low, high: high, sampleSize: pool.length };
  }

  // ------------------------------------------------------------------
  // 7. Duplicate listing detection
  // ------------------------------------------------------------------
  function findDuplicates(candidate, existingBooks) {
    return existingBooks
      .map(function (b) {
        var titleSim = similarity(candidate.title, b.title);
        var sameIsbn = candidate.isbn && b.isbn && normalize(candidate.isbn) === normalize(b.isbn);
        var score = sameIsbn ? 1 : titleSim * 0.8 + (similarity(candidate.author || '', b.author || '') * 0.2);
        return { book: b, score: score, sameIsbn: !!sameIsbn };
      })
      .filter(function (r) { return r.score > 0.82; })
      .sort(function (a, b) { return b.score - a.score; });
  }

  // ------------------------------------------------------------------
  // 8. Basic fraud / suspicious-listing scoring
  // ------------------------------------------------------------------
  function assessFraudRisk(candidate, referenceBooks) {
    var flags = [];
    var suggestion = suggestPrice(candidate.category, referenceBooks);

    if (suggestion) {
      if (candidate.price < suggestion.low * 0.4) {
        flags.push('Price is far below similar listings \u2014 double-check it\u2019s not a mistake or a scam.');
      }
      if (candidate.price > suggestion.high * 2.5) {
        flags.push('Price is unusually high compared to similar listings.');
      }
    }
    if (!candidate.isbn || String(candidate.isbn).replace(/\D/g, '').length < 10) {
      flags.push('ISBN looks incomplete or missing.');
    }
    if (candidate.title && candidate.title.trim().split(' ').length < 2) {
      flags.push('Title looks unusually short/generic for a textbook.');
    }

    var level = flags.length >= 2 ? 'high' : (flags.length === 1 ? 'medium' : 'low');
    return { level: level, flags: flags };
  }

  // ------------------------------------------------------------------
  // 9. Chatbot reply logic
  // ------------------------------------------------------------------
  var FAQ = [
    { q: ['sell', 'list a book', 'how to sell'], a: 'Go to Sell Books or Upload Book from Home, fill in the details, and it appears in Recent Uploads right away.' },
    { q: ['order', 'track', 'status', 'delivery'], a: 'Open Profile \u2192 My Orders to see the status of every order: Processing, Shipped, Delivered, or Cancelled.' },
    { q: ['password', 'forgot', 'reset'], a: 'On the sign-in screen, tap "Forgot password?" to get a one-time code by email, or use Profile \u2192 Change Password if you\u2019re already signed in.' },
    { q: ['wishlist', 'save', 'heart'], a: 'Tap the heart icon on any book to save it \u2014 find everything you\u2019ve saved under Profile \u2192 Wishlist.' },
    { q: ['delete', 'remove listing'], a: 'Open Profile \u2192 My Uploaded Books and tap Delete on any listing.' },
    { q: ['refund', 'cancel order'], a: 'Cancellations depend on the order status. Contact the seller via Profile \u2192 My Orders, or reach EduBook support via Contact Us.' },
    { q: ['price', 'how much', 'cost'], a: 'Ask me about a specific book title and I\u2019ll tell you its price and whether there\u2019s a discount.' }
  ];

  function findBookMention(message, allBooks) {
    var norm = normalize(message);
    var best = null, bestScore = 0;
    allBooks.forEach(function (b) {
      var s = similarity(b.title, message);
      if (norm.indexOf(normalize(b.title)) !== -1) s = 1;
      if (s > bestScore) { bestScore = s; best = b; }
    });
    return bestScore > 0.5 ? best : null;
  }

  async function chatReply(message, allBooks) {
    var norm = normalize(message);

    if (/^(hi|hello|hey)\b/.test(norm)) {
      return 'Hi! I can help you find books, check prices, track orders, or answer questions about selling on EduBook. What do you need?';
    }

    var mentioned = findBookMention(message, allBooks || []);
    if (mentioned) {
      var priceLine = mentioned.discountPrice != null
        ? '\u20b9' + mentioned.discountPrice + ' (down from \u20b9' + mentioned.price + ')'
        : '\u20b9' + mentioned.price;
      return '"' + mentioned.title + '" by ' + (mentioned.author || 'unknown author') + ' is ' + priceLine +
        ', status: ' + (mentioned.status || 'Available') + '. ' + localSummary(mentioned);
    }

    for (var i = 0; i < FAQ.length; i++) {
      if (FAQ[i].q.some(function (kw) { return norm.indexOf(kw) !== -1; })) {
        return FAQ[i].a;
      }
    }

    var llm = await callLLM('You are the EduBook student-marketplace support assistant. Answer briefly: ' + message);
    return llm || 'I\u2019m not sure about that yet \u2014 try asking about a specific book, an order, selling, or your password. You can also reach a human via Profile \u2192 Contact Us.';
  }

  global.AIEngine = {
    config: AI_PROVIDER_CONFIG,
    callLLM: callLLM,
    smartSearch: smartSearch,
    getRecommendations: getRecommendations,
    summarize: summarize,
    localSummary: localSummary,
    suggestPrice: suggestPrice,
    findDuplicates: findDuplicates,
    assessFraudRisk: assessFraudRisk,
    chatReply: chatReply,
    _similarity: similarity
  };
})(window);
