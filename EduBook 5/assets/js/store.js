// EduBook — store.js
// localStorage-backed helpers for the wishlist and user-submitted uploads,
// plus read helpers (trending/offers/search/lookup) used across every
// browsing page. This is the "Store" object every other page script calls.
const Store = (function () {
  const WISHLIST_KEY = 'edubook_wishlist';
  const UPLOADS_KEY = 'edubook_uploads';

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // js/profile-store.js is where "delete this upload" actually lives (it
  // soft-deletes by id into edubook_profile_v1.hiddenUploads rather than
  // mutating the seeded/localStorage upload lists directly). Reading that
  // same key here — rather than calling ProfileStore — means every read
  // helper below stays correct even on pages that load store.js without
  // profile-store.js, and regardless of script load order.
  function getHiddenUploadIds() {
    try {
      const raw = localStorage.getItem('edubook_profile_v1');
      const data = raw ? JSON.parse(raw) : null;
      return (data && Array.isArray(data.hiddenUploads)) ? data.hiddenUploads : [];
    } catch (e) {
      return [];
    }
  }

  // ------------------------------- Wishlist -------------------------------
  function getWishlist() {
    return readJSON(WISHLIST_KEY, []);
  }
  function isWishlisted(id) {
    return getWishlist().indexOf(id) !== -1;
  }
  function toggleWishlist(id) {
    const list = getWishlist();
    const idx = list.indexOf(id);
    if (idx === -1) list.push(id);
    else list.splice(idx, 1);
    writeJSON(WISHLIST_KEY, list);
    return idx === -1; // true if it was just added
  }

  // ------------------------------ User uploads ------------------------------
  function getUserUploads() {
    const hidden = getHiddenUploadIds();
    return readJSON(UPLOADS_KEY, []).filter((b) => hidden.indexOf(b.id) === -1);
  }
  function addUserUpload(book) {
    const list = readJSON(UPLOADS_KEY, []);
    list.unshift(book);
    writeJSON(UPLOADS_KEY, list);
    return book;
  }

  // -------------------------------- Lookups --------------------------------
  function getAllBooks() {
    return [].concat(
      typeof CATALOG_BOOKS !== 'undefined' ? CATALOG_BOOKS : [],
      typeof SELL_BOOKS !== 'undefined' ? SELL_BOOKS : [],
      getRecentUploads()
    );
  }
  function findBookById(id) {
    return getAllBooks().filter((b) => b.id === id)[0] || null;
  }
  function getRecentUploads() {
    const hidden = getHiddenUploadIds();
    const seeded = (typeof UPLOAD_BOOKS !== 'undefined' ? UPLOAD_BOOKS : []).filter((b) => hidden.indexOf(b.id) === -1);
    return getUserUploads().concat(seeded).sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
  }
  function getTrending() {
    // Deterministic "trending" pick: every 3rd catalog book, always available.
    const pool = (typeof CATALOG_BOOKS !== 'undefined' ? CATALOG_BOOKS : []).filter((b) => b.status !== 'Sold');
    return pool.filter((_, i) => i % 3 === 0);
  }
  function getOffers() {
    return getAllBooks().filter((b) => b.discountPrice != null && b.status !== 'Sold');
  }
  function searchBooks(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    return getAllBooks().filter((b) =>
      (b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.isbn || '').toLowerCase().includes(q) ||
      (b.category || '').toLowerCase().includes(q)
    );
  }

  return {
    getWishlist, isWishlisted, toggleWishlist,
    getUserUploads, addUserUpload,
    getAllBooks, findBookById, getRecentUploads, getTrending, getOffers, searchBooks
  };
})();
