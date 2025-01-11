<?php

global $routes;
require_once __DIR__ . '/autoload.php';
session_start();

$requestMethod = $_SERVER['REQUEST_METHOD'];
$fullUrl =  ltrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'); // Only remove leading slashes
error_log(var_export($fullUrl, true));
function matchRoute($url, $method, $routes): ?array
{
    foreach ($routes as $pattern => $routeInfo) {
        $regex = '#^' . str_replace('/\(\.\*\)/', '([^/]*)', trim($pattern, '/')) . '$#';

        if (preg_match($regex, $url, $matches)) {
            if ($method === $routeInfo['method']) {
                array_shift($matches);

                $processedParams = array_map(function($param) {
                    $decodedParam = urldecode($param);
                    return trim($decodedParam) === '' ? '' : $decodedParam;
                }, $matches);

                return [
                    'controller' => $routeInfo['controller'],
                    'action' => $routeInfo['action'],
                    'params' => $processedParams
                ];
            } else {
                return ['error' => 405];
            }
        }
    }
    return null;
}

$routeMatch = matchRoute($fullUrl, $requestMethod, $routes);

if (!$routeMatch) {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
    exit;
}

if (isset($routeMatch['error']) && $routeMatch['error'] === 405) {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$controllerClass = "App\\Controllers\\{$routeMatch['controller']}";
$action = $routeMatch['action'];
$params = $routeMatch['params'] ?? [];

if (class_exists($controllerClass)) {
    $controller = new $controllerClass();
    if (method_exists($controller, $action)) {
        call_user_func_array([$controller, $action], $params);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Action Not Found']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Controller Not Found']);
}
