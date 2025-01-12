<?php

namespace App\Controllers;

use App\Models\ChatModel;
use App\Services\ImageUploadService;
use JetBrains\PhpStorm\NoReturn;

class ChatController extends BaseController
{
    /**
     * Checks if a chatroom exists by name.
     *
     * Requirements:
     * - The `$_GET['name']` parameter must be present.
     * Behavior:
     * - If the chatroom is found, returns a success JSON response.
     * - Otherwise, returns an error message in JSON.
     *
     * @return void
     */
    #[NoReturn] public function chatroomByName(): void
    {
        if (!isset($_GET['name'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'This chatroom does not exist'],404);
        }
        $name = $_GET['name'];
        $chatModel = new ChatModel();
        if (!$chatModel->getChatroomByName($name)) {
            $this->sendJsonResponse(['success' => false, 'error' => 'This chatroom does not exist'],404);
        }
        $this->sendJsonResponse(['success' => true, 'message' => 'This chatroom exists']);

    }
    /**
     * Retrieves a paginated list of chatrooms, optionally filtered by a search term.
     *
     * Requirements:
     * - `$_GET["filter"]` (string, up to 50 chars) and `$_GET["offset"]` (int) are required.
     * - Returns up to 10 chatrooms per page by default.
     *
     * Behavior:
     * - If no chatrooms are found, returns a JSON error message.
     * - Otherwise, returns "chatrooms" (array) and "total" (int) in JSON.
     *
     * @return void
     */
    #[NoReturn] public function getChatrooms(): void
    {
        if (!isset($_GET["filter"]) || !isset($_GET["offset"])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Missing filter or offset'], 400);
        }

        $filter = $_GET["filter"];
        $offset = (int)$_GET["offset"];

        if (strlen($filter) > 50) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Filter is too long'], 400);
        }
        if ($offset < 0) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Offset cannot be negative'], 400);
        }

        $chatModel = new ChatModel();
        $chatrooms = $chatModel->getAllChatrooms($filter, $offset, 10);

        if (count($chatrooms) === 0) {
            $this->sendJsonResponse(['success' => false, 'error' => 'No chatrooms were found']);
        }

        foreach ($chatrooms as &$c) {
            $c['name'] = $this->sanitizeOutput($c['name']);
        }

        $totalCount = $chatModel->getChatroomsCount($filter);

        $this->sendJsonResponse([
            'success' => true,
            'chatrooms' => $chatrooms,
            'total' => $totalCount,
        ]);
    }
    /**
     * Retrieves messages for a specified chatroom, with pagination.
     *
     * Requirements:
     * - `$_GET["chatroom"]`: string (1–20 chars) is the chatroom name.
     * - `$_GET["offset"]`: int for pagination offset.
     *
     * Behavior:
     * - Returns an array of messages, each containing text, username, timestamp, etc.
     *
     * @return void
     */
    #[NoReturn] public function getMessagesForChatroom(): void
    {
        if (!isset($_GET["chatroom"]) || !isset($_GET["offset"])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Missing chatroomName or offset'], 400);
        }

        $chatroomName = $_GET["chatroom"];
        $messageOffset = (int)$_GET["offset"];

        if (strlen($chatroomName) < 1 || strlen($chatroomName) > 20) {
            $this->sendJsonResponse(['success' => false, 'error' => 'chatroomName length out of range'], 400);
        }
        if ($messageOffset < 0) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Offset must be non-negative'], 400);
        }

        $chatModel = new ChatModel();
        $messages = $chatModel->getMessagesForChatroom($chatroomName, $messageOffset, 20);

        foreach ($messages as &$msg) {
            $msg['message'] = $this->sanitizeOutput($msg['message']);
            $msg['username'] = $this->sanitizeOutput($msg['username']);
            $msg['timestamp'] = $this->dateConversion($msg['timestamp']);
        }

        $this->sendJsonResponse(['success' => true, 'messages' => $messages]);
    }
    /**
     * Creates a new chatroom, restricted to 'admin' or 'owner' roles.
     *
     * Requirements:
     * - A JSON body with the chatroom name. It must match /^[A-Za-z0-9_]{3,20}$/.
     *
     * @return void
     */
    #[NoReturn] public function addChatroom(): void
    {
        $chatroomName = json_decode(file_get_contents('php://input'), true);
        if (!isset($_SESSION['username'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You are not logged in']);
        }
        if (!strcmp($_SESSION['role'], 'owner') && !strcmp($_SESSION['role'], 'admin')) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You do not have permission']);
        }
        if (!isset($chatroomName) || $chatroomName === '') {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroomName is required']);
        }

        if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $chatroomName)) {
            $this->sendJsonResponse([
                'success' => false,
                'message' => 'Chatroom name must be 3–20 chars long and only contain letters, digits, or underscores.'
            ]);
        }
        $chatModel = new ChatModel();
        if ($chatModel->getChatroomByName($chatroomName)) {
            $this->sendJsonResponse(['success' => false, 'message' => 'chatroom already exists']);
        }
        $chatModel->createChatroom($chatroomName);
        $this->sendJsonResponse(['success' => true]);
    }

    /**
     * Sends a message (optionally with an image) to a specified chatroom.
     *
     * @param string $chatroomName The name of the chatroom from the route parameter.
     *
     * Requirements:
     * - `$_POST["message"]`: string (1–1000 chars).
     * - Optionally, a file upload in `$_FILES["message_image"]`.
     *
     * @return void
     */
    #[NoReturn] public function sendMessage(string $chatroomName): void
    {
        $messageText = $_POST['message'] ?? '';
        $imagePath = null;

        if (strlen($chatroomName) < 1 || strlen($chatroomName) > 30) {
            $this->sendJsonResponse(['success' => false, 'textError' => 'chatroomName invalid'], 400);
        }
        if (strlen($messageText)<1 ||strlen($messageText) > 1000) {
            $this->sendJsonResponse(['success' => false, 'textError' => 'message length out of range'], 400);
        }
        if (!empty($_FILES['message_image']['tmp_name'])) {
            $imageService = new ImageUploadService();
            $uploadRes = $imageService->uploadImage($_FILES['message_image']);
            if ($uploadRes['status'] === 'error') {
                $this->sendJsonResponse([
                    'success' => false,
                    'errors' => ['fileError' => $uploadRes['message']],
                ], 400);
            }
            $imagePath = $uploadRes['path'];
        }
        $username = $_SESSION["username"] ?? null;
        $chatModel = new ChatModel();
        $addMessageStatus = $chatModel->addMessage($username, $chatroomName, $messageText, $imagePath);

        if ($addMessageStatus) {
            $this->sendJsonResponse(['success' => true, 'message' => 'message sent']);
        }
        $this->sendJsonResponse(['success' => false, 'message' => 'message not sent'], 500);

    }
    /**
     * Retrieves any new messages posted to the chatroom since a given timestamp.
     *
     * Requirements:
     * - `$_GET["timestamp"]`: Unix timestamp.
     * - `$_GET["chatroomName"]`: The chatroom name.
     *
     * @return void
     */
    #[NoReturn] public function getLatestMessages(): void
    {
        if (!isset($_GET["timestamp"]) || !isset($_GET["chatroomName"])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'missing parameters'], 400);
        }

        $chatroomName = $_GET["chatroomName"];
        $timestamp = (int)$_GET["timestamp"];

        if (strlen($chatroomName) < 1 || strlen($chatroomName) > 50) {
            $this->sendJsonResponse(['success' => false, 'error' => 'chatroomName out of range'], 400);
        }
        if ($timestamp < 0) {
            $this->sendJsonResponse(['success' => false, 'error' => 'timestamp invalid'], 400);
        }
        $formattedTimestamp = date('Y-m-d H:i:s', $timestamp);
        $chatModel = new ChatModel();
        $messages = $chatModel->getAllMessagesSince($chatroomName, $formattedTimestamp);
        foreach ($messages as &$message) {
            $message['message'] = $this->sanitizeOutput($message['message']);
            $message['username'] = $this->sanitizeOutput($message['username']);
            $message['timestamp'] = $this->dateConversion($message['timestamp']);
        }
        $this->sendJsonResponse(['success' => true, 'messages' => $messages]);
    }
}
