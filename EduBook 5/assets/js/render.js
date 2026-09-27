// EduBook — render.js
// Turns book objects into the card/row markup used on every browsing page.
// IMPORTANT: every card/row carries data-book-id — this is the attribute
// js/view-details.js, js/ai-*, and several inline page scripts rely on.
const Render = (function () {

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function coverStyle(book) {
    const c = book.coverColors || book.cover || ['#2A2E35', '#101215'];
    return `background:linear-gradient(160deg, ${c[0]}, ${c[1]})`;
  }

  // Real cover photo, resolved by ISBN with automatic fallback across
  // multiple free cover APIs (see js/books-data.js: coverImgTag). Layered
  // on top of the existing gradient placeholder; if every source fails,
  // the image removes itself and the gradient shows through untouched.
  function coverImgHtml(book, size) {
    if (typeof coverImgTag !== 'function') return '';
    return coverImgTag(book.isbn, size, book.title);
  }

  function heartSvg(active) {
    return `<svg viewBox="0 0 24 24" width="15" height="15" fill="${active ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>`;
  }

  function priceHtml(book) {
    if (book.discountPrice != null) {
      return `<span class="book-card__price">&#8377;${book.discountPrice}</span><span class="book-card__price--original">&#8377;${book.price}</span>`;
    }
    return `<span class="book-card__price">&#8377;${book.price}</span>`;
  }

  function cardHtml(book) {
    const wished = (typeof Store !== 'undefined' && Store.isWishlisted) ? Store.isWishlisted(book.id) : false;
    const sold = book.status === 'Sold';
    return `
      <div class="book-card" data-book-id="${esc(book.id)}">
        <div class="book-card__cover" style="${coverStyle(book)}">
          ${coverImgHtml(book, 'M')}
          ${sold ? '<span class="book-card__badge">Sold</span>' : ''}
          <button type="button" class="heart-btn${wished ? ' is-active' : ''}" data-heart="${esc(book.id)}" aria-label="Toggle wishlist">
            ${heartSvg(wished)}
          </button>
        </div>
        <p class="book-card__title">${esc(book.title)}</p>
        <p class="book-card__author">${esc(book.author || '')}</p>
        <div class="book-card__price-row">${priceHtml(book)}</div>
      </div>`;
  }

  function rowHtml(book) {
    return `
      <li class="upload-row" data-book-id="${esc(book.id)}">
        <div class="upload-row__cover" style="${coverStyle(book)}">${coverImgHtml(book, 'S')}</div>
        <div class="upload-info">
          <p class="book-card__title">${esc(book.title)}</p>
          <p class="book-card__author">${esc(book.author || '')} &middot; &#8377;${book.discountPrice != null ? book.discountPrice : book.price}</p>
        </div>
      </li>`;
  }

  function wireHearts(container) {
    container.querySelectorAll('[data-heart]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const id = btn.getAttribute('data-heart');
        const nowActive = Store.toggleWishlist(id);
        btn.classList.toggle('is-active', nowActive);
        btn.innerHTML = heartSvg(nowActive);
      });
    });
  }

  function grid(container, books, emptyMessage) {
    if (!container) return;
    if (!books || !books.length) {
      container.innerHTML = `<div class="empty-state">${esc(emptyMessage || 'Nothing to show yet.')}</div>`;
      return;
    }
    container.innerHTML = books.map(cardHtml).join('');
    wireHearts(container);
  }

  function list(container, books, emptyMessage) {
    if (!container) return;
    if (!books || !books.length) {
      container.innerHTML = `<div class="empty-state">${esc(emptyMessage || 'Nothing to show yet.')}</div>`;
      return;
    }
    container.innerHTML = books.map(rowHtml).join('');
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return { esc, grid, list, timeAgo, coverStyle, coverImgHtml };
})();
