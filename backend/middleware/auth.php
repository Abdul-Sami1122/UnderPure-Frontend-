<?php
// Auth Middleware - har protected route se pehle call hoga
// Yeh function Authorization header se JWT token nikalta hai aur verify karta hai
require_once __DIR__ . '/../helpers/JwtHelper.php';

function authenticateToken() {
    // Authorization header check karna
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    // "Bearer <token>" format me aata hai, "Bearer " hata ke sirf token nikalna
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["error" => "Access denied. Token nahi mila."]);
        exit;
    }

    $token = $matches[1];

    // Token verify karna
    $decoded = JwtHelper::verifyToken($token);

    if ($decoded === null) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid ya expired token."]);
        exit;
    }

    // Token valid hai, decoded payload return karo (user_id, role, etc.)
    return $decoded;
}

// Sirf admin ko access dene ke liye middleware
function requireAdmin() {
    $user = authenticateToken();

    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Access denied. Sirf admin access kar sakta hai."]);
        exit;
    }

    return $user;
}

// Sirf specific role ko access dene ke liye middleware
function requireRole($role) {
    $user = authenticateToken();

    if ($user['role'] !== $role) {
        http_response_code(403);
        echo json_encode(["error" => "Access denied. Aapka role '$role' nahi hai."]);
        exit;
    }

    return $user;
}
?>
