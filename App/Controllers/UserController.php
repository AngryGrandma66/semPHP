<?php
namespace App\Controllers;

use App\Models\UserModel;
use App\Services\ImageUploadService;

class UserController extends BaseController {
    public function register() {
//        $this->checkCSRF();
        // Here we accept raw input (JSON), parse it:
        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($username) || empty($password)) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Username and password required.'], 400);
        }

        $userModel = new UserModel();
        if ($userModel->getUserByUsername($username)) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Username taken.'], 409);
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $userModel->createUser($username, $hashed);
        $this->sendJsonResponse(['success' => true, 'message' => 'Registered successfully.']);
    }

    public function login() {
  //      $this->checkCSRF();
        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $userModel = new UserModel();
        $user = $userModel->getUserByUsername($username);
        if (!$user || !password_verify($password, $user['password'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Invalid credentials'], 401);
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));

        $this->sendJsonResponse(['success' => true, 'message' => 'Login successful', 'csrfToken' => $_SESSION[CSRF_TOKEN_NAME]]);
    }

    public function logout() {
        $this->checkCSRF();
        session_unset();
        session_destroy();
        session_start();
        $this->sendJsonResponse(['success' => true, 'message' => 'Logged out']);
    }

    public function getCurrentUser() {
        $loggedIn = isset($_SESSION['user_id']);
        $userData = null;
        if ($loggedIn) {
            $userModel = new UserModel();
            $userData = $userModel->getUserById($_SESSION['user_id']);
            // No need to sanitize here if we use textContent on frontend
        }
        $this->sendJsonResponse([
            'loggedIn' => $loggedIn,
            'user' => $userData,
            'csrfToken' => $_SESSION[CSRF_TOKEN_NAME] ?? null
        ]);
    }

    public function uploadProfilePicture() {
        $this->checkCSRF();
        if (!isset($_SESSION['user_id'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Not logged in'], 401);
        }

        if (empty($_FILES['profile_picture']['tmp_name'])) {
            $this->sendJsonResponse(['success' => false, 'error' => 'No file uploaded'], 400);
        }

        $imageService = new ImageUploadService();
        $result = $imageService->handleUpload($_FILES['profile_picture'], true);

        if (!$result['success']) {
            $this->sendJsonResponse($result, 400);
        }

        $userModel = new UserModel();
        $userModel->updateProfilePicture($_SESSION['user_id'], $result['path']);

        $this->sendJsonResponse(['success' => true, 'message' => 'Profile picture updated', 'path' => $result['path']]);
    }
}
