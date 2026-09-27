<?php
/**
 * login.php — POST { email, password } → sign in.
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['success' => false, 'message' => 'Method not allowed.']);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim((string)($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if (!is_valid_email($email) || $password === '') {
    json_response(400, ['success' => false, 'message' => 'Enter your email and password.']);
}

try {
    $stmt = $pdo->prepare('SELECT id, username, email, password_hash FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_response(401, ['success' => false, 'message' => 'Invalid email or password.']);
    }

    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];

    json_response(200, ['success' => true, 'username' => $user['username'], 'email' => $user['email']]);
} catch (Throwable $e) {
    json_response(500, ['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
