<?php

namespace App\Controllers;


use App\Models\ChatModel;
use JetBrains\PhpStorm\NoReturn;

class ProfileController extends BaseController
{
    /**
     * Retrieves messages belonging to a particular user, with pagination.
     *
     * Requirements:
     * - `$_GET['username']`: The user's username (2–50 chars).
     * - `$_GET['offset']`: The page offset (int).
     *
     * Behavior:
     * - Returns an array of messages plus the total count.
     *
     * @return void
     */
    #[NoReturn] public function getUserMessages(): void
    {
        if (!isset($_GET['username']) || !isset($_GET['offset'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Missing parameters'], 400);
        }

        $username = $_GET['username'];
        $offset = (int)$_GET['offset'];
        $limit = 10;

        if (strlen($username) < 2 || strlen($username) > 50) {
            $this->sendJsonResponse(['success' => false, 'error' => 'username length invalid'], 400);
        }
        if ($offset < 0 ) {
            $this->sendJsonResponse(['success' => false, 'error' => 'offset invalid'], 400);
        }

        $chatModel = new ChatModel();
        $messages = $chatModel->getMessagesByUser($username, $offset, $limit);
        $total = $chatModel->getUserMessagesCount($username);

        foreach ($messages as &$message) {
            $message['timestamp'] = $this->dateConversion($message['timestamp']);
        }

        $this->sendJsonResponse([
            'success' => true,
            'messages' => $messages,
            'total' => $total,
        ]);
    }
    /**
     * Edits a message if it belongs to the logged-in user.
     *
     * Requirements:
     * - A JSON body with "messageId" (int) and "message" (string).
     * - The logged-in user must own the message.
     *
     * @return void
     */
    #[NoReturn] public function editMessage(): void
    {

        if (!isset($_SESSION['username'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Not authenticated'], 401);
        }

        $data     = json_decode(file_get_contents('php://input'), true);
        $newText  = $data['message']   ?? '';
        $messageId= $data['messageId'] ?? '';

        if (strlen($newText) < 1 || strlen($newText) > 1000) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Message text out of range'], 400);
        }
        if (!ctype_digit((string)$messageId)) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Invalid messageId'], 400);
        }
        $username = $_SESSION['username'];

        $chatModel = new ChatModel();
        $success = $chatModel->editMessage($messageId, $newText, $username);

        if ($success) {
            $this->sendJsonResponse(['success' => true, 'message' => 'Message updated']);
        } else {
            $this->sendJsonResponse(['success' => false, 'error' => 'Could not update message'], 403);
        }
    }


}
