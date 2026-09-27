// EduBook — view-details.js
// Adds a "View Details" button to every book card, on every page, without
// needing to know js/render.js's internal markup — it only relies on the
// `data-book-id` attribute that render.js already puts on each card (the
// same attribute uploads.html uses to find cards after rendering).
//
// Usage: call ViewDetails.watch(containerEl) once, right after you grab the
// container element (before or after calling Render.grid/Render.list — order
// doesn't matter). A MutationObserver re-applies the button whenever the
// container's contents change (category filters, search re-renders, etc.),
// so you only need to wire this up once per page.
(function (global) {
  function enhance(container) {
    if (!container) return;
    container.querySelectorAll('[data-book-id]').forEach(function (card) {
      if (card.getAttribute('data-vd-enhanced')) return;
      card.setAttribute('data-vd-enhanced', '1');
      var id = card.getAttribute('data-book-id');
      var link = document.createElement('a');
      link.className = 'vd-btn';
      link.href = 'book-details.html?id=' + encodeURIComponent(id);
      link.textContent = 'View Details';
      link.addEventListener('click', function (e) { e.stopPropagation(); });
      card.appendChild(link);
    });
  }

  function watch(container) {
    if (!container) return null;
    enhance(container);
    var mo = new MutationObserver(function () { enhance(container); });
    mo.observe(container, { childList: true, subtree: false });
    return mo;
  }

  global.ViewDetails = { enhance: enhance, watch: watch };
})(window);
