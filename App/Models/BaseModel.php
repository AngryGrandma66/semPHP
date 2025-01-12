<?php
namespace App\Models;

use PDO;

class BaseModel {
    protected $db;
    /**
     * Constructor that initializes a PDO instance for database connectivity.
     * It uses the global DSN, user, and password from your config.
     *
     * @throws \PDOException If the connection fails
     */
    public function __construct() {
        global $dsn, $user, $password;
        $this->db = new PDO($dsn, $user, $password);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
}
