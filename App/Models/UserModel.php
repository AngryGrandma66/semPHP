<?php

namespace App\Models;

class UserModel extends BaseModel
{
    public function createUser($username, $email, $passwordHash,$pathtopfp)
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (username, email, password,pathtopfp)
             VALUES (:u, :e, :p,:pa)"
        );
        $stmt->execute([
            ':u' => $username,
            ':e' => $email,
            ':p' => $passwordHash,
            ':pa' => $pathtopfp
        ]);
    }

    // Get user by username
    public function getUserByUsername($username)
    {
        $stmt = $this->db->prepare(
            "SELECT username,email,role,pathtopfp FROM users WHERE username = :u"
        );
        $stmt->execute([':u' => $username]);

        return $stmt->fetch(\PDO::FETCH_ASSOC); // returns false if no row found, or associative array if found
    }

    public function getUserByUsernameValidation($username)
    {
        $stmt = $this->db->prepare(
            "SELECT username,password,role FROM users WHERE username = :u"
        );
        $stmt->execute([':u' => $username]);

        return $stmt->fetch(\PDO::FETCH_ASSOC); // returns false if no row found, or associative array if found
    }
    // Get user by email
    public function getUserByEmailValidation($email)
    {
        $stmt = $this->db->prepare(
            "SELECT email,password,role FROM users WHERE email = :e"
        );
        $stmt->execute([':e' => $email]);
        return $stmt->fetch(\PDO::FETCH_ASSOC); // returns false if no row found, or associative array if found
    }
}
