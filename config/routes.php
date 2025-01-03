<?php
$routes = [
    // User
    'api/register' => ['controller' => 'UserController', 'action' => 'register', 'method' => 'POST'],
    'api/login' => ['controller' => 'UserController', 'action' => 'login', 'method' => 'POST'],
    'api/logout' => ['controller' => 'UserController', 'action' => 'logout', 'method' => 'POST'],
    'api/currentUser' => ['controller' => 'UserController', 'action' => 'getCurrentUser', 'method' => 'GET'],
    'api/uploadProfilePicture' => ['controller' => 'UserController', 'action' => 'uploadProfilePicture', 'method' => 'POST'],

    // Chat
    'api/chatrooms' => ['controller' => 'ChatController', 'action' => 'getChatrooms', 'method' => 'GET'],
    'api/chatroom/(.*)/sendMessage' => ['controller' => 'ChatController', 'action' => 'sendMessage', 'method' => 'POST'],
    'api/chatroom/(.*)' => ['controller' => 'ChatController', 'action' => 'getMessagesForChatroom', 'method' => 'GET'],

];
