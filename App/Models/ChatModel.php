<?php

namespace App\Models;

class ChatModel extends BaseModel
{
    public function getChatroomByName($name)
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM chatrooms WHERE name = :n"
        );
        $stmt->execute([':n' => $name]);
        return $stmt->fetch(); // returns false if no row found, or associative array if found
    }
    public function getAllChatrooms($filer)
    {
        // Prepare the SQL statement with a WHERE clause using LIKE
        $stmt = $this->db->prepare("
        SELECT name
        FROM chatrooms
        WHERE name LIKE :filer
        ORDER BY name
    ");
        $stmt->execute([':filer' => $filer . '%']);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    public function createChatroom($chatroom)
    {
        $stmt = $this->db->prepare("INSERT INTO chatrooms (name) VALUES (:name)");
        $stmt->execute([':name' => $chatroom]);
    }

    public function getMessagesForChatroom($chatroomName)
    {
        $stmt = $this->db->prepare("
            SELECT chatMessage.message, chatMessage.timestamp, user.username, chatMessage.image_path
            FROM chatMessage
            JOIN user ON chatMessage.userId = user.id
            JOIN chatroom ON chatMessage.chatRoomId = chatroom.id
            WHERE chatroom.name = :name
            ORDER BY chatMessage.timestamp
        ");
        $stmt->execute([':name' => $chatroomName]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function addMessage($userId, $chatroomName, $message, $imagePath)
    {
        // First find chatroom id
        $stmt = $this->db->prepare("SELECT id FROM chatroom WHERE name = :name LIMIT 1");
        $stmt->execute([':name' => $chatroomName]);
        $chatroom = $stmt->fetch();
        if (!$chatroom) {
            throw new \Exception("Chatroom not found");
        }

        $stmt = $this->db->prepare("INSERT INTO chatMessage (userId, chatRoomId, message, timestamp, image_path) VALUES (:uid, :cid, :msg, :ts, :img)");
        $stmt->execute([
            ':uid' => $userId,
            ':cid' => $chatroom['id'],
            ':msg' => $message, // Raw input stored
            ':ts' => date('Y-m-d H:i:s'),
            ':img' => $imagePath
        ]);
    }
}
