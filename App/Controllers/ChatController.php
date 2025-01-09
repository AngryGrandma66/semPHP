<?php

namespace App\Controllers;

use App\Models\ChatModel;
use App\Services\ImageUploadService;

class ChatController extends BaseController
{
    public function getChatrooms()
    {
        if (!isset ($_GET["filter"]) || !isset($_GET["offset"])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Missing filter or offset']);
            exit;
        }
        $filter = $_GET["filter"];
        $offset = $_GET["offset"];
        $chatModel = new ChatModel();
        $chatrooms = $chatModel->getAllChatrooms($filter, $offset, 20);
        if (count($chatrooms) === 0) {
            $this->sendJsonResponse(['success' => false, 'error' => 'No chatrooms were found']);
        }
        $this->sendJsonResponse(['success' => true, 'chatrooms' => $chatrooms]);
    }

    public function getMessagesForChatroom()
    {
        if (!isset ($_GET["chatroomName"]) || !isset($_GET["messageOffset"])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Missing chatroomName or messageOffset']);
            exit;
        }
        $chatroomName = $_GET["chatroomName"];
        $messageOffset = $_GET["messageOffset"];
        $chatModel = new ChatModel();
        $messages = $chatModel->getMessagesForChatroom($chatroomName, $messageOffset, 20);

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
        if (strlen($chatroomName) < 3 || strlen($chatroomName) > 100) {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroomName is too short or too long']);
        }
        if (str_contains($chatroomName, "/")) {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroomName cannot contain a slash']);
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
        $messageText = $_POST['message'] ?? '';
        $imagePath = null;

        if (!empty($_FILES['message_image']['tmp_name'])) {
            $imageService = new ImageUploadService();
            $uploadRes = $imageService->uploadImage($_FILES['message_image']);
            if (!$uploadRes['status']) {
                $this->sendJsonResponse($uploadRes, 400);
            }
            $imagePath = $uploadRes['path'];
        }
        $username = $_SESSION["username"] ?? null;
        $chatModel = new ChatModel();
        $chatModel->addMessage($username, $chatroomName, $messageText, $imagePath);

        $this->sendJsonResponse(['success' => true, 'message' => 'message sent']);
    }

    public function getLatestMessages()
    {
        if (!isset($_GET["timestamp"]) || !isset($_GET["chatroomName"])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'missing parameters']);
        }
        $chatroomName = $_GET["chatroomName"];
        $timestamp = $_GET["timestamp"];
        $formattedTimestamp = date('Y-m-d H:i:s', (int)$timestamp);
        $chatModel = new ChatModel();
        $messages = $chatModel->getAllMessagesSince($chatroomName, $formattedTimestamp);
        error_log(var_export($messages, true));
        $this->sendJsonResponse(['success' => true, 'messages' => $messages]);
    }
}
