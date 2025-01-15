<?php

namespace App\Models;

use PDO;

class ChatModel extends BaseModel
{
   public string $anonPath = '/' . BASE_PATH . '/images/assets/anonPfp.webp';
    /**
     * Retrieves a single chatroom by its name, or null if not found.
     *
     * @param string $name Chatroom name
     * @return array|null An associative array of the chatroom row, or null
     */
    public function getChatroomByName($name)
    {
        $stmt = $this->db->prepare(
            "SELECT name FROM chatrooms WHERE name = :n"
        );
        $stmt->execute([':n' => $name]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    /**
     * Retrieves up to $limit chatrooms matching a filter, offset by $offset.
     *
     * @param string $filter The search term
     * @param string $offset Pagination offset
     * @param string $limit  Number of records per page
     * @return array Array of chatroom rows
     */
    public function getAllChatrooms($filter,$offset, $limit)
    {
        $stmt = $this->db->prepare("
        SELECT name
        FROM chatrooms
        WHERE name LIKE :filter
        ORDER BY name asc
        LIMIT :limit OFFSET :offset
    ");
        $filter = '%' . $filter . '%';

        $stmt->bindParam(':filter', $filter);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    /**
     * Creates a new chatroom record.
     *
     * @param string $chatroom The name of the chatroom to create
     * @return void
     */
    public function createChatroom($chatroom)
    {
        $stmt = $this->db->prepare("INSERT INTO chatrooms (name) VALUES (:name)");
        $stmt->execute([':name' => $chatroom]);
    }
    /**
     * Fetches messages for a specific chatroom, in descending time order, limited by $limit.
     *
     * @param string $chatroomName Chatroom name
     * @param string $offset       Pagination offset
     * @param string $limit        Number of messages to fetch
     * @return array Array of message rows
     */
    public function getMessagesForChatroom($chatroomName, $offset, $limit)
    {

        $stmt = $this->db->prepare("
        SELECT chatmessages.message, chatmessages.timestamp, users.username,chatmessages.pathtoimage,chatmessages.id,
        COALESCE(users.pathtopfp, :anonPath) AS pathtopfp
        FROM chatmessages
        LEFT JOIN users ON chatmessages.userId = users.id
        WHERE chatmessages.chatRoomId = (
            SELECT id FROM chatrooms WHERE name = :name LIMIT 1
        )
        ORDER BY chatmessages.timestamp DESC
        LIMIT :limit OFFSET :offset
    ");
        $stmt->bindParam(':anonPath', $this->anonPath);
        $stmt->bindParam(':name', $chatroomName);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Adds a message to a chatroom, either from an authenticated user or anonymous.
     *
     * @param string|null $userName The username or null
     * @param string $chatroomName The target chatroom
     * @param string $message The message text
     * @param string|null $imagePath Optional path to an uploaded image
     * @return bool True on success, false on failure
     */
    public function addMessage($userName, $chatroomName, $message, $imagePath)
    {
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
                ':msg' => $message,
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

    /**
     * Retrieves any messages created in the chatroom at or after the given timestamp.
     *
     * @param string $chatroomName Chatroom name
     * @param string $timestamp    A formatted date/time string or MySQL datetime
     * @return array Array of new message rows
     */
    public function getAllMessagesSince($chatroomName, $timestamp)
    {
        $stmt = $this->db->prepare("
        SELECT chatmessages.message, chatmessages.timestamp, users.username,chatmessages.pathtoimage, chatmessages.id,
        COALESCE(users.pathtopfp, :anonPath) AS pathtopfp
        FROM chatmessages
        LEFT JOIN users ON chatmessages.userId = users.id
        WHERE chatmessages.chatRoomId = (
            SELECT id FROM chatrooms WHERE name = :name LIMIT 1
        )
        AND timestamp >= :timestamp
        ORDER BY chatmessages.timestamp DESC
        ");
        $stmt->execute([':name' => $chatroomName, ':timestamp' => $timestamp,':anonPath' => $this->anonPath]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    /**
     * Counts how many chatrooms match a given filter string.
     *
     * @param string $filter
     * @return int The total count of matching chatrooms
     */
    public function getChatroomsCount($filter = '')
    {
        $stmt = $this->db->prepare("
        SELECT COUNT(*) as total
        FROM chatrooms
        WHERE name LIKE :filter
    ");

        $filter = '%'. $filter . '%';
        $stmt->bindValue(':filter', $filter);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$row['total'];
    }

    /**
     * Retrieves messages for a specific user, offset/limit-based for pagination.
     *
     * @param string $username The username
     * @param string $offset   Pagination offset
     * @param string $limit    Page size
     * @return array Array of messages
     */
    public function getMessagesByUser($username, $offset, $limit)
    {
        $stmt = $this->db->prepare("
        SELECT id, pathtopfp
        FROM users
        WHERE username = :username
        LIMIT 1
    ");
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            return [];
        }
        $userId = $user['id'];
        $userPfp = $user['pathtopfp'] ?: $this->anonPath;

        $stmt = $this->db->prepare("
        SELECT chatmessages.id, chatmessages.message, chatmessages.timestamp, chatmessages.pathtoimage, chatmessages.chatRoomId,
        :userPfp AS pathtopfp
        FROM chatmessages
        WHERE chatmessages.userId = :uid
        ORDER BY chatmessages.timestamp DESC
        LIMIT :limit OFFSET :offset
    ");
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->bindValue(':userPfp', $userPfp);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    /**
     * Counts the total messages sent by a particular user.
     *
     * @param string $username
     * @return int The total number of messages
     */
    public function getUserMessagesCount($username)
    {
        $stmt = $this->db->prepare("
        SELECT COUNT(*) AS total
        FROM chatmessages
        WHERE userId = (SELECT id FROM users WHERE username = :username)
    ");
        $stmt->execute([':username' => $username]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$row['total'];
    }
    /**
     * Edits an existing message's text if it belongs to the given username.
     *
     * @param int $messageId The ID of the message to edit
     * @param string $newText   The updated message text
     * @param string $username  The current user's username
     * @return bool True if edit successful, false otherwise
     */
    public function editMessage($messageId, $newText, $username)
    {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = :username");
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            return false;
        }
        $userId = $user['id'];

        $stmt = $this->db->prepare("SELECT userId FROM chatmessages WHERE id = :mid");
        $stmt->execute([':mid' => $messageId]);
        $message = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$message) {
            return false;
        }

        if ($message['userId'] != $userId) {
            return false;
        }

        $stmt = $this->db->prepare("UPDATE chatmessages SET message = :msg WHERE id = :mid");
        $stmt->execute([':msg' => $newText, ':mid' => $messageId]);
        return true;
    }
}
