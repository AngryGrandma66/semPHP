<?php
namespace App\Controllers;

use App\Models\ChatModel;
use App\Services\ImageUploadService;

class ChatController extends BaseController {
    public function getChatrooms() {
        // GET request, no CSRF needed
        $chatModel = new ChatModel();
        $chatrooms = $chatModel->getAllChatrooms();
        // No sanitization needed here if front-end uses textContent
        $this->sendJsonResponse(['success' => true, 'chatrooms' => $chatrooms]);
    }

    public function getMessagesForChatroom($chatroomName) {
        $chatModel = new ChatModel();
        $messages = $chatModel->getMessagesForChatroom($chatroomName);

        // Data is raw. On the frontend, we use textContent.
        $this->sendJsonResponse(['success' => true, 'messages' => $messages]);
    }

    public function sendMessage($chatroomName) {
        $this->checkCSRF();
        if (!isset($_SESSION['user_id'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Not logged in'], 401);
        }

        // Form data with message and optional file
        $messageText = $_POST['message'] ?? '';
        $imagePath = null;

        if (!empty($_FILES['message_image']['tmp_name'])) {
            $imageService = new ImageUploadService();
            $uploadRes = $imageService->handleUpload($_FILES['message_image'], false);
            if (!$uploadRes['success']) {
                $this->sendJsonResponse($uploadRes, 400);
            }
            $imagePath = $uploadRes['path'];
        }

        $chatModel = new ChatModel();
        $chatModel->addMessage($_SESSION['user_id'], $chatroomName, $messageText, $imagePath);

        $this->sendJsonResponse(['success' => true, 'message' => 'Message sent', 'imagePath' => $imagePath]);
    }
}
