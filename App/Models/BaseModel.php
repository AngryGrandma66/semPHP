<?php
namespace App\Models;

use PDO;

class BaseModel {
    protected $db;

    public function __construct() {
        global $dsn, $user, $password;
        $this->db = new PDO($dsn, $user, $password);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
}
