<?php

namespace App\Services;

class ImageUploadService
{
    public function uploadImage(array $file, bool $isProfilePicture = false): array
    {
        if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
            return [
                'status' => 'error',
                'message' => 'File upload error or no file uploaded.'
            ];
        }
        if ($file['size'] > MAX_IMAGE_SIZE) {
            return [
                'status' => 'error',
                'message' => 'File exceeds the maximum allowed size of ' . (MAX_IMAGE_SIZE / (1024 * 1024)) . ' MB.'
            ];
        }
        $validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $fileMimeType = mime_content_type($file['tmp_name']) ?: '';
        if (!in_array($fileMimeType, $validMimeTypes, true)) {
            return [
                'status' => 'error',
                'message' => 'Invalid file type. Only JPEG, PNG, or WebP are allowed.'
            ];
        }

        $sourceImage = $this->createImageResource($file['tmp_name'], $fileMimeType);
        if (!$sourceImage) {
            return [
                'status' => 'error',
                'message' => 'Failed to create image resource.'
            ];
        }

        $scaledImage = $this->scaleImage($sourceImage, $isProfilePicture);
        if (!$scaledImage) {
            imagedestroy($sourceImage);
            return [
                'status' => 'error',
                'message' => 'Failed to scale image.'
            ];
        }

        $userUploadsDir = __DIR__ . '/../../images/userUploads';

        $subDirectory = $isProfilePicture ? 'profilePictures' : 'messageUploads';
        $targetDirectory = $userUploadsDir . '/' . $subDirectory;


        $prefix = $isProfilePicture ? 'pfp_' : 'msg_';
        $uniqueFilename = uniqid($prefix, true) . '.webp';
        $fullPath = $targetDirectory . '/' . $uniqueFilename;

        imagedestroy($sourceImage);
        if (!imagewebp($scaledImage, $fullPath)) {
            imagedestroy($scaledImage);
            return [
                'status' => 'error',
                'message' => 'Failed to save image as WebP.'
            ];
        }

        imagedestroy($scaledImage);

        $publicPath = '/' . BASE_PATH . 'images/userUploads/' . $subDirectory . '/' . $uniqueFilename;

        return [
            'status' => 'success',
            'message' => 'Image uploaded successfully!',
            'path' => $publicPath
        ];
    }

    private function createImageResource(string $filePath, string $mimeType)
    {
        return match ($mimeType) {
            'image/jpeg' => imagecreatefromjpeg($filePath),
            'image/png' => imagecreatefrompng($filePath),
            'image/webp' => imagecreatefromwebp($filePath),
            default => false,
        };
    }

    private function scaleImage($sourceImage, bool $isProfilePicture)
    {
        $originalWidth = imagesx($sourceImage);
        $originalHeight = imagesy($sourceImage);

        if ($isProfilePicture) {
            $newWidth = 64;
            $newHeight = 64;
        } else {
            $maxDimension = 400;
            $aspectRatio = $originalWidth / $originalHeight;

            if ($originalWidth > $originalHeight) {
                $newWidth = min($originalWidth, $maxDimension);
                $newHeight = (int)round($newWidth / $aspectRatio);
            } else {
                $newHeight = min($originalHeight, $maxDimension);
                $newWidth = (int)round($newHeight * $aspectRatio);
            }
        }

        $scaledImage = imagecreatetruecolor($newWidth, $newHeight);
        if (!$scaledImage) {
            return false;
        }

        imagealphablending($scaledImage, false);
        imagesavealpha($scaledImage, true);

        if (!imagecopyresampled(
            $scaledImage,
            $sourceImage,
            0,
            0,
            0,
            0,
            $newWidth,
            $newHeight,
            $originalWidth,
            $originalHeight
        )) {
            imagedestroy($scaledImage);
            return false;
        }

        return $scaledImage;
    }
}
