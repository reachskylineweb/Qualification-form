<?php
// Cross-Device 1-Tap WhatsApp OTP Sync for Reach Skyline
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$storeFile = sys_get_temp_dir() . "/reachskyline_otp_sync.json";
$now = time();
$data = [];

if (file_exists($storeFile)) {
    $raw = @file_get_contents($storeFile);
    $decoded = @json_decode($raw, true);
    if (is_array($decoded)) {
        // Keep only entries from the last 10 minutes
        foreach ($decoded as $k => $ts) {
            if (($now - intval($ts)) < 600) {
                $data[$k] = $ts;
            }
        }
    }
}

$action = isset($_GET['action']) ? $_GET['action'] : '';
$otp = isset($_GET['otp']) ? preg_replace('/\D/', '', $_GET['otp']) : '';

if ($action === 'mark' && strlen($otp) === 6) {
    $data[$otp] = $now;
    @file_put_contents($storeFile, json_encode($data));
    echo json_encode(["ok" => true, "verified" => true]);
    exit;
}

if ($action === 'check' && strlen($otp) === 6) {
    $isVerified = isset($data[$otp]);
    echo json_encode(["ok" => true, "verified" => $isVerified]);
    exit;
}

echo json_encode(["ok" => false]);
?>
