<?php
namespace App\Services;

class ImageUploadService {
    public function handleUpload($file, $isProfilePicture = false) {
        $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($error !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'Upload error code ' . $error];
        }

        if ($file['size'] > MAX_IMAGE_SIZE) {
            return ['success' => false, 'error' => 'File too large'];
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, ALLOWED_IMAGE_TYPES)) {
            return ['success' => false, 'error' => 'Invalid file type'];
        }

        $image = $this->createImageResource($file['tmp_name'], $mime);
        if (!$image) {
            return ['success' => false, 'error' => 'Unsupported image type'];
        }

        if ($isProfilePicture) {
            $scaled = imagescale($image, 200, 200);
        } else {
            $scaled = $this->scaleToMax($image, 800, 800);
        }
        imagedestroy($image);

        $baseDir = __DIR__ . '/../../public/images/userUploads/' . ($isProfilePicture ? 'profilePictures/' : 'messageUploads/');
        if (!is_dir($baseDir)) {
            mkdir($baseDir, 0755, true);
        }

        $uniqueName = uniqid($isProfilePicture ? 'pfp_' : 'msg_', true) . '.webp';
        $uploadPath = $baseDir . $uniqueName;

        if (!imagewebp($scaled, $uploadPath)) {
            imagedestroy($scaled);
            return ['success' => false, 'error' => 'Failed to save image'];
        }
        imagedestroy($scaled);

        $publicPath = '/images/userUploads/' . ($isProfilePicture ? 'profilePictures/' : 'messageUploads/') . $uniqueName;
        return ['success' => true, 'path' => $publicPath];
    }

    private function createImageResource($file, $mime) {
        switch ($mime) {
            case 'image/jpeg':
                return imagecreatefromjpeg($file);
            case 'image/png':
                return imagecreatefrompng($file);
            case 'image/webp':
                return imagecreatefromwebp($file);
            default:
                return null;
        }
    }

    private function scaleToMax($image, $maxWidth, $maxHeight) {
        $width = imagesx($image);
        $height = imagesy($image);
        $ratio = min($maxWidth / $width, $maxHeight / $height);
        if ($ratio >= 1) {
            return $image;
        }
        $newWidth = (int)($width * $ratio);
        $newHeight = (int)($height * $ratio);
        return imagescale($image, $newWidth, $newHeight);
    }
}
