<?php
// Register API - naya user account banana
require_once __DIR__ . '/../../config/db.php';

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

// Validation - required fields check karna
if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Name, email aur password required hain."]);
    exit;
}

$name = trim($data['name']);
$email = trim($data['email']);
$phone = isset($data['phone']) ? trim($data['phone']) : null;
$password = $data['password'];
$role = isset($data['role']) ? $data['role'] : 'customer'; // Default role customer hai

// Email format validate karna
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Email format valid nahi hai."]);
    exit;
}

// Password length check
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password kam se kam 6 characters ka hona chahiye."]);
    exit;
}

// Role validate karna - sirf admin ya customer allowed hai
if (!in_array($role, ['admin', 'customer'])) {
    $role = 'customer';
}

try {
    // Check karna ke email already exist toh nahi karta
    $checkQuery = "SELECT id FROM users WHERE email = :email";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Yeh email already registered hai."]);
        exit;
    }

    // Password hash karna - password_hash() PHP ka built-in secure function hai
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // User insert karna database me
    $query = "INSERT INTO users (name, email, phone, password, role) VALUES (:name, :email, :phone, :password, :role)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':role', $role);

    if ($stmt->execute()) {
        $userId = $conn->lastInsertId();
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "User successfully register ho gaya.",
            "user" => [
                "id" => (int)$userId,
                "name" => $name,
                "email" => $email,
                "role" => $role
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "User register nahi ho saka."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}
?>
