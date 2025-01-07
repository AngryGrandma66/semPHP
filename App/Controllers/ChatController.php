<?php

namespace App\Controllers;

use App\Models\ChatModel;
use App\Services\ImageUploadService;

class ChatController extends BaseController
{
    public function getChatrooms()
    {
        $filter = $_GET["filter"];
        $offset = $_GET["offset"];
        $chatModel = new ChatModel();
        $chatrooms = $chatModel->getAllChatrooms($filter);
        if (count($chatrooms) === 0) {

            $this->sendJsonResponse(['success' => false, 'error' => 'No chatrooms were found']);
        }
        $this->sendJsonResponse(['success' => true, 'chatrooms' => $chatrooms]);
    }

    public function getMessagesForChatroom()
    {
        $chatroomName = $_GET["chatroomName"];
        $messageOffset = $_GET["messageOffset"];
        $chatModel = new ChatModel();
        $messages = $chatModel->getMessagesForChatroom($chatroomName);
        
        $this->sendJsonResponse(['success' => true, 'messages' => $messages]);
    }

    public function addChatroom()
    {
        $chatroomName = json_decode(file_get_contents('php://input'), true);
        error_log(var_export($chatroomName, true));
        if (!isset($chatroomName)) {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroomName is required']);
        }
        if ($chatroomName == "") {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroomName is required']);
        }
        if (strlen($chatroomName) < 3) {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroomName is too short']);
        }
        $chatModel = new ChatModel();
        if ($chatModel->getChatroomByName($chatroomName)) {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroom already exists']);
        }
        $chatModel->createChatroom($chatroomName);
        $this->sendJsonResponse(['success' => true]);


    }

    public function sendMessage($chatroomName)
    {
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
