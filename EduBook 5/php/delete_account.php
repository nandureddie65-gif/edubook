<?php
/**
 * delete_account.php
 *
 * New, additive endpoint for the Profile > Delete My Account flow.
 * It does not modify signup.php / login.php / logout.php.
 *
 * ASSUMPTIONS (see change_password.php for the same notes):
 *   - php/config.php defines $pdo (PDO) and starts the session.
 *   - `users` table has an `id` primary key.
 *   - $_SESSION['user_id'] holds the signed-in user's id.
 *
 * The front end (js/profile-store.js -> deleteAccount()) calls this, then
 * clears its own localStorage regardless of whether this request succeeds,
 * so the user is signed out of the device either way.
 */

declare(strict_types=1);

header('Content-Type: application/json');

require_once __DIR__ . '/config.php';

const SESSION_USER_ID_KEY = 'user_id';

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'message' => 'Method not allowed.']);
}

if (empty($_SESSION[SESSION_USER_ID_KEY])) {
    respond(401, ['success' => false, 'message' => 'You must be signed in.']);
}

try {
    $userId = $_SESSION[SESSION_USER_ID_KEY];

    // Also clear any outstanding password-reset rows for this user, if that
    // table stores a user_id (per sql/schema.sql's password_resets table).
    $cleanup = $pdo->prepare('DELETE FROM password_resets WHERE user_id = :id');
    $cleanup->execute(['id' => $userId]);

    $delete = $pdo->prepare('DELETE FROM users WHERE id = :id');
    $delete->execute(['id' => $userId]);

    session_unset();
    session_destroy();

    respond(200, ['success' => true, 'message' => 'Account deleted.']);
} catch (Throwable $e) {
    respond(500, ['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
