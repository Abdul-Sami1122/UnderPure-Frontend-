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

// 3. Request Parse karna
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $requestUri);

// Endpoint parsing - adjust this based on how you serve the folder
// Example: If URL is localhost/backend/index.php/users or localhost/backend/users (via .htaccess)
// Adjust the array index depending on your path depth
$endpoint = isset($uri[2]) ? $uri[2] : null; 
$id = isset($uri[3]) ? $uri[3] : null;

// Payload get karna (POST/PUT ke liye)
$inputData = json_decode(file_get_contents("php://input"), true);

// 4. Basic Router
switch ($endpoint) {

    // ===== AUTH ROUTES (Public - koi bhi access kar sakta hai) =====
    case 'auth':
        $action = $id; // $id me actually 'register' ya 'login' aayega
        if ($action === 'register' && $method === 'POST') {
            require_once 'controllers/auth/register.php';
        } elseif ($action === 'login' && $method === 'POST') {
            require_once 'controllers/auth/login.php';
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Auth endpoint nahi mila. Use /auth/register or /auth/login"]);
        }
        break;

    // ===== PROTECTED ROUTE EXAMPLE - Token required =====
    case 'profile':
        require_once 'middleware/auth.php';
        $user = authenticateToken(); // Yeh token verify karega
        if ($method === 'GET') {
            echo json_encode(["success" => true, "user" => $user]);
        }
        break;

    // ===== USERS ROUTES =====
    case 'users':
        if ($method === 'GET') {
            if ($id) {
                echo json_encode(["message" => "Fetch User with ID: " . $id]);
            } else {
                echo json_encode(["message" => "Fetch all Users"]);
            }
        } elseif ($method === 'POST') {
            echo json_encode(["message" => "Create new User", "data" => $inputData]);
        } elseif ($method === 'PUT') {
            echo json_encode(["message" => "Update User with ID: " . $id]);
        } elseif ($method === 'DELETE') {
            echo json_encode(["message" => "Delete User with ID: " . $id]);
        }
        break;

    // ===== PRODUCTS ROUTES =====
    case 'products':
        if ($method === 'GET') {
            echo json_encode(["message" => "Fetch all Products"]);
        }
        break;

    // ===== ORDERS / CHECKOUT ROUTES =====
    case 'checkout':
        if ($method === 'POST') {
            require_once 'controllers/orders/checkout.php';
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Checkout sirf POST method se hoga."]);
        }
        break;

    case 'orders':
        if ($method === 'GET') {
            echo json_encode(["message" => "Fetch all Orders"]);
        } elseif ($method === 'POST') {
            echo json_encode(["message" => "Order Created", "data" => $inputData]);
        }
        break;

    // ===== ADMIN ROUTES (Sirf admin token wale access kar sakte hain) =====
    case 'admin':
        $action = $id; // /backend/admin/dashboard, /admin/customers, /admin/coupons, /admin/settings
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
                // Admin settings update bhi isi controller se hoga (PUT method)
                require_once 'controllers/settings/site_settings.php';
                break;
            default:
                http_response_code(404);
                echo json_encode(["error" => "Admin endpoint nahi mila. Use /admin/dashboard, /admin/customers, /admin/coupons, or /admin/settings"]);
                break;
        }
        break;

    // ===== WISHLIST ROUTES (Login required) =====
    case 'wishlist':
        require_once 'controllers/wishlist/wishlist.php';
        break;

    // ===== REVIEWS ROUTES =====
    case 'reviews':
        require_once 'controllers/reviews/reviews.php';
        break;

    // ===== SITE SETTINGS (Public GET - frontend fetch karega) =====
    case 'settings':
        require_once 'controllers/settings/site_settings.php';
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found", "uri" => $uri]);
        break;
}
?>
