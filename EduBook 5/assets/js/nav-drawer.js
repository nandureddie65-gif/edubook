// EduBook — nav-drawer.js
// Injects a left-side Navigation Drawer (hamburger menu) into every page that
// includes this script. Fully self-contained (reads/writes localStorage
// directly for Dark Mode so it has no load-order dependency on
// js/profile-store.js or js/theme.js) — safe to include anywhere.
(function () {
  var PROFILE_KEY = 'edubook_profile_v1';

  // EduBook restructure: index.html lives at the project root while every
  // other page lives one level down in /pages/. This script is shared by
  // both, so work out the right relative prefix for page links, the PHP
  // endpoint and the root index at runtime instead of hard-coding one.
  var IN_PAGES_DIR = /\/pages\//.test(window.location.pathname);
  var PAGE_PREFIX = IN_PAGES_DIR ? '' : 'pages/';
  var INDEX_HREF = IN_PAGES_DIR ? '../index.html' : 'index.html';
  var LOGOUT_ENDPOINT = (IN_PAGES_DIR ? '../' : '') + 'php/logout.php';

  var MENU_ITEMS = [
    { label: 'Home', href: 'home.html', icon: 'home' },
    { label: 'Browse All Books', href: 'explore.html', icon: 'book' },
    { label: 'Trending Books', href: 'trending.html', icon: 'trending' },
    { label: 'Recent Uploads', href: 'uploads.html', icon: 'upload' },
    { label: 'My Cart', href: 'cart.html', icon: 'cart' },
    { label: 'Wishlist', href: 'wishlist.html', icon: 'heart' },
    { label: 'My Orders', href: 'orders.html', icon: 'orders' },
    { label: 'My Uploaded Books', href: 'my-uploads.html', icon: 'upload' },
    { label: 'My Sales', href: 'my-sales.html', icon: 'sales' },
    { label: 'My Profile', href: 'profile.html', icon: 'user' },
    { label: 'Settings', href: 'account-settings.html', icon: 'settings' },
    { label: 'Dark Mode', action: 'dark-mode', icon: 'moon' },
    { label: 'Language', href: 'language.html', icon: 'globe' },
    { label: 'Help Center', href: 'help-center.html', icon: 'help' },
    { label: 'Contact Us', href: 'contact-us.html', icon: 'mail' },
    { label: 'Rate the App', href: 'rate-app.html', icon: 'star' },
    { label: 'About EduBook', href: 'about.html', icon: 'info' },
    { label: 'Logout', action: 'logout', icon: 'logout', danger: true }
  ];

  var ICONS = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>',
    orders: '<path d="M20 7 12 3 4 7v10l8 4 8-4Z"/><path d="M12 22V12"/><path d="m4 7 8 5 8-5"/>',
    sales: '<path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    moon: '<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'
  };

  function svg(name) {
    return '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  function currentFile() {
    var path = window.location.pathname.split('/').pop() || 'home.html';
    return path;
  }

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); } catch (e) { return {}; }
  }

  function isDarkModeOn() {
    var data = readProfile();
    return !!(data.settings && data.settings.darkMode);
  }

  function toggleDarkMode() {
    var data = readProfile();
    data.settings = data.settings || {};
    data.settings.darkMode = !data.settings.darkMode;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    document.documentElement.setAttribute('data-theme', data.settings.darkMode ? 'dark' : 'light');
    return data.settings.darkMode;
  }

  async function logout() {
    try { await fetch(LOGOUT_ENDPOINT, { method: 'POST', credentials: 'same-origin' }); } catch (e) {}
    localStorage.removeItem('edubook_user');
    window.location.href = INDEX_HREF;
  }

  function buildDrawer() {
    var wrap = document.createElement('div');
    wrap.id = 'nd-drawer-root';
    var itemsHtml = MENU_ITEMS.map(function (item, i) {
      var active = item.href && item.href === currentFile();
      return '' +
        '<button type="button" class="nd-item' + (active ? ' is-active' : '') + (item.danger ? ' nd-item--danger' : '') + '" data-index="' + i + '">' +
          '<span class="nd-item__icon">' + svg(item.icon) + '</span>' +
          '<span class="nd-item__label">' + item.label + '</span>' +
          (item.action === 'dark-mode' ? '<span class="nd-toggle-mini' + (isDarkModeOn() ? ' is-on' : '') + '" id="nd-dark-toggle"></span>' : '') +
        '</button>';
    }).join('');

    wrap.innerHTML =
      '<div class="nd-scrim" id="nd-scrim"></div>' +
      '<nav class="nd-panel" id="nd-panel" aria-label="Main menu">' +
        '<div class="nd-panel__head">' +
          '<span class="nd-panel__brand">EduBook</span>' +
          '<button type="button" class="nd-close" id="nd-close" aria-label="Close menu">&times;</button>' +
        '</div>' +
        '<div class="nd-panel__items">' + itemsHtml + '</div>' +
      '</nav>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function findOrCreateTrigger() {
    // Prefer a page's own hamburger button if it marks itself with this id.
    var existing = document.getElementById('nd-menu-trigger');
    if (existing) return existing;

    // Otherwise, if this page has a .page-header (interior pages), inject one.
    var header = document.querySelector('.page-header');
    if (header) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'nd-menu-trigger';
      btn.className = 'nd-header-menu-btn';
      btn.setAttribute('aria-label', 'Open menu');
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      header.insertBefore(btn, header.firstChild);
      return btn;
    }
    return null;
  }

  function init() {
    if (document.getElementById('nd-drawer-root')) return;
    var drawer = buildDrawer();
    var scrim = document.getElementById('nd-scrim');
    var panel = document.getElementById('nd-panel');
    var closeBtn = document.getElementById('nd-close');

    function open() { drawer.classList.add('is-open'); }
    function close() { drawer.classList.remove('is-open'); }

    var trigger = findOrCreateTrigger();
    if (trigger) trigger.addEventListener('click', open);
    scrim.addEventListener('click', close);
    closeBtn.addEventListener('click', close);

    panel.querySelectorAll('.nd-item').forEach(function (btn) {
      var item = MENU_ITEMS[Number(btn.getAttribute('data-index'))];
      btn.addEventListener('click', function () {
        if (item.action === 'dark-mode') {
          var on = toggleDarkMode();
          btn.querySelector('#nd-dark-toggle').classList.toggle('is-on', on);
          return; // stays open so the user can see the theme change take effect
        }
        if (item.action === 'logout') { close(); logout(); return; }
        window.location.href = PAGE_PREFIX + item.href;
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
