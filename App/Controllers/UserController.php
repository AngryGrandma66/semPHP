<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Services\ImageUploadService;

class UserController extends BaseController
{
    public function register()
    {
        $username = $_POST['username'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirmPassword'] ?? '';

        $errors = [];

        if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $username)) {
            $errors['username'] = 'Username must be 3–20 chars long and only contain letters, digits, or underscores.';
        } elseif (filter_var($username, FILTER_VALIDATE_EMAIL)) {
            $errors['username'] = 'Username cannot be in email format.';
        }
        if (empty($email)) {
            $errors['email'] = 'Email is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format.';
        }

        $passwordRegex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,100}$/';

        if (empty($password)) {
            $errors['password'] = 'Password is required.';
        } elseif (!preg_match($passwordRegex, $password)) {
            $errors['password'] = 'Password must include uppercase, lowercase, digit, and special char.';
        }

        if (empty($confirmPassword)) {
            $errors['confirmPassword'] = 'Please confirm your password.';
        } elseif ($confirmPassword !== $password) {
            $errors['confirmPassword'] = 'Passwords do not match.';
        }

        if (!isset($_FILES['pfpPic']) || $_FILES['pfpPic']['error'] !== UPLOAD_ERR_OK) {
            $errors['pfpPic'] = 'Please choose a picture.';
        }

        if (!empty($errors)) {
            $this->sendJsonResponse([
                'success' => false,
                'errors' => $errors,
            ], 400);
            return;
        }

        $imageUploadService = new ImageUploadService();
        $uploadResponse = $imageUploadService->uploadImage($_FILES['pfpPic'], true);

        if ($uploadResponse['status'] === 'error') {
            $this->sendJsonResponse([
                'success' => false,
                'errors' => ['pfpPic' => $uploadResponse['message']],
            ], 400);
            return;
        }
        $userModel = new UserModel();
        if ($userModel->getUserByUsername($username)) {
            $errors['username'] = 'Username is already taken.';
        }
        if ($userModel->getUserByEmailValidation($email)) {
            $errors['email'] = 'Email is already in use.';
        }
        if (!empty($errors)) {
            $this->sendJsonResponse(['success' => false, 'errors' => $errors,], 409);
            return;
        }
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $userModel->createUser($username, $email, $hashedPassword, $uploadResponse['path']);

        $this->sendJsonResponse([
            'success' => true,
            'message' => 'Registered successfully.',
        ]);
    }

    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $loginInput = $data['loginInput'] ?? '';
        $password = $data['password'] ?? '';

        $loginError = function ($errorMessage) {
            $this->sendJsonResponse([
                'success' => false,
                'error' => $errorMessage,
            ], 400);
        };
        if (empty($loginInput)) {
            $loginError('Username or email are required.');
        }
        if (empty($password)) {
            $loginError('Password is required.');
        }


        $userModel = new UserModel();
        if (filter_var($loginInput, FILTER_VALIDATE_EMAIL)) {
            $user = $userModel->getUserByEmailValidation($loginInput);
        } else {
            $user = $userModel->getUserByUsernameValidation($loginInput);
        }

        if (!$user) {
            $loginError('Invalid username or password.');
        }
        session_destroy();

        if (!password_verify($password, $user['password'])) {
            $loginError('Invalid username or password.');
        }

        session_start();
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        $this->sendJsonResponse([
            'success' => true,
            'message' => 'Logged in successfully.'
        ]);
    }

    public function logout()
    {
        session_unset();
        session_destroy();
        session_start();
        $this->sendJsonResponse(['success' => true, 'message' => 'Logged out']);
    }


    public function getCurrentUser()
    {
        if (isset($_SESSION['username'])) {
            $this->sendJsonResponse([
                'success' => true,
                'logged' => true,
                'user' => $_SESSION['username'],
                'role' => $_SESSION['role'] ?? 'user',
            ]);
            return;
        }

        $this->sendJsonResponse([
            'success' => false,
            'error' => 'You are not logged in.',
        ]);
    }


    public function userByName()
    {
        if (!isset($_GET['username'])) {
            $this->sendJsonResponse(['success' => false, 'message' => 'No name in GET'], 400);
        }
        $username = $_GET['username'];

        if (strlen($username) < 2 || strlen($username) > 50) {
            $this->sendJsonResponse(['success' => false, 'error' => 'Username length invalid'], 400);
        }

        $userModel = new UserModel();
        $user = $userModel->getUserByUsername($username);

        if (!$user) {
            $this->sendJsonResponse(['success' => false, 'error' => 'This user does not exist'], 404);
        }

        $user['username'] = $this->sanitizeOutput($user['username']);
        $user['email'] = $this->sanitizeOutput($user['email']);
        $user['role'] = $this->sanitizeOutput($user['role']);

        $this->sendJsonResponse(['success' => true, 'user' => $user]);
    }

}
