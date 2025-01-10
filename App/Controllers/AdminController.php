<?php

namespace App\Controllers;

use App\Models\UserModel;

class AdminController extends BaseController
{
    public function getAllUsers()
    {
        // Ensure the user is admin or owner
        if (!isset($_SESSION['role']) ||
            ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'owner')) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You do not have permission'], 403);
        }

        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $limit = 20;

        $userModel = new UserModel();

        // Paged users
        $users = $userModel->getAllUsers($offset, $limit);

        // Total count of users to calculate pages
        $total = $userModel->getUsersCount();

        // Return JSON with both
        $this->sendJsonResponse([
            'success' => true,
            'users'   => $users,
            'total'   => $total  // We'll use this in the frontend
        ]);
    }
    /**
     * Allow admin or owner to update user role.
     *   - Admin can only promote user->admin
     *   - Owner can promote/demote
     */
    public function updateUserRole()
    {
        if (!isset($_SESSION['role']) ||
            ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'owner')) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You do not have permission'], 403);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $newRole = $data['role'] ?? '';

        if (!$username || !$newRole) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Missing parameters (username, role)'], 400);
        }

        // If the current user is admin, do not allow promoting to owner
        if ($_SESSION['role'] === 'admin' && $newRole === 'owner') {
            $this->sendJsonResponse(['success' => false, 'error' => 'Admins cannot assign owner role.'], 403);
        }

        $userModel = new UserModel();
        $user = $userModel->getUserByUsername($username);

        if (!$user) {
            $this->sendJsonResponse(['success' => false, 'error' => 'User not found'], 404);
        }

        // Only the owner can demote owners or admins if you want that logic
        // For example, if user is admin and newRole is user, ensure the session role is owner:
        if ($user['role'] === 'admin' && $newRole === 'user' && $_SESSION['role'] !== 'owner') {
            $this->sendJsonResponse(['success' => false, 'error' => 'Only the owner can demote an admin'], 403);
        }

        // Similarly if user is owner, only an owner can demote them (or maybe never).
        if ($user['role'] === 'owner' && $_SESSION['role'] !== 'owner') {
            $this->sendJsonResponse(['success' => false, 'error' => 'Only an owner can demote another owner'], 403);
        }

        // Now do the update
        $userModel->updateUserRole($username, $newRole);
        $this->sendJsonResponse(['success' => true, 'message' => 'User role updated']);
    }
}
