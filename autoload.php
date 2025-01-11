<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/generalConfig.php';
require_once __DIR__ . '/config/routes.php';

spl_autoload_register(function ($class) {
    $classPath = str_replace('\\', DIRECTORY_SEPARATOR, $class);

    $file = __DIR__ .'/' . $classPath . '.php';

    if (file_exists($file)) {
        require_once $file;
    } else {
        die("File not found: {$file}");
    }
});
