<?php

namespace App\Models;

use PDO;

class ChatModel extends BaseModel
{
    public function getChatroomByName($name)
    {
        $stmt = $this->db->prepare(
            "SELECT name FROM chatrooms WHERE name = :n"
        );
        $stmt->execute([':n' => $name]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAllChatrooms($filter, $offset, $limit)
    {
        $stmt = $this->db->prepare("
        SELECT name
        FROM chatrooms
        WHERE name LIKE :filter
        ORDER BY name
        LIMIT :limit OFFSET :offset
    ");
        $filter = $filter . '%';

        $stmt->bindParam(':filter', $filter);
        $stmt->bindValue(':limit', (int)$limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createChatroom($chatroom)
    {
        $stmt = $this->db->prepare("INSERT INTO chatrooms (name) VALUES (:name)");
        $stmt->execute([':name' => $chatroom]);
    }

    public function getMessagesForChatroom($chatroomName, $offset, $limit)
    {
        $stmt = $this->db->prepare("
        SELECT chatmessages.message, chatmessages.timestamp, users.username,chatmessages.pathtoimage,
        COALESCE(users.pathtopfp, '/images/assets/anonPfp.webp') AS pathtopfp
        FROM chatmessages
        LEFT JOIN users ON chatmessages.userId = users.id
        WHERE chatmessages.chatRoomId = (
            SELECT id FROM chatrooms WHERE name = :name LIMIT 1
        )
        ORDER BY chatmessages.timestamp DESC
        LIMIT :limit OFFSET :offset
    ");
        $stmt->bindParam(':name', $chatroomName);
        $stmt->bindValue(':limit', (int)$limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, \PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addMessage($userName, $chatroomName, $message, $imagePath)
    {
        // First find chatroom id
        $stmt = $this->db->prepare("SELECT id FROM chatrooms WHERE name = :name LIMIT 1");
        $stmt->execute([':name' => $chatroomName]);
        $chatroom = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$chatroom) {
            return false;
        }

        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = :name LIMIT 1");
        $stmt->execute([':name' => $userName]);
        $userId = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$userId) {
            $stmt = $this->db->prepare("INSERT INTO chatmessages ( chatRoomId, message,  pathtoimage) VALUES (:cid, :msg,:img)");
            $stmt->execute([
                ':cid' => $chatroom['id'],
                ':msg' => $message, // Raw input stored
                ':img' => $imagePath
            ]);
            return true;
        }


        $stmt = $this->db->prepare("INSERT INTO chatmessages (userId, chatRoomId, message, pathtoimage) VALUES (:uid, :cid, :msg, :img)");
        $stmt->execute([
            ':uid' => $userId['id'],
            ':cid' => $chatroom['id'],
            ':msg' => $message,
            ':img' => $imagePath
        ]);
        return true;
    }

    public function getAllMessagesSince($chatroomName, $timestamp)
    {
        $stmt = $this->db->prepare("
        SELECT chatmessages.message, chatmessages.timestamp, users.username,chatmessages.pathtoimage,
        COALESCE(users.pathtopfp, '/images/assets/anonPfp.webp') AS pathtopfp
        FROM chatmessages
        LEFT JOIN users ON chatmessages.userId = users.id
        WHERE chatmessages.chatRoomId = (
            SELECT id FROM chatrooms WHERE name = :name LIMIT 1
        )
        AND timestamp >= :timestamp
        ORDER BY chatmessages.timestamp DESC
        ");
        $stmt->execute([':name' => $chatroomName, ':timestamp' => $timestamp]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
