<?php

namespace App\Controllers;


use App\Models\ChatModel;

class ProfileController extends BaseController
{
    public function getUserMessages()
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
            $message['message'] = $this->sanitizeOutput($message['message']);
            $message['timestamp'] = $this->dateConversion($message['timestamp']);
        }

        $this->sendJsonResponse([
            'success' => true,
            'messages' => $messages,
            'total' => $total,
        ]);
    }

    public function editMessage()
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
