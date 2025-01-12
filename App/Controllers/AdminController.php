<?php

namespace App\Controllers;

use App\Models\UserModel;
use JetBrains\PhpStorm\NoReturn;

class AdminController extends BaseController
{
    /**
     * Retrieves a paginated list of all registered users.
     *
     * Requirements:
     * - The requester must have a role of 'admin' or 'owner'.
     * - The page offset is retrieved from `$_GET['offset']`, defaulting to 0.
     * - The limit per page is set to 8 users.
     *
     * Behavior:
     * - If the user is unauthorized or offset is invalid, a 403/400 error is returned as JSON.
     * - Returns a JSON response with:
     *   - "success": bool
     *   - "users": array of users (each user includes username, email, role, etc.)
     *   - "total": total count of all registered users
     *
     * @return void Outputs JSON and terminates the script (via sendJsonResponse).
     */
    #[NoReturn] public function getAllUsers(): void
    {
        if (!isset($_SESSION['role']) ||
            ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'owner')) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You do not have permission'], 403);
        }

        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        if ($offset < 0) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Offset cannot be negative'], 400);
        }


        $limit = 8;

        $userModel = new UserModel();
        $users = $userModel->getAllUsers($offset, $limit);
        $total = $userModel->getUsersCount();


        $this->sendJsonResponse([
            'success' => true,
            'users'   => $users,
            'total'   => $total
        ]);
    }
    /**
     * Updates the role of a specified user (e.g., from 'user' to 'admin' or vice versa).
     *
     * Requirements:
     * - The requester must have a role of 'admin' or 'owner'.
     * - Receives JSON input in the request body with keys "username" and "role".
     *
     * Behavior:
     * - Validates the username length (2–20) and ensures the target role is in ['admin', 'user', 'owner'].
     * - Checks the current session role to ensure it has enough privileges to promote/demote others.
     * - Returns a JSON response with:
     *   - "success": bool
     *   - "message" or "error": A success/failure message
     *
     * @return void Outputs JSON and terminates (via sendJsonResponse).
     */
    #[NoReturn] public function updateUserRole(): void
    {
        if (!isset($_SESSION['role']) ||
            ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'owner')) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You do not have permission'], 403);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $newRole  = $data['role']     ?? '';

        if (strlen($username) < 2 || strlen($username) > 20) {
            $this->sendJsonResponse([
                'success' => false,
                'error'   => 'Username must be between 2 and 20 characters'
            ], 400);
        }

        $allowedRoles = ['admin', 'user', 'owner'];
        if (!in_array($newRole, $allowedRoles, true)) {
            $this->sendJsonResponse([
                'success' => false,
                'error'   => "Invalid role. Must be one of: " . implode(', ', $allowedRoles),
            ], 400);
        }

        if ($_SESSION['role'] === 'admin' && $newRole === 'owner') {
            $this->sendJsonResponse(['success' => false, 'error' => 'Admins cannot assign owner role.'], 403);
        }

        $userModel = new UserModel();
        $user = $userModel->getUserByUsername($username);
        if (!$user) {
            $this->sendJsonResponse(['success' => false, 'error' => 'User not found'], 404);
        }

        if ($user['role'] === 'admin' && $newRole === 'user' && $_SESSION['role'] !== 'owner') {
            $this->sendJsonResponse(['success' => false, 'error' => 'Only the owner can demote an admin'], 403);
        }

        if ($user['role'] === 'owner' && $_SESSION['role'] !== 'owner') {
            $this->sendJsonResponse(['success' => false, 'error' => 'Only an owner can demote another owner'], 403);
        }

        $userModel->updateUserRole($username, $newRole);

        $this->sendJsonResponse(['success' => true, 'message' => 'User role updated']);
    }
}
