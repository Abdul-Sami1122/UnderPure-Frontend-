<?php
// User Profile API - logged in user apni profile dekh aur update kar sakta hai
// GET = profile fetch, PUT = profile update
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Authentication required
$loggedInUser = authenticateToken();
$userId = $loggedInUser['user_id'];

$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        // ===== GET - Profile fetch karna =====
        case 'GET':
            $query = "SELECT id, name, email, phone, role, created_at FROM users WHERE id = :uid";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':uid', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(404);
                echo json_encode(["error" => "User nahi mila."]);
                exit;
            }

            // Frontend ke format me bhejo
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => (string)$user['id'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "phone" => $user['phone'],
                    "isAdmin" => $user['role'] === 'admin',
                    "createdAt" => $user['created_at']
                ]
            ]);
            break;

        // ===== PUT - Profile update karna =====
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);

            $name = isset($data['name']) ? trim($data['name']) : null;
            $phone = isset($data['phone']) ? trim($data['phone']) : null;

            if (!$name && !$phone) {
                http_response_code(400);
                echo json_encode(["error" => "Name ya phone update karne ke liye bhejo."]);
                exit;
            }

            // Existing user fetch
            $existQuery = "SELECT * FROM users WHERE id = :uid";
            $existStmt = $conn->prepare($existQuery);
            $existStmt->bindParam(':uid', $userId, PDO::PARAM_INT);
            $existStmt->execute();
            $existing = $existStmt->fetch(PDO::FETCH_ASSOC);

            $name = $name ?: $existing['name'];
            $phone = $phone ?: $existing['phone'];

            $updateQuery = "UPDATE users SET name = :name, phone = :phone WHERE id = :uid";
            $stmt = $conn->prepare($updateQuery);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':uid', $userId, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode([
                "success" => true,
                "message" => "Profile updated.",
                "user" => [
                    "id" => (string)$userId,
                    "name" => $name,
                    "email" => $existing['email'],
                    "phone" => $phone,
                    "isAdmin" => $existing['role'] === 'admin',
                    "createdAt" => $existing['created_at']
                ]
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed."]);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Profile error: " . $e->getMessage()]);
}
?>
