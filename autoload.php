<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/generalConfig.php';
require_once __DIR__ . '/config/routes.php';

/**
 * Registers an autoloader function that automatically requires class files based on their namespace.
 *
 * This autoloader transforms the fully qualified class name to a file path by replacing namespace
 * separators with the directory separator and appending ".php". If the file does not exist, the script
 * terminates with an error message.
 *
 * @param string $class The fully-qualified class name.
 *
 * @return void
 */
spl_autoload_register(function ($class) {
    $classPath = str_replace('\\', DIRECTORY_SEPARATOR, $class);

    $file = __DIR__ .'/' . $classPath . '.php';

    if (file_exists($file)) {
        require_once $file;
    } else {
        die("File not found: {$file}");
    }
});
