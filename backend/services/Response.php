<?php
class Response
{
    public static function success($data = [], ?string $message = null, int $code = 200, ?array $pagination = null): void
    {
        http_response_code($code);
        $payload = ['success' => true, 'data' => $data, 'message' => $message];
        if ($pagination !== null) {
            $payload['pagination'] = $pagination;
        }
        if (ob_get_length()) ob_clean();
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message, string $code = 'ERROR', int $httpCode = 400, $details = null): void
    {
        http_response_code($httpCode);
        if (ob_get_length()) ob_clean();
        echo json_encode([
            'success' => false,
            'error' => ['code' => $code, 'message' => $message, 'details' => $details],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
