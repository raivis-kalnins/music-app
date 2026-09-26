<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
$storage = __DIR__ . '/storage';
$checks = [
    'php_version' => PHP_VERSION,
    'php_74_or_newer' => version_compare(PHP_VERSION, '7.4.0', '>='),
    'sessions_available' => function_exists('session_start'),
    'json_available' => function_exists('json_encode') && function_exists('json_decode'),
    'random_bytes_available' => function_exists('random_bytes'),
    'storage_exists' => is_dir($storage),
    'storage_writable' => is_dir($storage) && is_writable($storage),
];
$ok = !in_array(false, $checks, true);
http_response_code($ok ? 200 : 503);
echo json_encode(['ok' => $ok, 'checks' => $checks], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
