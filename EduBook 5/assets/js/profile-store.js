// EduBook — profile-store.js
// A self-contained data layer for the Profile feature, following the same
// "localStorage-backed helper object" pattern as js/store.js. It never
// modifies data owned by js/store.js — it only reads from it (defensively,
// via typeof checks) and layers its own additive state on top, so nothing
// about the existing wishlist / uploads / catalog behaviour changes.
(function (global) {
  var KEY = 'edubook_profile_v1';

  function readAuthUser() {
    try { return JSON.parse(localStorage.getItem('edubook_user') || '{}'); }
    catch (e) { return {}; }
  }

  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  function defaults() {
    var authUser = readAuthUser();
    return {
      fullName: authUser.username || '',
      email: authUser.email || '',
      phone: '',
      dob: '',
      photo: null,
      settings: { notifications: true, darkMode: false, language: 'en' },
      cart: [],
      orders: [
        {
          id: 'ORD-1001',
          items: [{ title: 'Engineering Mathematics I', qty: 1, price: 350 }],
          total: 350,
          status: 'Delivered',
          placedAt: daysAgo(18)
        },
        {
          id: 'ORD-1002',
          items: [{ title: 'Digital Logic Design', qty: 1, price: 420 }],
          total: 420,
          status: 'Shipped',
          placedAt: daysAgo(3)
        }
      ],
      uploadOverrides: {},
      hiddenUploads: [],
      soldUploads: []
    };
  }

  function load() {
    var data = null;
    try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { data = null; }
    var d = defaults();
    if (!data || typeof data !== 'object') return d;
    var merged = Object.assign({}, d, data);
    merged.settings = Object.assign({}, d.settings, data.settings || {});
    merged.uploadOverrides = Object.assign({}, data.uploadOverrides || {});
    merged.hiddenUploads = data.hiddenUploads || [];
    merged.soldUploads = data.soldUploads || [];
    merged.cart = data.cart || [];
    merged.orders = data.orders || d.orders;
    return merged;
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  function allKnownBooks() {
    var sets = [];
    if (typeof CATALOG_BOOKS !== 'undefined') sets.push(CATALOG_BOOKS);
    if (typeof SELL_BOOKS !== 'undefined') sets.push(SELL_BOOKS);
    if (typeof UPLOAD_BOOKS !== 'undefined') sets.push(UPLOAD_BOOKS);
    var userUploads = [];
    try {
      if (typeof Store !== 'undefined' && Store.getRecentUploads) userUploads = Store.getRecentUploads();
    } catch (e) { userUploads = []; }
    return [].concat.apply([], sets).concat(userUploads);
  }

  var ProfileStore = {

    // ---------------------------- Profile info ----------------------------
    getProfile: function () {
      var d = load();
      return { fullName: d.fullName, email: d.email, phone: d.phone, dob: d.dob, photo: d.photo };
    },
    saveProfile: function (partial) {
      var d = load();
      Object.assign(d, partial);
      save(d);
      return d;
    },

    // ------------------------------ Settings -------------------------------
    getSettings: function () { return load().settings; },
    saveSettings: function (partial) {
      var d = load();
      Object.assign(d.settings, partial);
      save(d);
      return d.settings;
    },

    // -------------------------------- Cart ----------------------------------
    getCart: function () {
      var d = load();
      var catalog = allKnownBooks();
      return d.cart.map(function (line) {
        var book = catalog.filter(function (b) { return b.id === line.bookId; })[0];
        if (!book) book = { id: line.bookId, title: line.title || 'Untitled', price: line.price || 0, cover: ['#2A2E35', '#101215'] };
        var unit = (book.discountPrice != null ? book.discountPrice : book.price) || line.price || 0;
        return Object.assign({}, book, { qty: line.qty, unitPrice: unit, lineTotal: unit * line.qty });
      });
    },
    searchAddableBooks: function (query) {
      var q = (query || '').trim().toLowerCase();
      var books = allKnownBooks();
      if (!q) return books.slice(0, 8);
      return books.filter(function (b) {
        return (b.title || '').toLowerCase().indexOf(q) !== -1 ||
               (b.author || '').toLowerCase().indexOf(q) !== -1 ||
               (b.isbn || '').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);
    },
    addToCart: function (bookId, meta, qty) {
      qty = qty || 1;
      var d = load();
      var existing = d.cart.filter(function (l) { return l.bookId === bookId; })[0];
      if (existing) existing.qty += qty;
      else d.cart.push({ bookId: bookId, qty: qty, title: meta && meta.title, price: meta && (meta.discountPrice != null ? meta.discountPrice : meta.price) });
      save(d);
    },
    updateCartQty: function (bookId, qty) {
      var d = load();
      var line = d.cart.filter(function (l) { return l.bookId === bookId; })[0];
      if (line) { line.qty = Math.max(1, qty); save(d); }
    },
    removeFromCart: function (bookId) {
      var d = load();
      d.cart = d.cart.filter(function (l) { return l.bookId !== bookId; });
      save(d);
    },
    getCartTotal: function () {
      return ProfileStore.getCart().reduce(function (s, l) { return s + l.lineTotal; }, 0);
    },
    checkout: function () {
      var items = ProfileStore.getCart();
      if (!items.length) return null;
      var d = load();
      var order = {
        id: 'ORD-' + String(Date.now()).slice(-6),
        items: items.map(function (i) { return { title: i.title, qty: i.qty, price: i.unitPrice }; }),
        total: items.reduce(function (s, i) { return s + i.lineTotal; }, 0),
        status: 'Processing',
        placedAt: new Date().toISOString()
      };
      d.orders.unshift(order);
      d.cart = [];
      save(d);
      return order;
    },

    // ------------------------------- Orders ---------------------------------
    getOrders: function () { return load().orders; },

    // --------------------------- Uploaded books ------------------------------
    // Soft-edit / soft-delete layer over whatever js/store.js already tracks,
    // so the original uploads array on Home / Recent Uploads is never mutated.
    getMyUploads: function () {
      var d = load();
      var uploads = [];
      try { uploads = (typeof Store !== 'undefined' && Store.getRecentUploads) ? Store.getRecentUploads() : []; }
      catch (e) { uploads = []; }
      return uploads
        .filter(function (b) { return d.hiddenUploads.indexOf(b.id) === -1; })
        .map(function (b) {
          var o = d.uploadOverrides[b.id];
          var merged = o ? Object.assign({}, b, o) : Object.assign({}, b);
          merged.status = d.soldUploads.indexOf(b.id) !== -1 ? 'Sold' : (merged.status || 'Available');
          return merged;
        });
    },
    updateUpload: function (id, fields) {
      var d = load();
      d.uploadOverrides[id] = Object.assign({}, d.uploadOverrides[id], fields);
      save(d);
    },
    deleteUpload: function (id) {
      var d = load();
      if (d.hiddenUploads.indexOf(id) === -1) d.hiddenUploads.push(id);
      save(d);
    },
    markSold: function (id, soldPrice) {
      var d = load();
      if (d.soldUploads.indexOf(id) === -1) d.soldUploads.push(id);
      d.uploadOverrides[id] = Object.assign({}, d.uploadOverrides[id], {
        status: 'Sold', soldPrice: soldPrice, soldAt: new Date().toISOString()
      });
      save(d);
    },

    // -------------------------------- Sales -----------------------------------
    getSales: function () {
      var d = load();
      var uploads = ProfileStore.getMyUploads();
      var sold = uploads.filter(function (b) { return d.soldUploads.indexOf(b.id) !== -1; });
      var earnings = sold.reduce(function (s, b) {
        return s + (b.soldPrice != null ? b.soldPrice : (b.discountPrice != null ? b.discountPrice : (b.price || 0)));
      }, 0);
      return { sold: sold, earnings: earnings };
    },

    // ------------------------------ Lookup helper -------------------------------
    findBookById: function (id) {
      var pool = ProfileStore.getMyUploads().concat(allKnownBooks());
      return pool.filter(function (b) { return b.id === id; })[0] || null;
    },

    // -------------------------------- Buy Now -----------------------------------
    // Places an order for exactly this book/qty immediately, without touching
    // whatever is already sitting in the cart.
    buyNow: function (book, qty) {
      qty = qty || 1;
      var unit = book.discountPrice != null ? book.discountPrice : book.price;
      var d = load();
      var order = {
        id: 'ORD-' + String(Date.now()).slice(-6),
        items: [{ title: book.title, qty: qty, price: unit }],
        total: unit * qty,
        status: 'Processing',
        placedAt: new Date().toISOString()
      };
      d.orders.unshift(order);
      save(d);
      return order;
    },

    // ---------------------------- Account deletion ------------------------------
    deleteAccount: function () {
      return fetch('../php/delete_account.php', { method: 'POST', credentials: 'same-origin' })
        .catch(function () {})
        .then(function () {
          localStorage.removeItem(KEY);
          localStorage.removeItem('edubook_user');
        });
    }
  };

  global.ProfileStore = ProfileStore;
})(window);
