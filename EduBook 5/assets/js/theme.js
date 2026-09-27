// EduBook — theme.js
// Reads the Profile feature's saved settings (dark mode / language) and applies
// them to <html> immediately, so every page in the app reflects the user's
// choice made on Settings > Dark Mode / Settings > Language.
// Safe to include on every page: if no settings exist yet, defaults to light/English.
(function () {
  function readSettings() {
    try {
      var raw = localStorage.getItem('edubook_profile_v1');
      var data = raw ? JSON.parse(raw) : null;
      return (data && data.settings) || {};
    } catch (e) {
      return {};
    }
  }

  var settings = readSettings();
  var root = document.documentElement;
  root.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  root.setAttribute('lang', settings.language === 'te' ? 'te' : 'en');

  // Keep in sync if the setting changes in another tab.
  window.addEventListener('storage', function (e) {
    if (e.key === 'edubook_profile_v1') {
      var s = readSettings();
      root.setAttribute('data-theme', s.darkMode ? 'dark' : 'light');
      root.setAttribute('lang', s.language === 'te' ? 'te' : 'en');
    }
  });
})();
