<?php

namespace App\Services;

/**
 * ImageUploadService
 *
 * Handles image uploads (JPEG, PNG, WebP), validates file size,
 * resizes images based on intended use, and stores them as WebP files
 * in the appropriate directory. Returns an associative array with
 * 'status' => 'success' or 'error', plus additional data or messages.
 */
class ImageUploadService
{
    /**
     * Maximum file size in bytes.
     * Default: 5 MB.
     */


    /**
     * uploadImage
     *
     * Uploads and optionally resizes an image. Saves the image as a .webp file.
     *
     * @param array $file             The uploaded file from $_FILES['someFile']
     * @param bool  $isProfilePicture Whether the image is intended as a profile picture
     *
     * @return array Associative array with status and message/path
     */
    public function uploadImage(array $file, bool $isProfilePicture = false): array
    {
        // -----------------------------------------------------
        // 1. Check for upload errors
        // -----------------------------------------------------
        if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
            return [
                'status'  => 'error',
                'message' => 'File upload error or no file uploaded.'
            ];
        }

        // -----------------------------------------------------
        // 2. Check file size
        // -----------------------------------------------------
        if ($file['size'] > MAX_IMAGE_SIZE) {
            return [
                'status'  => 'error',
                'message' => 'File exceeds the maximum allowed size of ' . (MAX_IMAGE_SIZE / (1024 * 1024)) . ' MB.'
            ];
        }

        // -----------------------------------------------------
        // 3. Validate MIME type
        // -----------------------------------------------------
        $validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $fileMimeType   = mime_content_type($file['tmp_name']) ?: '';
        if (!in_array($fileMimeType, $validMimeTypes, true)) {
            return [
                'status'  => 'error',
                'message' => 'Invalid file type. Only JPEG, PNG, or WebP are allowed.'
            ];
        }

        // -----------------------------------------------------
        // 4. Create an image resource
        // -----------------------------------------------------
        $sourceImage = $this->createImageResource($file['tmp_name'], $fileMimeType);
        if (!$sourceImage) {
            return [
                'status'  => 'error',
                'message' => 'Failed to create image resource.'
            ];
        }

        // -----------------------------------------------------
        // 5. Scale the image
        // -----------------------------------------------------
        $scaledImage = $this->scaleImage($sourceImage, $isProfilePicture);
        if (!$scaledImage) {
            imagedestroy($sourceImage);
            return [
                'status'  => 'error',
                'message' => 'Failed to scale image.'
            ];
        }

        // -----------------------------------------------------
        // 6. Determine destination directory
        // -----------------------------------------------------
        // Path to the userUploads folder (adjust if necessary)
        $userUploadsDir = __DIR__ . '/../../images/userUploads';

        // Profile pictures go to profilePictures/, others go to messageUploads/
        $subDirectory = $isProfilePicture ? 'profilePictures' : 'messageUploads';
        $targetDirectory = $userUploadsDir . '/' . $subDirectory;

        // Create the target directory if it doesn't exist
//        if (!is_dir($targetDirectory)) {
//            if (!mkdir($targetDirectory, 0777, true) && !is_dir($targetDirectory)) {
//                imagedestroy($sourceImage);
//                imagedestroy($scaledImage);
//                return [
//                    'status'  => 'error',
//                    'message' => 'Failed to create target directory.'
//                ];
//            }
//        }

        // -----------------------------------------------------
        // 7. Generate a unique filename
        // -----------------------------------------------------
        // Use prefix "pfp_" for profile pictures or "msg_" otherwise
        $prefix = $isProfilePicture ? 'pfp_' : 'msg_';
        // Adding true as second argument to uniqid() adds more entropy
        $uniqueFilename = uniqid($prefix, true) . '.webp';
        $fullPath       = $targetDirectory . '/' . $uniqueFilename;

        // -----------------------------------------------------
        // 8. Save the scaled image as WebP
        // -----------------------------------------------------
        imagedestroy($sourceImage);
        if (!imagewebp($scaledImage, $fullPath)) {
            imagedestroy($scaledImage);
            return [
                'status'  => 'error',
                'message' => 'Failed to save image as WebP.'
            ];
        }

        // Cleanup
        imagedestroy($scaledImage);

        // -----------------------------------------------------
        // 9. Return success response
        // -----------------------------------------------------
        // Construct a public path (adjust according to your setup)
        // For example, if your images are served from "/images/userUploads"
        $publicPath = '/images/userUploads/' . $subDirectory . '/' . $uniqueFilename;

        return [
            'status'  => 'success',
            'message' => 'Image uploaded successfully!',
            'path'    => $publicPath
        ];
    }

    /**
     * createImageResource
     *
     * Creates an image resource from a file path based on its MIME type.
     *
     * @param string $filePath  Path to the uploaded file
     * @param string $mimeType  The MIME type of the file
     *
     * @return resource|false  Returns an image resource on success, or false on failure
     */
    private function createImageResource(string $filePath, string $mimeType)
    {
        return match ($mimeType) {
            'image/jpeg' => imagecreatefromjpeg($filePath),
            'image/png'  => imagecreatefrompng($filePath),
            'image/webp' => imagecreatefromwebp($filePath),
            default      => false,
        };
    }

    /**
     * scaleImage
     *
     * Resizes an image resource. If $isProfilePicture is true,
     * the image is forced to exactly 64×64. Otherwise, it is resized
     * so neither width nor height exceeds 800 px, while preserving aspect ratio.
     *
     * @param resource $sourceImage       The original image resource
     * @param bool     $isProfilePicture  Whether it should be resized to 64×64
     *
     * @return resource|false  Returns the scaled image resource or false on failure
     */
    private function scaleImage($sourceImage, bool $isProfilePicture)
    {
        $originalWidth  = imagesx($sourceImage);
        $originalHeight = imagesy($sourceImage);

        if ($isProfilePicture) {
            // Fixed size for profile pictures
            $newWidth  = 64;
            $newHeight = 64;
        } else {
            // Scale proportionally so neither dimension exceeds 800
            $maxDimension = 800;
            $aspectRatio  = $originalWidth / $originalHeight;

            if ($originalWidth > $originalHeight) {
                // Landscape orientation
                $newWidth  = min($originalWidth, $maxDimension);
                $newHeight = (int)round($newWidth / $aspectRatio);
            } else {
                // Portrait or square
                $newHeight = min($originalHeight, $maxDimension);
                $newWidth  = (int)round($newHeight * $aspectRatio);
            }
        }

        // Create a new empty image with the new dimensions
        $scaledImage = imagecreatetruecolor($newWidth, $newHeight);
        if (!$scaledImage) {
            return false;
        }

        // Preserve transparency for PNG/WebP if needed
        imagealphablending($scaledImage, false);
        imagesavealpha($scaledImage, true);

        // Copy and resize
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
