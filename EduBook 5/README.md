# EduBook

A book resale/exchange web app for students (login/signup with OTP, browse,
search, cart, wishlist, sell/upload listings, profile & account settings).
Frontend is static HTML/CSS/JS; the login/signup/password backend is PHP,
backed by SQLite by default (no separate database server required) with an
optional MySQL mode for production.

## Folder structure

```
EduBook/
├── index.html            # Entry point — login / signup / OTP verification
├── pages/                 # Every other page (home, explore, cart, profile, ...)
├── assets/
│   ├── css/                # Stylesheets (style, home, books, details, profile, ai, nav-drawer)
│   ├── js/                 # App logic (auth flow, rendering, nav drawer, AI widget, store, i18n, theme)
│   └── images/              # Static image assets (currently empty — see assets/images/README.md)
├── php/                   # Backend endpoints (login, signup, OTP, password, logout, delete account)
│   └── data/                # Auto-created SQLite database lives here (edubook.sqlite) — gitignored
├── sql/
│   └── schema.sql          # MySQL schema, for the optional MySQL mode
├── docs/
│   └── PROFILE_FEATURE_NOTES.md
└── README.md
```

## How the pieces connect

- `index.html` (root) loads assets as `assets/css/...` and `assets/js/...`,
  and its `assets/js/app.js` talks to `php/login.php`, `php/signup.php`,
  `php/send_otp.php`, `php/verify_otp.php`, `php/reset_password.php` directly
  (php/ sits next to it at the root).
- Every page in `pages/` loads assets as `../assets/css/...` /
  `../assets/js/...` and calls the backend as `../php/...`.
- `assets/js/nav-drawer.js` is shared by both index.html and every page in
  `pages/`; it detects which depth it's running at (root vs `pages/`) at
  runtime and adjusts its links, logout endpoint, and redirect back to
  `index.html` accordingly.
- PHP files under `php/` all `require_once __DIR__ . '/config.php'`, so they
  don't care where the project root lives.

## Database: SQLite by default, MySQL optional

`php/config.php` defaults to `DB_DRIVER = 'sqlite'`. On the very first
request to any `php/*.php` endpoint, it automatically creates
`php/data/edubook.sqlite` and the `users` / `password_resets` tables inside
it if they don't already exist — there is nothing to install, start, or log
into. This is the setup the instructions below assume.

To use MySQL instead (e.g. for production), open `php/config.php` and:
1. Set `define('DB_DRIVER', 'mysql');`
2. Fill in `DB_HOST` / `DB_NAME` / `DB_USER` / `DB_PASS` for your server.
3. Import `sql/schema.sql` into that database (this step is **not** needed
   for the default SQLite mode — only for MySQL).

## Running it locally

**The most common cause of "Network error. Please try again." is opening
`index.html` by double-clicking it (a `file://` URL) instead of loading it
through an actual running server.** Browsers block a page opened that way
from calling `php/login.php` at all, and — separately — a `.php` file
double-clicked or opened without PHP simply isn't executed, so it can never
respond correctly either way. Both signup and sign-in call the backend the
same way, which is why both showed the same generic error.

To run it correctly:

1. Make sure PHP is installed (`php -v`). PHP ships with the `pdo_sqlite`
   extension enabled by default on almost every install; if `php -v` shows
   an error mentioning `pdo_sqlite`, install it (e.g. `sudo apt install
   php-sqlite3` on Debian/Ubuntu) and restart the server.
2. From inside this `EduBook/` folder, start PHP's built-in web server:
   ```
   php -S localhost:8000
   ```
3. Open **http://localhost:8000/index.html** in your browser — not the file
   directly. The database and tables are created automatically on your
   first signup/login request.
4. Create Account → you're signed in and redirected to
   `pages/home.html`. Sign out and Sign In again with the same email/password
   to confirm it persists (it's saved in `php/data/edubook.sqlite`).

If you still see a network-style error after that, check the terminal
running `php -S` for the actual PHP error — `php/config.php` now includes
the real exception message in its response rather than only a generic one,
so the terminal/response will say exactly what's wrong (e.g. a permissions
problem creating `php/data/`).

### Password reset emails

`php/send_otp.php` emails the OTP via PHP's built-in `mail()`, which needs a
configured local mail transport (`sendmail`/Postfix) to actually deliver
anything — most local dev machines don't have one, so the call is expected
to silently no-op there while everything else (OTP generation, storage,
verification, expiry) still works. For real delivery, swap `mail()` for
PHPMailer + an SMTP provider (e.g. SendGrid, Mailgun, Gmail SMTP).

## Notes

- Book covers are rendered as CSS gradients from data in
  `assets/js/books-data.js` — there are no real image files yet, hence the
  currently-empty `assets/images/` folder.
- See `docs/PROFILE_FEATURE_NOTES.md` for details on the profile/account
  feature implementation.
