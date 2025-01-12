<?php

namespace App\Models;

use PDO;

class UserModel extends BaseModel
{
    /**
     * Creates a new user record in the database with username, email, hashed password, and pfp path.
     *
     * @param string $username   Unique username
     * @param string $email      Valid email address
     * @param string $passwordHash The hashed password
     * @param string $pathtopfp  File path to the uploaded profile picture
     * @return void
     */
    public function createUser(string $username, string $email, string $passwordHash, string $pathtopfp): void
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
    /**
     * Fetches a user's info (username, email, role, pathtopfp) by username.
     *
     * @param string $username
     * @return array|null Returns an associative array if found, or null otherwise
     */
    public function getUserByUsername(string $username): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT username,email,role,pathtopfp FROM users WHERE username = :u"
        );
        $stmt->execute([':u' => $username]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    /**
     * Fetches user info (including password) by username for authentication checks.
     *
     * @param string $username
     * @return mixed
     */
    public function getUserByUsernameValidation(string $username): mixed
    {
        $stmt = $this->db->prepare(
            "SELECT username,password,role FROM users WHERE username = :u"
        );
        $stmt->execute([':u' => $username]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    /**
     * Fetches user info (including password) by email for authentication checks.
     *
     * @param string $email
     * @return array|null
     */
    public function getUserByEmailValidation(string $email): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT email,password,role FROM users WHERE email = :e"
        );
        $stmt->execute([':e' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    /**
     * Retrieves a list of all users limited by $limit and offset by $offset.
     * Results are ordered by username ascending.
     *
     * @param string $offset Pagination offset
     * @param string $limit  Number of user records to fetch
     * @return array Array of user rows (username, email, role, pathtopfp)
     */
    public function getAllUsers(string $offset, string $limit): array
    {
        $stmt = $this->db->prepare("
        SELECT username, email, role,pathtopfp
        FROM users
        ORDER BY username
        LIMIT :limit OFFSET :offset
    ");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    /**
     * Returns the total count of users in the database.
     *
     * @return int The total number of users
     */
    public function getUsersCount(): int
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) AS total FROM users");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$row['total'];
    }
    /**
     * Updates a user's role in the database (e.g., 'user' => 'admin').
     *
     * @param string $username The target user's username
     * @param string $role     The new role ('admin', 'user', or 'owner')
     * @return void
     */
    public function updateUserRole(string $username, string $role): void
    {
        $stmt = $this->db->prepare("UPDATE users SET role = :role WHERE username = :u");
        $stmt->execute([
            ':role' => $role,
            ':u' => $username
        ]);
    }

}
