<?php
// Site Settings API
// GET = public (frontend fetch karega), PUT = admin only (settings update karega)
require_once __DIR__ . '/../../config/db.php';

// Database connection
$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        // ===== GET - Saari site settings fetch karna (Public - bina login ke bhi access) =====
        case 'GET':
            $query = "SELECT setting_key, setting_value FROM site_settings";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Key-value pair me convert karna (frontend ke liye easy)
            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }

            echo json_encode([
                "success" => true,
                "settings" => $settings
            ]);
            break;

        // ===== PUT - Settings update karna (Admin Only) =====
        case 'PUT':
            // Admin authentication
            require_once __DIR__ . '/../../middleware/auth.php';
            $admin = requireAdmin();

            $data = json_decode(file_get_contents("php://input"), true);

            if (empty($data) || !is_array($data)) {
                http_response_code(400);
                echo json_encode(["error" => "Settings data required hai. Format: {\"store_name\": \"My Store\", \"banner_text\": \"...\"}"]);
                exit;
            }

            // Allowed settings keys - sirf yeh keys update ho sakti hain
            $allowedKeys = [
                'store_name', 'store_tagline', 'banner_text',
                'contact_email', 'contact_phone', 'contact_address',
                'facebook_url', 'instagram_url', 'whatsapp_number'
            ];

            $updatedKeys = [];

            foreach ($data as $key => $value) {
                // Sirf allowed keys update karo
                if (!in_array($key, $allowedKeys)) {
                    continue;
                }

                $value = trim($value);

                // UPSERT - agar key exist karti hai toh update, warna insert
                $upsertQuery = "INSERT INTO site_settings (setting_key, setting_value) 
                                VALUES (:key, :value) 
                                ON DUPLICATE KEY UPDATE setting_value = :value2";
                $stmt = $conn->prepare($upsertQuery);
                $stmt->bindParam(':key', $key);
                $stmt->bindParam(':value', $value);
                $stmt->bindParam(':value2', $value);
                $stmt->execute();

                $updatedKeys[] = $key;
            }

            if (empty($updatedKeys)) {
                http_response_code(400);
                echo json_encode(["error" => "Koi valid setting key nahi mili. Allowed keys: " . implode(', ', $allowedKeys)]);
                exit;
            }

            echo json_encode([
                "success" => true,
                "message" => "Settings update ho gayi.",
                "updated_keys" => $updatedKeys
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed. Use GET ya PUT."]);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Settings error: " . $e->getMessage()]);
}
?>
