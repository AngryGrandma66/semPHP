<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Services\ImageUploadService;

class UserController extends BaseController
{
    public function register()
    {
        $data = json_decode(file_get_contents('php://input'), true);


        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $confirmPassword = $data['confirmPassword'] ?? '';

        // Prepare an array to store validation errors
        $errors = [];

        // 1. Validate Username
        if (empty($username)) {
            $errors['username'] = 'Usernamea is required.';
        } elseif (strlen($username) < 3) {
            // Example additional check: minimum length of 3
            $errors['username'] = 'Username must be at least 3 characters.';
        }

        // 2. Validate Email
        if (empty($email)) {
            $errors['email'] = 'Email is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format.';
        }

        // 3. Validate Password using your required regex
        //    - At least 8 characters
        //    - At least one lowercase letter
        //    - At least one uppercase letter
        //    - At least one digit
        //    - At least one special character
        $passwordRegex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/';

        if (empty($password)) {
            $errors['password'] = 'Password is required.';
        } elseif (!preg_match($passwordRegex, $password)) {
            $errors['password'] = 'Password must be at least 8 chars and include uppercase, lowercase, digit, and special character.';
        }

        // 4. Validate Confirm Password
        if (empty($confirmPassword)) {
            $errors['confirmPassword'] = 'Please confirm your password.';
        } elseif ($confirmPassword !== $password) {
            $errors['confirmPassword'] = 'Passwords do not match.';
        }

        // If there are any errors, return them immediately
        if (!empty($errors)) {
            $this->sendJsonResponse([
                'success' => false,
                'errors' => $errors
            ], 400);
            return;
        }

        // No validation errors so far. Check if username or email already exist
        $userModel = new UserModel();

        // Check if username is taken
        if ($userModel->getUserByUsername($username)) {
            $errors['username'] = 'Username is already taken.';
        }

        // Check if email is taken
        if ($userModel->getUserByEmail($email)) {
            $errors['email'] = 'Email is already in use.';
        }

        // If username or email is taken, return error
        if (!empty($errors)) {
            $this->sendJsonResponse([
                'success' => false,
                'errors' => $errors
            ], 409);
            return;
        }

        // Now hash the password and create the user
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $userModel->createUser($username, $email, $hashed);

        // Return success
        $this->sendJsonResponse([
            'success' => true,
            'message' => 'Registered successfully.'
        ]);
    }

    public function login()
    {
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

    public function logout()
    {
        $this->checkCSRF();
        session_unset();
        session_destroy();
        session_start();
        $this->sendJsonResponse(['success' => true, 'message' => 'Logged out']);
    }

    public function getCurrentUser()
    {
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

    public function uploadProfilePicture()
    {
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
