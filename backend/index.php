<?php
// 1. CORS Headers (React Frontend se requests allow karne ke liye)
header("Access-Control-Allow-Origin: *"); // Production me '*' ki jagah frontend url e.g., 'http://localhost:3000' likhein
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Handle Preflight OPTIONS request (React/Axios automatically bhejta hai)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database include karna
require_once 'config/db.php';
$db = new Database();
$connection = $db->getConnection();

// 3. Request Parse karna robustly
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Base path remove karna e.g. /backend
$basePath = dirname($_SERVER['SCRIPT_NAME']);
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
}

// Remove leading slash aur index.php agar URL me hai
$requestUri = ltrim($requestUri, '/');
if (strpos($requestUri, 'index.php/') === 0) {
    $requestUri = substr($requestUri, 10);
} elseif ($requestUri === 'index.php') {
    $requestUri = '';
}

$uri = explode('/', $requestUri);

// Ab hamesha first segment endpoint hoga aur second id/action
$endpoint = isset($uri[0]) && $uri[0] !== '' ? $uri[0] : null;
$id = isset($uri[1]) ? $uri[1] : null;

// Payload get karna (POST/PUT ke liye)
$inputData = json_decode(file_get_contents("php://input"), true);

// 4. Main Router
switch ($endpoint) {

    // ===== AUTH ROUTES (Public) =====
    case 'auth':
        $action = $id;
        if ($action === 'register' && $method === 'POST') {
            require_once 'controllers/auth/register.php';
        } elseif ($action === 'login' && $method === 'POST') {
            require_once 'controllers/auth/login.php';
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Auth endpoint nahi mila. Use /auth/register or /auth/login"]);
        }
        break;

    // ===== USER PROFILE (Login required) =====
    case 'profile':
        require_once 'controllers/user/profile.php';
        break;

    // ===== PRODUCTS (GET = Public, POST/PUT/DELETE = Admin) =====
    case 'products':
        require_once 'controllers/products/products.php';
        break;

    // ===== CHECKOUT (Login required) =====
    case 'checkout':
        if ($method === 'POST') {
            require_once 'controllers/orders/checkout.php';
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Checkout sirf POST method se hoga."]);
        }
        break;

    // ===== ORDERS (Login required - admin sees all, customer sees own) =====
    case 'orders':
        require_once 'controllers/orders/orders.php';
        break;

    // ===== WISHLIST (Login required) =====
    case 'wishlist':
        require_once 'controllers/wishlist/wishlist.php';
        break;

    // ===== REVIEWS (GET = Public, POST = Login required) =====
    case 'reviews':
        require_once 'controllers/reviews/reviews.php';
        break;

    // ===== SITE SETTINGS (Public GET) =====
    case 'settings':
        require_once 'controllers/settings/site_settings.php';
        break;

    // ===== ADMIN ROUTES (Sirf admin token) =====
    case 'admin':
        $action = $id;
        switch ($action) {
            case 'dashboard':
                require_once 'controllers/admin/dashboard.php';
                break;
            case 'customers':
                require_once 'controllers/admin/customers.php';
                break;
            case 'coupons':
                require_once 'controllers/admin/coupons.php';
                break;
            case 'settings':
                require_once 'controllers/settings/site_settings.php';
                break;
            default:
                http_response_code(404);
                echo json_encode(["error" => "Admin endpoint nahi mila."]);
                break;
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found", "uri" => $uri]);
        break;
}
?>
