<?php
// Login API - user login karna aur JWT token dena
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/JwtHelper.php';

// Database connection
$db = new Database();
$conn = $db->getConnection();

// Sirf POST method allow hai
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Sirf POST method allowed hai."]);
    exit;
}

// Input data lena
$data = json_decode(file_get_contents("php://input"), true);

// Validation
if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Email aur password required hain."]);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];

try {
    // User ko email se dhundhna
    $query = "SELECT id, name, email, phone, password, role FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    // Agar user nahi mila
    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(["error" => "Email ya password galat hai."]);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Password verify karna - password_verify() hash se compare karta hai
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["error" => "Email ya password galat hai."]);
        exit;
    }

    // Login successful - JWT Token generate karna
    $tokenPayload = [
        "user_id" => (int)$user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => $user['role']
    ];

    $token = JwtHelper::generateToken($tokenPayload);

    // Response bhejna - frontend authStore ke format me
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Login successful.",
        "token" => $token,
        "user" => [
            "id" => (string)$user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "phone" => $user['phone'],
            "isAdmin" => $user['role'] === 'admin',
            "createdAt" => date('c')
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}
?>
