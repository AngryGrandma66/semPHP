<?php
$routes = [
    // User
    BASE_PATH . 'api/register' => ['controller' => 'UserController', 'action' => 'register', 'method' => 'POST'],
    BASE_PATH . 'api/login' => ['controller' => 'UserController', 'action' => 'login', 'method' => 'POST'],
    BASE_PATH . 'api/logout' => ['controller' => 'UserController', 'action' => 'logout', 'method' => 'POST'],
    BASE_PATH . 'api/currentUser' => ['controller' => 'UserController', 'action' => 'getCurrentUser', 'method' => 'GET'],
    BASE_PATH . 'api/userByName' => ['controller' => 'UserController', 'action' => 'userByName', 'method' => 'GET'],

    // Chat
    BASE_PATH . 'api/addChatroom' => ['controller' => 'ChatController', 'action' => 'addChatroom', 'method' => 'POST'],
    BASE_PATH . 'api/getChatrooms' => ['controller' => 'ChatController', 'action' => 'getChatrooms', 'method' => 'GET'],
    BASE_PATH . 'api/chatroom/(.*)/sendMessage' => ['controller' => 'ChatController', 'action' => 'sendMessage', 'method' => 'POST'],
    BASE_PATH . 'api/getChatroomMessages' => ['controller' => 'ChatController', 'action' => 'getMessagesForChatroom', 'method' => 'GET'],
    BASE_PATH . 'api/getLatestMessages' => ['controller' => 'ChatController', 'action' => 'getLatestMessages', 'method' => 'GET'],
    BASE_PATH . 'api/getChatroomByName' => ['controller' => 'ChatController', 'action' => 'chatroomByName', 'method' => 'GET'],

    //admin
    BASE_PATH . 'api/getAllUsers' => ['controller' => 'AdminController', 'action' => 'getAllUsers', 'method' => 'GET'],
    BASE_PATH . 'api/updateUserRole' => ['controller' => 'AdminController', 'action' => 'updateUserRole', 'method' => 'POST'],

    //profile
    BASE_PATH . 'api/getUserMessages' => ['controller' => 'ProfileController', 'action' => 'getUserMessages', 'method' => 'GET'],
    BASE_PATH . 'api/editMessage' => ['controller' => 'ProfileController', 'action' => 'editMessage', 'method' => 'POST'],

];
