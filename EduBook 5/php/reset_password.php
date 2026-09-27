<?php
/**
 * reset_password.php — POST { email, password } → set the new password.
 * Only succeeds if verify_otp.php already verified this email in this
 * session (see $_SESSION['otp_verified_user_id']).
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['success' => false, 'message' => 'Method not allowed.']);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim((string)($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if (!is_valid_email($email) || !is_valid_password($password)) {
    json_response(400, ['success' => false, 'message' => 'Password must be 8+ characters with a letter and a number.']);
}

if (empty($_SESSION['otp_verified_user_id'])) {
    json_response(403, ['success' => false, 'message' => 'Please verify your code again before resetting your password.']);
}

try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || (int) $user['id'] !== (int) $_SESSION['otp_verified_user_id']) {
        json_response(403, ['success' => false, 'message' => 'Please verify your code again before resetting your password.']);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $update = $pdo->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
    $update->execute(['hash' => $hash, 'id' => $user['id']]);

    // Clean up: this reset is used, and the OTP-verified flag shouldn't be reusable.
    $pdo->prepare('DELETE FROM password_resets WHERE user_id = :id')->execute(['id' => $user['id']]);
    unset($_SESSION['otp_verified_user_id'], $_SESSION['otp_verified_reset_id']);

    json_response(200, ['success' => true]);
} catch (Throwable $e) {
    json_response(500, ['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
