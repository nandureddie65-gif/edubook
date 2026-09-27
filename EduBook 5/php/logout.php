<?php
/**
 * logout.php — POST → clear the session.
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['success' => false, 'message' => 'Method not allowed.']);
}

$_SESSION = [];
if (session_status() === PHP_SESSION_ACTIVE) {
    session_unset();
    session_destroy();
}

json_response(200, ['success' => true]);
