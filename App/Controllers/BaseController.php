<?php
namespace App\Controllers;

class BaseController {
    protected function sendJsonResponse($data, $statusCode = 200) {
        header('Content-Type: application/json', true, $statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    protected function sanitizeOutput($input) {
        return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }
    protected function dateConversion($date)
    {
        $messageTime = strtotime($date);

        $date = date('ymd', $messageTime);
        if ($date == date('ymd',strtotime('+1 hour'))) {
            return 'today at ' . date('H:i', $messageTime);
        } elseif ($date == date('ymd', strtotime("-23 hours"))) {
            return 'yesterday at ' . date('H:i', $messageTime);
        }
        return date('d.m.Y H:i', $messageTime);
    }
}
