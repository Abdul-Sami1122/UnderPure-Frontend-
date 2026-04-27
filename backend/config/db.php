<?php
class Database {
    private $host = "localhost";
    private $db_name = "ecommerce_db";
    private $username = "root";  // Apni MySQL username dalen
    private $password = "";      // Apni MySQL password dalen
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            // Error handling ko exception par set karein
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo json_encode(["error" => "Database Connection Error: " . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
?>
