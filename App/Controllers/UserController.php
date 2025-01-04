<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Services\ImageUploadService;

class UserController extends BaseController
{
    public function register()
    {
        // Because it's multipart/form-data, we won't do file_get_contents('php://input')
        // for the text fields. Instead, we get them from $_POST:
        $username = $_POST['username'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirmPassword'] ?? '';

        // Validation errors
        $errors = [];

        // 1. Validate username
        if (strlen($username) < 2 || strlen($username) > 20) {
            $errors['username'] = 'Username must be between 2 and 20 characters.';
        } elseif (filter_var($username, FILTER_VALIDATE_EMAIL)) {
            // or do a regex check for email pattern if you prefer
            $errors['username'] = 'Username cannot be in email format.';
        }
        // 2. Validate email
        if (empty($email)) {
            $errors['email'] = 'Email is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format.';
        }

        // 3. Validate password
        $passwordRegex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/';

        if (empty($password)) {
            $errors['password'] = 'Password is required.';
        } elseif (!preg_match($passwordRegex, $password)) {
            $errors['password'] = 'Password must include uppercase, lowercase, digit, and special char.';
        }

        // 4. Confirm password
        if (empty($confirmPassword)) {
            $errors['confirmPassword'] = 'Please confirm your password.';
        } elseif ($confirmPassword !== $password) {
            $errors['confirmPassword'] = 'Passwords do not match.';
        }

        // 5. Validate file upload
        if (!isset($_FILES['pfpPic']) || $_FILES['pfpPic']['error'] !== UPLOAD_ERR_OK) {
            // If no file or some error
            $errors['pfpPic'] = 'Please choose a picture.';
        }

        // If there are any errors, return them
        if (!empty($errors)) {
            $this->sendJsonResponse([
                'success' => false,
                'errors' => $errors,
            ], 400);
            return;
        }

        // 6. Use the ImageUploadService
        $imageUploadService = new ImageUploadService();
        $uploadResponse = $imageUploadService->uploadImage($_FILES['pfpPic'], true); // true => isProfilePicture

        if ($uploadResponse['status'] === 'error') {
            // The service might return ['status' => 'error', 'message' => '...']
            $this->sendJsonResponse([
                'success' => false,
                'errors' => ['pfpPic' => $uploadResponse['message']],
            ], 400);
            return;
        } // 7. Check if username/email exist
        $userModel = new UserModel();
        if ($userModel->getUserByUsername($username)) {
            $errors['username'] = 'Username is already taken.';
        }
        if ($userModel->getUserByEmail($email)) {
            $errors['email'] = 'Email is already in use.';
        }
        if (!empty($errors)) {
            $this->sendJsonResponse(['success' => false, 'errors' => $errors,], 409);
            return;
        }
        // 8. Create user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $userModel->createUser($username, $email, $hashedPassword, $uploadResponse['path']);

        // 9. Respond with JSON success
        $this->sendJsonResponse([
            'success' => true,
            'message' => 'Registered successfully.',
        ]);
    }

    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        error_log(var_export($data, true));
        $loginInput = $data['loginInput'] ?? '';
        $password = $data['password'] ?? '';

        $loginError = function ($errorMessage) {
            $this->sendJsonResponse([
                'success' => false,
                'error' => $errorMessage,
            ], 400);
            die;
        };
        // Basic validation
        if (empty($loginInput)) {
            $loginError('Username or email are required.');
        }
        if (empty($password)) {
            $loginError('Password is required.');
        }


        // Determine if it's an email or a username
        // Check using filter_var or a stricter regex if you prefer
        $userModel = new UserModel();
        if (filter_var($loginInput, FILTER_VALIDATE_EMAIL)) {
            // It's an email
            $user = $userModel->getUserByEmail($loginInput);
        } else {
            // It's a username
            $user = $userModel->getUserByUsername($loginInput);
        }

        if (!$user) {
            $loginError('Invalid username or password.');
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            $loginError('Invalid username or password.');
        }

        session_start();
        $_SESSION['username'] = $user['username'];

        $this->sendJsonResponse([
            'success' => true,
            'message' => 'Logged in successfully.'
        ]);
    }

    public function logout()
    {
        $this->checkCSRF();
        session_unset();
        session_destroy();
        session_start();
        $this->sendJsonResponse(['success' => true, 'message' => 'Logged out']);
    }

// /App/Controllers/UserController.php

    public function getCurrentUser()
    {
        session_start();
        if (isset($_SESSION['username'])) {
            $this->sendJsonResponse([
                'success' => true,
                'logged' => true,
                'user' => $_SESSION['username'],
                'role' => $_SESSION['role'] ?? 'user',
                'csrfToken' => $_SESSION[CSRF_TOKEN_NAME] ?? null
            ]);
            return;
        }

        http_response_code(401); // Set HTTP status code to 401
        $this->sendJsonResponse([
            'success' => false,
            'error' => 'You are not logged in.',
            'csrfToken' => $_SESSION[CSRF_TOKEN_NAME] ?? null
        ]);
    }

}
