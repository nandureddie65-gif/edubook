<?php
/**
 * config.php — DB connection + shared helpers.
 *
 * Ships configured for SQLite by default, which is why signup/login should
 * now work immediately with zero setup: there's no separate database
 * server to install, start, or authenticate against. The database file is
 * created automatically at php/data/edubook.sqlite the first time any
 * endpoint runs, and the `users` / `password_resets` tables are created
 * automatically too if they don't already exist — so there's no schema.sql
 * import step either.
 *
 * If you'd rather use a real MySQL server (e.g. in production), set
 * DB_DRIVER to 'mysql' below, fill in the DB_* constants to match your
 * server, and import sql/schema.sql into that database first.
 */

declare(strict_types=1);

// ---- Choose the database driver: 'sqlite' (default, zero setup) or 'mysql' ----
define('DB_DRIVER', 'sqlite');

// ---- Only used when DB_DRIVER is 'mysql' — edit to match your MySQL server ----
define('DB_HOST', 'localhost');
define('DB_NAME', 'edubook');
define('DB_USER', 'root');
define('DB_PASS', '');

// ---- Only used when DB_DRIVER is 'sqlite' ----
define('DB_SQLITE_PATH', __DIR__ . '/data/edubook.sqlite');

// ---- OTP settings ----
define('OTP_EXPIRY_MINUTES', 10);
define('OTP_MAX_ATTEMPTS', 5);

// ---- Session (every endpoint that needs the signed-in user relies on this) ----
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/** Creates the users/password_resets tables if they don't exist yet (SQLite only — a MySQL database is expected to already have sql/schema.sql imported). */
function edubook_ensure_schema(PDO $pdo): void {
    if (DB_DRIVER !== 'sqlite') {
        return;
    }
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime(\'now\'))
        )'
    );
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            otp_hash TEXT NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime(\'now\'))
        )'
    );
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets (user_id)');
}

/** True once we've successfully connected, so endpoints can tell a DB-setup problem apart from bad input. */
$GLOBALS['edubook_db_ready'] = false;

try {
    if (DB_DRIVER === 'sqlite') {
        $dir = dirname(DB_SQLITE_PATH);
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException('Could not create ' . $dir . ' — check folder permissions.');
        }
        $pdo = new PDO(
            'sqlite:' . DB_SQLITE_PATH,
            null,
            null,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    } else {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    }
    edubook_ensure_schema($pdo);
    $GLOBALS['edubook_db_ready'] = true;
} catch (Throwable $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => DB_DRIVER === 'sqlite'
            ? 'Database setup failed: ' . $e->getMessage() . ' (check that php/data/ is writable and the pdo_sqlite PHP extension is enabled).'
            : 'Database connection failed. Check the DB_* settings in php/config.php and that MySQL is running.',
    ]);
    exit;
}

/** Send a JSON response and stop. */
function json_response(int $status, array $body): void {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($body);
    exit;
}

/** Basic email format check. */
function is_valid_email(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

/** Password strength check: 8+ chars, at least one letter and one number. */
function is_valid_password(string $password): bool {
    return strlen($password) >= 8 && preg_match('/[A-Za-z]/', $password) && preg_match('/[0-9]/', $password);
}
