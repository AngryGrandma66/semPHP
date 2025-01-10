<?php

namespace App\Controllers;

use App\Models\ChatModel;
use App\Services\ImageUploadService;

class ChatController extends BaseController
{
    public function chatroomByName(){
        if(!isset($_GET['name'])){
            $this->sendJsonResponse(['success'=> false, 'error'=> 'This chatroom does not exist']);
        }
        $name = $_GET['name'];
        $chatModel = new ChatModel();
        if($chatModel->getChatroomByName($name)){
            $this->sendJsonResponse(['success'=> true, 'message'=> 'This chatroom exists']);
        }
        $this->sendJsonResponse(['success'=> false, 'error'=> 'This chatroom does not exist']);

    }
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
        if (!isset ($_GET["chatroom"]) || !isset($_GET["offset"])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Missing chatroomName or messageOffset']);
            exit;
        }
        $chatroomName = $_GET["chatroom"];
        $messageOffset = $_GET["offset"];
        $chatModel = new ChatModel();
        $messages = $chatModel->getMessagesForChatroom($chatroomName, $messageOffset, 20);
        foreach ($messages as &$message) {
            $message['timestamp'] = $this->dateConversion($message['timestamp']);
        }
        $this->sendJsonResponse(['success' => true, 'messages' => $messages]);
    }

    public function addChatroom()
    {
        $chatroomName = json_decode(file_get_contents('php://input'), true);
        if (!isset($_SESSION['username'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You are not logged in']);
        }
        if (!strcmp($_SESSION['role'],'owner')&&!strcmp($_SESSION['role'],'admin')) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You do not have permission']);
        }
        if (!isset($chatroomName)) {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroomName is required']);
        }
        if ($chatroomName == "") {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroomName is required']);
        }
        if (strlen($chatroomName) < 3 || strlen($chatroomName) > 50) {
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
        $addMessageStatus = $chatModel->addMessage($username, $chatroomName, $messageText, $imagePath);

        if ($addMessageStatus) {
            $this->sendJsonResponse(['success' => true, 'message' => 'message sent']);
        }
        $this->sendJsonResponse(['success' => false, 'message' => 'message not sent']);
    }

    public function getLatestMessages()
    {
        if (!isset($_GET["timestamp"]) || !isset($_GET["chatroomName"])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'missing parameters']);
        }
        $chatroomName = $_GET["chatroomName"];
        $timestamp = $_GET["timestamp"];
        $timestamp = (int)$timestamp;
        $timestamp_plus_one_hour = $timestamp + 3600;
        $formattedTimestamp = date('Y-m-d H:i:s', $timestamp_plus_one_hour);
        $chatModel = new ChatModel();
        $messages = $chatModel->getAllMessagesSince($chatroomName, $formattedTimestamp);
        foreach ($messages as &$message) {
            $message['timestamp'] = $this->dateConversion($message['timestamp']);
        }
        $this->sendJsonResponse(['success' => true, 'messages' => $messages]);
    }
}
