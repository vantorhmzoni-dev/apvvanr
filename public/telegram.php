<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$configFile = __DIR__ . '/telegram-config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Missing telegram-config.php']);
    exit;
}

/** @var array{bot_token?: string, chat_id?: string} $config */
$config = require $configFile;
$token = trim((string) ($config['bot_token'] ?? ''));
$chatId = trim((string) ($config['chat_id'] ?? ''));

if ($token === '' || $chatId === '') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Invalid telegram-config.php']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw !== false ? $raw : '{}', true);
if (!is_array($data)) {
    $data = [];
}

$text = isset($data['text']) ? trim((string) $data['text']) : '';
$repeat = isset($data['repeat']) ? (int) $data['repeat'] : 1;
$repeat = max(1, min(3, $repeat));

if ($text === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Empty text']);
    exit;
}

$url = 'https://api.telegram.org/bot' . $token . '/sendMessage';

for ($i = 0; $i < $repeat; $i++) {
    $post = http_build_query([
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => 'true',
    ]);

    $ch = curl_init($url);
    if ($ch === false) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'curl_init failed']);
        exit;
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $post,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
    ]);

    $response = curl_exec($ch);
    $errno = curl_errno($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno !== 0 || $code < 200 || $code >= 300) {
        http_response_code(502);
        echo json_encode([
            'ok' => false,
            'error' => 'Telegram API error',
            'http' => $code,
            'details' => is_string($response) ? $response : '',
        ]);
        exit;
    }
}

echo json_encode(['ok' => true]);
