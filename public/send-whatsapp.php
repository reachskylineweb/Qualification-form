<?php
// Universal Fast IPv4 PHP Proxy for cPanel / Hostinger / Apache Web Hosting
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Api-Key");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$rawBody = file_get_contents("php://input");
$apiKey = "ws_S6Ky8ltrvAwCSCu_Fb9z-liOxLNRbVCn";

function sendToWhatsScale($rawBody, $apiKey) {
    $ch = curl_init("https://proxy.whatsscale.com/api/sendText");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody);
    // Force IPv4 to avoid 8-10s IPv6 DNS/connect timeout on cPanel servers!
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36");
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "X-Api-Key: " . $apiKey,
        "Content-Type: application/json",
        "Accept: application/json",
        "Connection: keep-alive"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$httpCode, $response];
}

list($httpCode, $response) = sendToWhatsScale($rawBody, $apiKey);

// Auto-retry once if Cloudflare returns 520 / 502 / 503
if ($httpCode >= 500 || !$httpCode) {
    usleep(250000);
    list($httpCode, $response) = sendToWhatsScale($rawBody, $apiKey);
}

http_response_code(($httpCode >= 200 && $httpCode < 300) ? $httpCode : 200);
echo $response ?: json_encode(["ok" => true]);
?>
