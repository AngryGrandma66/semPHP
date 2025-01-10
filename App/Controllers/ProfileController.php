<?php

namespace App\Controllers;


use App\Models\ChatModel;

class ProfileController extends BaseController
{
    public function getUserMessages()
    {
        if (!isset($_GET['username']) || !isset($_GET['offset']) || !isset($_GET['limit'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Missing parameters'], 400);
        }

        $username = $_GET['username'];
        $offset = (int)$_GET['offset'];
        $limit = (int)$_GET['limit'];

        $chatModel = new ChatModel();
        $messages = $chatModel->getMessagesByUser($username, $offset, $limit);
        $total = $chatModel->getUserMessagesCount($username);

        // Convert timestamps to a readable format
        foreach ($messages as &$message) {
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
        // Ensure the user is authenticated
        if (!isset($_SESSION['username'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Not authenticated'], 401);
        }

        // Retrieve data from the request body
        $data = json_decode(file_get_contents('php://input'), true);
        $newText = $data['message'] ?? '';
        $messageId = $data['messageId'] ?? '';

        if (empty($newText) || empty($messageId)) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Message ID and text are required'], 400);
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
