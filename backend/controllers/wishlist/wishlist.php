<?php
// Wishlist API - user apne pasand ke products save/remove kar sakta hai
// GET = wishlist items, POST = add to wishlist, DELETE = remove from wishlist
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// User authentication - logged-in user hi wishlist access kar sakta hai
$loggedInUser = authenticateToken();
$userId = $loggedInUser['user_id'];

// Database connection
$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// URL se product ID lena (DELETE ke liye)
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $requestUri);
$productIdFromUrl = isset($uri[3]) ? (int)$uri[3] : null;

try {
    switch ($method) {

        // ===== GET - User ki wishlist items fetch karna =====
        case 'GET':
            $query = "SELECT w.id as wishlist_id, w.product_id, w.created_at as added_at,
                             p.name, p.description, p.price, p.stock
                      FROM wishlist w
                      JOIN products p ON w.product_id = p.id
                      WHERE w.user_id = :user_id
                      ORDER BY w.created_at DESC";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "wishlist" => $items,
                "total" => count($items)
            ]);
            break;

        // ===== POST - Product wishlist me add karna =====
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);

            if (empty($data['product_id'])) {
                http_response_code(400);
                echo json_encode(["error" => "product_id required hai."]);
                exit;
            }

            $productId = (int)$data['product_id'];

            // Check product exist karta hai ya nahi
            $checkProduct = "SELECT id FROM products WHERE id = :pid";
            $checkStmt = $conn->prepare($checkProduct);
            $checkStmt->bindParam(':pid', $productId, PDO::PARAM_INT);
            $checkStmt->execute();

            if ($checkStmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["error" => "Product nahi mila."]);
                exit;
            }

            // Check already wishlist me toh nahi hai
            $checkWishlist = "SELECT id FROM wishlist WHERE user_id = :uid AND product_id = :pid";
            $checkWStmt = $conn->prepare($checkWishlist);
            $checkWStmt->bindParam(':uid', $userId, PDO::PARAM_INT);
            $checkWStmt->bindParam(':pid', $productId, PDO::PARAM_INT);
            $checkWStmt->execute();

            if ($checkWStmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(["error" => "Yeh product already wishlist me hai."]);
                exit;
            }

            // Wishlist me add karna
            $insertQuery = "INSERT INTO wishlist (user_id, product_id) VALUES (:uid, :pid)";
            $insertStmt = $conn->prepare($insertQuery);
            $insertStmt->bindParam(':uid', $userId, PDO::PARAM_INT);
            $insertStmt->bindParam(':pid', $productId, PDO::PARAM_INT);
            $insertStmt->execute();

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Product wishlist me add ho gaya."
            ]);
            break;

        // ===== DELETE - Product wishlist se remove karna =====
        case 'DELETE':
            if (!$productIdFromUrl) {
                http_response_code(400);
                echo json_encode(["error" => "Product ID URL me deni zaroori hai. e.g., /wishlist/5"]);
                exit;
            }

            $deleteQuery = "DELETE FROM wishlist WHERE user_id = :uid AND product_id = :pid";
            $deleteStmt = $conn->prepare($deleteQuery);
            $deleteStmt->bindParam(':uid', $userId, PDO::PARAM_INT);
            $deleteStmt->bindParam(':pid', $productIdFromUrl, PDO::PARAM_INT);
            $deleteStmt->execute();

            if ($deleteStmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Product wishlist se remove ho gaya."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Yeh product wishlist me nahi tha."]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed."]);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Wishlist error: " . $e->getMessage()]);
}
?>
