<?php
namespace App\Models;

class ChatModel extends BaseModel {
    public function getAllChatrooms() {
        $stmt = $this->db->query("SELECT name FROM chatroom ORDER BY name");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getMessagesForChatroom($chatroomName) {
        $stmt = $this->db->prepare("
            SELECT chatMessage.message, chatMessage.timestamp, user.username, chatMessage.image_path
            FROM chatMessage
            JOIN user ON chatMessage.userId = user.id
            JOIN chatroom ON chatMessage.chatRoomId = chatroom.id
            WHERE chatroom.name = :name
            ORDER BY chatMessage.timestamp ASC
        ");
        $stmt->execute([':name' => $chatroomName]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function addMessage($userId, $chatroomName, $message, $imagePath) {
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
