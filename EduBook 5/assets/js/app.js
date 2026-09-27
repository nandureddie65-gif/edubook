// EduBook — app.js
// Sign In / Create Account / Forgot Password page wiring.
(function () {
  document.addEventListener('DOMContentLoaded', function () {

    // ------------------------------- Tab toggle -------------------------------
    var ribbon = document.querySelector('.ribbon-toggle');
    var tabBtns = document.querySelectorAll('.ribbon-toggle__btn');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        var target = btn.getAttribute('data-target');
        document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('is-visible'); });
        var view = document.getElementById(target);
        if (view) view.classList.add('is-visible');

        ribbon.setAttribute('data-active', target === 'view-signup' ? 'signup' : 'signin');
      });
    });

    // --------------------------- Password show/hide ---------------------------
    document.querySelectorAll('[data-toggle-password]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-toggle-password'));
        if (!input) return;
        var showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.textContent = showing ? 'Show' : 'Hide';
      });
    });

    // ------------------------------- Helpers -------------------------------
    function setFieldError(id, message) {
      var el = document.querySelector('[data-error-for="' + id + '"]');
      var input = document.getElementById(id);
      if (el) el.textContent = message || '';
      if (input) input.classList.toggle('has-error', Boolean(message));
    }
    function setStatus(formId, message, kind) {
      var el = document.querySelector('[data-status-for="' + formId + '"]');
      if (!el) return;
      el.textContent = message || '';
      el.className = 'form__status' + (kind ? ' is-' + kind : '');
    }
    function passwordOk(pw) {
      return pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
    }
    async function postJSON(url, body) {
      try {
        var res = await fetch(url, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        var data = await res.json().catch(function () { return {}; });
        return { ok: res.ok, data: data };
      } catch (e) {
        // fetch() itself threw — the request never got a response at all.
        // That only happens for one of two reasons, both about how the
        // *server* is being run, not about anything the user typed:
        var message = 'Network error. Please try again.';
        if (window.location.protocol === 'file:') {
          message = 'This page was opened directly as a file, so the browser blocks it from reaching the PHP backend. Start a local server instead (e.g. run "php -S localhost:8000" from the EduBook folder) and open it via http://localhost:8000/.';
        } else {
          message = 'Could not reach the server at ' + url + '. Make sure the PHP backend is running (e.g. "php -S localhost:8000" from the EduBook folder) and that you\u2019re viewing this page through that server, not a different one.';
        }
        return { ok: false, data: { message: message } };
      }
    }

    // -------------------------------- Sign In --------------------------------
    var signinForm = document.getElementById('form-signin');
    if (signinForm) {
      signinForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        setFieldError('signin-email', ''); setFieldError('signin-password', '');
        var email = document.getElementById('signin-email').value.trim();
        var password = document.getElementById('signin-password').value;
        var valid = true;
        if (!email) { setFieldError('signin-email', 'Enter your email.'); valid = false; }
        if (!password) { setFieldError('signin-password', 'Enter your password.'); valid = false; }
        if (!valid) return;

        setStatus('form-signin', 'Signing in\u2026');
        var submitBtn = signinForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        var result = await postJSON('php/login.php', { email: email, password: password });
        submitBtn.disabled = false;

        if (result.ok && result.data.success) {
          localStorage.setItem('edubook_user', JSON.stringify({
            username: result.data.username || result.data.user && result.data.user.username || '',
            email: result.data.email || email
          }));
          setStatus('form-signin', 'Welcome back! Redirecting\u2026', 'success');
          setTimeout(function () { window.location.href = 'pages/home.html'; }, 500);
        } else {
          setStatus('form-signin', (result.data && result.data.message) || 'Invalid email or password.', 'error');
        }
      });
    }

    // ----------------------------- Create Account -----------------------------
    var signupForm = document.getElementById('form-signup');
    if (signupForm) {
      signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        ['signup-username', 'signup-email', 'signup-password', 'signup-confirm'].forEach(function (id) { setFieldError(id, ''); });

        var username = document.getElementById('signup-username').value.trim();
        var email = document.getElementById('signup-email').value.trim();
        var password = document.getElementById('signup-password').value;
        var confirm = document.getElementById('signup-confirm').value;

        var valid = true;
        if (username.length < 3) { setFieldError('signup-username', 'Username must be at least 3 characters.'); valid = false; }
        if (!/^\S+@\S+\.\S+$/.test(email)) { setFieldError('signup-email', 'Enter a valid email.'); valid = false; }
        if (!passwordOk(password)) { setFieldError('signup-password', 'At least 8 characters, with a letter and a number.'); valid = false; }
        if (confirm !== password) { setFieldError('signup-confirm', 'Passwords do not match.'); valid = false; }
        if (!valid) return;

        setStatus('form-signup', 'Creating your account\u2026');
        var submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        var result = await postJSON('php/signup.php', { username: username, email: email, password: password });
        submitBtn.disabled = false;

        if (result.ok && result.data.success) {
          localStorage.setItem('edubook_user', JSON.stringify({ username: username, email: email }));
          setStatus('form-signup', 'Account created! Redirecting\u2026', 'success');
          setTimeout(function () { window.location.href = 'pages/home.html'; }, 500);
        } else {
          setStatus('form-signup', (result.data && result.data.message) || 'Could not create account.', 'error');
        }
      });
    }

    // --------------------------- Forgot password overlay ---------------------------
    var overlay = document.getElementById('forgot-overlay');
    var pendingEmail = '';

    function showStep(n) {
      document.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('is-visible', s.getAttribute('data-step') === String(n)); });
      document.querySelectorAll('[data-step-dot]').forEach(function (d) { d.classList.toggle('is-active', Number(d.getAttribute('data-step-dot')) <= n); });
    }
    function openOverlay() {
      overlay.setAttribute('aria-hidden', 'false');
      showStep(1);
    }
    function closeOverlay() {
      overlay.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('[data-open-forgot]').forEach(function (b) { b.addEventListener('click', openOverlay); });
    document.querySelectorAll('[data-close-forgot]').forEach(function (b) { b.addEventListener('click', closeOverlay); });

    var sendOtpForm = document.getElementById('form-send-otp');
    if (sendOtpForm) {
      sendOtpForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        setFieldError('forgot-email', '');
        var email = document.getElementById('forgot-email').value.trim();
        if (!/^\S+@\S+\.\S+$/.test(email)) { setFieldError('forgot-email', 'Enter a valid email.'); return; }

        setStatus('form-send-otp', 'Sending code\u2026');
        var result = await postJSON('php/send_otp.php', { email: email });
        // Generic message regardless of whether the email is registered (per README security notes).
        setStatus('form-send-otp', '');
        pendingEmail = email;
        document.querySelectorAll('[data-echo="email"]').forEach(function (el) { el.textContent = email; });
        showStep(2);
      });
    }

    var verifyOtpForm = document.getElementById('form-verify-otp');
    if (verifyOtpForm) {
      verifyOtpForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        setFieldError('forgot-otp', '');
        var otp = document.getElementById('forgot-otp').value.trim();
        if (!/^\d{6}$/.test(otp)) { setFieldError('forgot-otp', 'Enter the 6-digit code.'); return; }

        setStatus('form-verify-otp', 'Verifying\u2026');
        var result = await postJSON('php/verify_otp.php', { email: pendingEmail, otp: otp });
        if (result.ok && result.data.success) {
          setStatus('form-verify-otp', '');
          showStep(3);
        } else {
          setStatus('form-verify-otp', (result.data && result.data.message) || 'Incorrect or expired code.', 'error');
        }
      });
    }

    var resendBtn = document.querySelector('[data-resend-otp]');
    if (resendBtn) {
      resendBtn.addEventListener('click', async function () {
        await postJSON('php/send_otp.php', { email: pendingEmail });
        setStatus('form-verify-otp', 'A new code has been sent.', 'success');
      });
    }

    var resetForm = document.getElementById('form-reset-password');
    if (resetForm) {
      resetForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        setFieldError('reset-password', ''); setFieldError('reset-confirm', '');
        var password = document.getElementById('reset-password').value;
        var confirm = document.getElementById('reset-confirm').value;
        var valid = true;
        if (!passwordOk(password)) { setFieldError('reset-password', 'At least 8 characters, with a letter and a number.'); valid = false; }
        if (confirm !== password) { setFieldError('reset-confirm', 'Passwords do not match.'); valid = false; }
        if (!valid) return;

        setStatus('form-reset-password', 'Updating\u2026');
        var result = await postJSON('php/reset_password.php', { email: pendingEmail, password: password });
        if (result.ok && result.data.success) {
          setStatus('form-reset-password', '');
          showStep(4);
        } else {
          setStatus('form-reset-password', (result.data && result.data.message) || 'Could not update password.', 'error');
        }
      });
    }
  });
})();
