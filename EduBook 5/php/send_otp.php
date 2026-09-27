<?php
/**
 * send_otp.php — POST { email } → generate and email a 6-digit OTP.
 *
 * Always returns a generic success-shaped response whether or not the email
 * is registered (per README: "can't be used to enumerate accounts").
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['success' => false, 'message' => 'Method not allowed.']);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim((string)($input['email'] ?? ''));

if (!is_valid_email($email)) {
    json_response(400, ['success' => false, 'message' => 'Enter a valid email address.']);
}

$generic = ['success' => true, 'message' => 'If that email is registered, a verification code has been sent.'];

try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Same response either way — don't reveal whether the email exists.
        json_response(200, $generic);
    }

    $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $otpHash = password_hash($otp, PASSWORD_BCRYPT);
    $expiresAt = date('Y-m-d H:i:s', time() + OTP_EXPIRY_MINUTES * 60);

    $insert = $pdo->prepare(
        'INSERT INTO password_resets (user_id, otp_hash, attempts, expires_at) VALUES (:user_id, :otp_hash, 0, :expires_at)'
    );
    $insert->execute(['user_id' => $user['id'], 'otp_hash' => $otpHash, 'expires_at' => $expiresAt]);

    // Best-effort email send. Requires a configured MTA/sendmail — see README
    // for swapping this for PHPMailer + a real SMTP provider in production.
    $subject = 'Your EduBook verification code';
    $body = "Your EduBook verification code is: $otp\nIt expires in " . OTP_EXPIRY_MINUTES . " minutes.";
    @mail($email, $subject, $body);

    json_response(200, $generic);
} catch (Throwable $e) {
    json_response(200, $generic);
}
