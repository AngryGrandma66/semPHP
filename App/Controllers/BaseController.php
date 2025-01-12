<?php

namespace App\Controllers;

use JetBrains\PhpStorm\NoReturn;

class BaseController
{
    /**
     * Sends a JSON response to the client with the provided data and status code, then exits.
     *
     * @param array $data The data to encode into JSON
     * @param int $statusCode The HTTP status code (e.g., 200, 400, 403)
     *
     * @return void This method sends output and terminates with `exit`
     */
    #[NoReturn] protected function sendJsonResponse(array $data, int $statusCode = 200): void
    {
        header('Content-Type: application/json', true, $statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Escapes HTML characters in a string (e.g., <, >) to prevent XSS.
     *
     * @param string|null $input The raw user input or message
     *
     * @return string The escaped string suitable for safe output
     */
    protected function sanitizeOutput(?string $input): string
    {
        return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Converts a MySQL datetime or similar string into a human-friendly date/time format.
     * - If the timestamp is within the day of sending, returns "today at HH:mm".
     * - If yesterday, returns "yesterday at HH:mm".
     * - Otherwise, returns "DD.MM.YYYY HH:mm".
     *
     * @param string $date Datetime string (e.g., '2023-07-08 14:30:00')
     *
     * @return string Human-friendly date/time description
     */
    protected function dateConversion(string $date): string
    {
        $messageTime = strtotime($date);

        $date = date('ymd', $messageTime);
        if ($date == date('ymd', strtotime('+1 hour'))) {
            return 'today at ' . date('H:i', $messageTime);
        } elseif ($date == date('ymd', strtotime("-23 hours"))) {
            return 'yesterday at ' . date('H:i', $messageTime);
        }
        return date('d.m.Y H:i', $messageTime);
    }
}
