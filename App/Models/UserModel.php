<?php
namespace App\Models;

class UserModel extends BaseModel {
    public function createUser($username, $passwordHash) {
        $stmt = $this->db->prepare("INSERT INTO user (username, password) VALUES (:u, :p)");
        $stmt->execute([':u' => $username, ':p' => $passwordHash]);
    }

    public function getUserByUsername($username) {
        $stmt = $this->db->prepare("SELECT * FROM user WHERE username = :u");
        $stmt->execute([':u' => $username]);
        return $stmt->fetch();
    }

    public function getUserById($id) {
        $stmt = $this->db->prepare("SELECT id, username, profile_picture FROM user WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function updateProfilePicture($userId, $path) {
        $stmt = $this->db->prepare("UPDATE user SET profile_picture = :p WHERE id = :id");
        $stmt->execute([':p' => $path, ':id' => $userId]);
    }
}
