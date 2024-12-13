<?php
namespace App\Controllers;

class BaseController {
    protected function sendJsonResponse($data, $statusCode = 200) {
        header('Content-Type: application/json', true, $statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    protected function checkCSRF() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $clientToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            $serverToken = $_SESSION[CSRF_TOKEN_NAME] ?? '';
            if (empty($clientToken) || $clientToken !== $serverToken) {
                $this->sendJsonResponse(['success' => false, 'error' => 'CSRF token mismatch'], 403);
            }
        }
    }

    protected function sanitizeOutput($input) {
        // Use this when outputting data if needed
        return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }
}
