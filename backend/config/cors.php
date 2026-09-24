<?php
// Adapter l'origine en production (ne pas laisser * si cookies/session utilisés)
$allowedOrigin = getenv('FRONTEND_ORIGIN') ?: 'http://localhost:5173';
header("Access-Control-Allow-Origin: {$allowedOrigin}");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
// Ne pas forcer JSON sur les routes de téléchargement (PDF) — le contrôleur fixe son propre Content-Type
if (strpos($_SERVER['REQUEST_URI'], '/download') === false) {
    header("Content-Type: application/json; charset=utf-8");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
