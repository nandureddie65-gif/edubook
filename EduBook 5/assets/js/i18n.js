// EduBook — i18n.js
// Very small translation layer for the Profile section. Elements marked with
// data-i18n="key" get their text swapped based on the saved language setting.
// This currently covers the Profile hub labels; it's an additive layer that
// doesn't touch the rest of the app's copy.
(function () {
  var DICT = {
    en: {
      profileTitle: 'Profile',
      editProfile: 'Edit Profile',
      account: 'Account',
      myOrders: 'My Orders',
      wishlist: 'Wishlist',
      myCart: 'My Cart',
      myUploads: 'My Uploaded Books',
      mySales: 'My Sales',
      settings: 'Settings',
      accountSettings: 'Account Settings',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',
      language: 'Language',
      changePassword: 'Change Password',
      privacySecurity: 'Privacy & Security',
      support: 'Support',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      rateApp: 'Rate the App',
      terms: 'Terms & Conditions',
      privacyPolicy: 'Privacy Policy',
      about: 'About EduBook',
      logout: 'Log Out',
      deleteAccount: 'Delete My Account'
    },
    te: {
      profileTitle: 'ప్రొఫైల్',
      editProfile: 'ప్రొఫైల్ సవరించండి',
      account: 'ఖాతా',
      myOrders: 'నా ఆర్డర్‌లు',
      wishlist: 'విష్‌లిస్ట్',
      myCart: 'నా కార్ట్',
      myUploads: 'నేను అప్‌లోడ్ చేసిన పుస్తకాలు',
      mySales: 'నా అమ్మకాలు',
      settings: 'సెట్టింగ్‌లు',
      accountSettings: 'ఖాతా సెట్టింగ్‌లు',
      notifications: 'నోటిఫికేషన్‌లు',
      darkMode: 'డార్క్ మోడ్',
      language: 'భాష',
      changePassword: 'పాస్‌వర్డ్ మార్చండి',
      privacySecurity: 'గోప్యత & భద్రత',
      support: 'మద్దతు',
      helpCenter: 'సహాయ కేంద్రం',
      contactUs: 'మమ్మల్ని సంప్రదించండి',
      rateApp: 'యాప్‌ను రేట్ చేయండి',
      terms: 'నిబంధనలు & షరతులు',
      privacyPolicy: 'గోప్యతా విధానం',
      about: 'EduBook గురించి',
      logout: 'లాగ్ అవుట్',
      deleteAccount: 'నా ఖాతాను తొలగించండి'
    }
  };

  function currentLang() {
    try {
      var raw = localStorage.getItem('edubook_profile_v1');
      var data = raw ? JSON.parse(raw) : null;
      return (data && data.settings && data.settings.language) || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function apply() {
    var dict = DICT[currentLang()] || DICT.en;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
  }

  document.addEventListener('DOMContentLoaded', apply);
  window.EduBookI18n = { apply: apply, DICT: DICT };
})();
