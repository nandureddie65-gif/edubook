<?php
/**
 * change_password.php
 *
 * New, additive endpoint for the Profile > Change Password screen.
 * It does not touch signup.php / login.php / reset_password.php.
 *
 * ASSUMPTIONS (adjust if your schema/config differs — see README for the
 * documented shape of the existing project):
 *   - php/config.php defines a PDO connection in $pdo and starts the session
 *     (the same way login.php / logout.php already rely on a session).
 *   - The `users` table has columns: id, password_hash (per README: "login.php
 *     checks the stored password_hash with password_verify()").
 *   - On successful login, $_SESSION['user_id'] is set to the user's id.
 *     If your login.php stores the id under a different session key,
 *     update the constant below to match.
 */

declare(strict_types=1);

header('Content-Type: application/json');

require_once __DIR__ . '/config.php'; // expects $pdo (PDO) + session_start() already called

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
    respond(401, ['success' => false, 'message' => 'You must be signed in to change your password.']);
}

$input = json_decode(file_get_contents('php://input'), true);
$currentPassword = trim((string)($input['currentPassword'] ?? ''));
$newPassword = (string)($input['newPassword'] ?? '');

if ($currentPassword === '' || $newPassword === '') {
    respond(400, ['success' => false, 'message' => 'Both current and new password are required.']);
}

if (strlen($newPassword) < 8 || !preg_match('/[A-Za-z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
    respond(400, ['success' => false, 'message' => 'New password must be at least 8 characters and include a letter and a number.']);
}

try {
    $userId = $_SESSION[SESSION_USER_ID_KEY];

    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        // Generic message — avoids confirming/denying account state beyond "wrong password".
        respond(400, ['success' => false, 'message' => 'Current password is incorrect.']);
    }

    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);

    $update = $pdo->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
    $update->execute(['hash' => $newHash, 'id' => $userId]);

    respond(200, ['success' => true, 'message' => 'Password updated successfully.']);
} catch (Throwable $e) {
    // Never leak internals to the client.
    respond(500, ['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
