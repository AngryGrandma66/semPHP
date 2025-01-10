<?php
$routes = [
    // User
    'api/register' => ['controller' => 'UserController', 'action' => 'register', 'method' => 'POST'],
    'api/login' => ['controller' => 'UserController', 'action' => 'login', 'method' => 'POST'],
    'api/logout' => ['controller' => 'UserController', 'action' => 'logout', 'method' => 'POST'],
    'api/currentUser' => ['controller' => 'UserController', 'action' => 'getCurrentUser', 'method' => 'GET'],
    'api/uploadProfilePicture' => ['controller' => 'UserController', 'action' => 'uploadProfilePicture', 'method' => 'POST'],
    'api/userByName' => ['controller' => 'UserController', 'action' => 'userByName', 'method' => 'GET'],

    // Chat
    'api/addChatroom' => ['controller' => 'ChatController', 'action' => 'addChatroom', 'method' => 'POST'],
    'api/getChatrooms' => ['controller' => 'ChatController', 'action' => 'getChatrooms', 'method' => 'GET'],
    'api/chatroom/(.*)/sendMessage' => ['controller' => 'ChatController', 'action' => 'sendMessage', 'method' => 'POST'],
    'api/getChatroomMessages' => ['controller' => 'ChatController', 'action' => 'getMessagesForChatroom', 'method' => 'GET'],
    'api/getLatestMessages' => ['controller' => 'ChatController', 'action' => 'getLatestMessages', 'method' => 'GET'],
    'api/getChatroomByName' => ['controller' => 'ChatController', 'action' => 'chatroomByName', 'method' => 'GET'],

    //admin
    'api/getAllUsers' => ['controller' => 'AdminController', 'action' => 'getAllUsers', 'method' => 'GET'],
    'api/updateUserRole' => ['controller' => 'AdminController', 'action' => 'updateUserRole', 'method' => 'POST'],
];
