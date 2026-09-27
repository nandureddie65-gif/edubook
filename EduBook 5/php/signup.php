<?php
/**
 * signup.php — POST { username, email, password } → create account.
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['success' => false, 'message' => 'Method not allowed.']);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim((string)($input['username'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if (strlen($username) < 3 || strlen($username) > 50) {
    json_response(400, ['success' => false, 'message' => 'Username must be 3-50 characters.']);
}
if (!is_valid_email($email)) {
    json_response(400, ['success' => false, 'message' => 'Enter a valid email address.']);
}
if (!is_valid_password($password)) {
    json_response(400, ['success' => false, 'message' => 'Password must be 8+ characters with a letter and a number.']);
}

try {
    $check = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $check->execute(['email' => $email]);
    if ($check->fetch()) {
        json_response(409, ['success' => false, 'message' => 'An account with this email already exists.']);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $insert = $pdo->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :hash)');
    $insert->execute(['username' => $username, 'email' => $email, 'hash' => $hash]);

    $_SESSION['user_id'] = (int) $pdo->lastInsertId();
    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;

    json_response(200, ['success' => true, 'username' => $username, 'email' => $email]);
} catch (Throwable $e) {
    json_response(500, ['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
