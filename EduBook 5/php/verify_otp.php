<?php
/**
 * verify_otp.php — POST { email, otp } → check the most recent OTP for this
 * email. On success, marks the reset row verified in the session so
 * reset_password.php can trust it without re-checking the OTP.
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['success' => false, 'message' => 'Method not allowed.']);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim((string)($input['email'] ?? ''));
$otp = trim((string)($input['otp'] ?? ''));

if (!is_valid_email($email) || !preg_match('/^\d{6}$/', $otp)) {
    json_response(400, ['success' => false, 'message' => 'Enter the 6-digit code.']);
}

try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();
    if (!$user) {
        json_response(400, ['success' => false, 'message' => 'Incorrect or expired code.']);
    }

    $resetStmt = $pdo->prepare(
        'SELECT id, otp_hash, attempts, expires_at FROM password_resets WHERE user_id = :user_id ORDER BY id DESC LIMIT 1'
    );
    $resetStmt->execute(['user_id' => $user['id']]);
    $reset = $resetStmt->fetch();

    if (!$reset || strtotime($reset['expires_at']) < time()) {
        json_response(400, ['success' => false, 'message' => 'Incorrect or expired code.']);
    }
    if ((int) $reset['attempts'] >= OTP_MAX_ATTEMPTS) {
        json_response(429, ['success' => false, 'message' => 'Too many attempts. Please request a new code.']);
    }

    if (!password_verify($otp, $reset['otp_hash'])) {
        $pdo->prepare('UPDATE password_resets SET attempts = attempts + 1 WHERE id = :id')
            ->execute(['id' => $reset['id']]);
        json_response(400, ['success' => false, 'message' => 'Incorrect or expired code.']);
    }

    // Mark this reset row + user as OTP-verified for this session only.
    $_SESSION['otp_verified_user_id'] = (int) $user['id'];
    $_SESSION['otp_verified_reset_id'] = (int) $reset['id'];

    json_response(200, ['success' => true]);
} catch (Throwable $e) {
    json_response(500, ['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
