<?php

namespace App\Models;

class UserModel extends BaseModel
{
    public function createUser($username, $email, $passwordHash)
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (username, email, password)
             VALUES (:u, :e, :p)"
        );
        $stmt->execute([
            ':u' => $username,
            ':e' => $email,
            ':p' => $passwordHash
        ]);
    }

    // Get user by username
    public function getUserByUsername($username)
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM users WHERE username = :u"
        );
        $stmt->execute([':u' => $username]);
        return $stmt->fetch(); // returns false if no row found, or associative array if found
    }

    // Get user by email
    public function getUserByEmail($email)
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM users WHERE email = :e"
        );
        $stmt->execute([':e' => $email]);
        return $stmt->fetch(); // returns false if no row found, or associative array if found
    }

    public function getUserById($id)
    {
        $stmt = $this->db->prepare("SELECT id, username, profile_picture FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function updateProfilePicture($userId, $path)
    {
        $stmt = $this->db->prepare("UPDATE users SET profile_picture = :p WHERE id = :id");
        $stmt->execute([':p' => $path, ':id' => $userId]);
    }
}
