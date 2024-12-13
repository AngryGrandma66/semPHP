<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/generalConfig.php';
require_once __DIR__ . '/config/routes.php';

spl_autoload_register(function ($class) {
    // Convert namespace to the full file path
    $classPath = str_replace('\\', DIRECTORY_SEPARATOR, $class);

    // Append ".php" to the path and load the file
    $file = __DIR__ .'/' . $classPath . '.php';

    // Check if the file exists before requiring it
    if (file_exists($file)) {
        require_once $file;
    } else {
        // File not found error for better debugging
        die("File not found: {$file}");
    }
});
