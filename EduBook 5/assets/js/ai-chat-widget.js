// EduBook — ai-chat-widget.js
// Injects a floating "Ask AI" bubble + slide-up chat panel into any page
// that includes this script (after js/ai-engine.js and, ideally,
// js/books-data.js so the bot can answer questions about specific books).
(function () {
  function allKnownBooks() {
    var sets = [];
    if (typeof CATALOG_BOOKS !== 'undefined') sets.push(CATALOG_BOOKS);
    if (typeof SELL_BOOKS !== 'undefined') sets.push(SELL_BOOKS);
    if (typeof UPLOAD_BOOKS !== 'undefined') sets.push(UPLOAD_BOOKS);
    var userUploads = [];
    try { if (typeof Store !== 'undefined' && Store.getRecentUploads) userUploads = Store.getRecentUploads(); } catch (e) {}
    return [].concat.apply([], sets).concat(userUploads);
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.id = 'ai-chat-widget';
    wrap.innerHTML =
      '<button type="button" id="ai-chat-fab" aria-label="Ask AI">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5L12 2Z"/></svg>' +
      '</button>' +
      '<div class="ai-chat-panel" id="ai-chat-panel" aria-hidden="true">' +
        '<div class="ai-chat-panel__head">' +
          '<span>Ask AI</span>' +
          '<button type="button" id="ai-chat-close" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="ai-chat-panel__body" id="ai-chat-body"></div>' +
        '<div class="ai-chat-panel__quick" id="ai-chat-quick"></div>' +
        '<form class="ai-chat-panel__input" id="ai-chat-form">' +
          '<input type="text" id="ai-chat-input" placeholder="Ask about a book, order, or how to sell&hellip;" autocomplete="off">' +
          '<button type="submit" aria-label="Send">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          '</button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function addMessage(body, text, who) {
    var el = document.createElement('div');
    el.className = 'ai-msg ai-msg--' + who;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function init() {
    if (document.getElementById('ai-chat-widget')) return;
    var wrap = build();
    var fab = document.getElementById('ai-chat-fab');
    var panel = document.getElementById('ai-chat-panel');
    var body = document.getElementById('ai-chat-body');
    var form = document.getElementById('ai-chat-form');
    var input = document.getElementById('ai-chat-input');
    var quick = document.getElementById('ai-chat-quick');
    var opened = false;

    var QUICK_PROMPTS = ['How do I sell a book?', 'Track my order', 'Recommend a book', 'Change my password'];
    quick.innerHTML = QUICK_PROMPTS.map(function (q) {
      return '<button type="button" class="ai-chip" data-prompt="' + q.replace(/"/g, '&quot;') + '">' + q + '</button>';
    }).join('');

    function open() {
      opened = true;
      panel.classList.add('is-open');
      if (!body.childElementCount) {
        addMessage(body, 'Hi! I\u2019m the EduBook assistant. Ask me about a book, an order, or how to sell.', 'bot');
      }
    }
    function close() { opened = false; panel.classList.remove('is-open'); }

    fab.addEventListener('click', function () { opened ? close() : open(); });
    document.getElementById('ai-chat-close').addEventListener('click', close);

    async function send(text) {
      text = text.trim();
      if (!text) return;
      addMessage(body, text, 'user');
      input.value = '';
      var typingEl = document.createElement('div');
      typingEl.className = 'ai-msg ai-msg--bot ai-msg--typing';
      typingEl.textContent = '\u2026';
      body.appendChild(typingEl);
      body.scrollTop = body.scrollHeight;

      var reply = await AIEngine.chatReply(text, allKnownBooks());
      typingEl.remove();
      addMessage(body, reply, 'bot');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send(input.value);
    });
    quick.querySelectorAll('.ai-chip').forEach(function (chip) {
      chip.addEventListener('click', function () { open(); send(chip.getAttribute('data-prompt')); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
