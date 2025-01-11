<?php

namespace App\Controllers;

use App\Models\UserModel;

class AdminController extends BaseController
{
    public function getAllUsers()
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

        foreach ($users as &$user) {
            $user['username'] = $this->sanitizeOutput($user['username']);
            $user['email']    = $this->sanitizeOutput($user['email']);
        }

        $this->sendJsonResponse([
            'success' => true,
            'users'   => $users,
            'total'   => $total
        ]);
    }

    public function updateUserRole()
    {
        if (!isset($_SESSION['role']) ||
            ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'owner')) {
            $this->sendJsonResponse(['success' => false, 'error' => 'You do not have permission'], 403);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $newRole  = $data['role']     ?? '';

        if (strlen($username) < 2 || strlen($username) > 30) {
            $this->sendJsonResponse([
                'success' => false,
                'error'   => 'Username must be between 2 and 30 characters'
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
