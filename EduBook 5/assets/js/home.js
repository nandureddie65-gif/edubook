// EduBook — home.js
// Wires up the Home page: data-href navigation (quick actions + bottom nav),
// the search bar, and renders the Trending Books row + Recent Uploads list.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // ---- Any element with data-href navigates on click ----
    document.querySelectorAll('[data-href]').forEach(function (el) {
      el.addEventListener('click', function () {
        window.location.href = el.getAttribute('data-href');
      });
    });

    // ---- Search bar: Enter or icon click goes to Smart Search ----
    var input = document.getElementById('home-search-input');
    var btn = document.getElementById('home-search-btn');
    function go() {
      var q = input ? input.value.trim() : '';
      window.location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    }
    if (btn) btn.addEventListener('click', go);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') go();
      });
    }

    // ---- Trending row ----
    var trendingRow = document.getElementById('trending-row');
    if (trendingRow && typeof Store !== 'undefined' && typeof Render !== 'undefined') {
      Render.grid(trendingRow, Store.getTrending(), 'Nothing trending right now.');
    }

    // ---- Recent uploads list ----
    var uploadsList = document.getElementById('recent-uploads-list');
    if (uploadsList && typeof Store !== 'undefined' && typeof Render !== 'undefined') {
      var recent = Store.getRecentUploads().slice(0, 6);
      Render.list(uploadsList, recent, 'No uploads yet.');
      recent.forEach(function (b) {
        var row = uploadsList.querySelector('[data-book-id="' + CSS.escape(b.id) + '"] .upload-info');
        if (row && b.uploadedAt) {
          var t = document.createElement('p');
          t.className = 'upload-time';
          t.textContent = Render.timeAgo(b.uploadedAt);
          row.appendChild(t);
        }
      });
    }
  });
})();
