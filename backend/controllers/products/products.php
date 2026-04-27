<?php
// Products API - GET (all/single/filter), POST (create), PUT (update), DELETE
// GET = public, POST/PUT/DELETE = admin only
require_once __DIR__ . '/../../config/db.php';

$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// URL se product ID ya slug lena
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $requestUri);
$productIdOrSlug = isset($uri[3]) ? $uri[3] : null;

try {
    switch ($method) {

        // ===== GET - Products fetch karna (Public) =====
        case 'GET':
            if ($productIdOrSlug) {
                // Single product fetch (by ID ya slug)
                if (is_numeric($productIdOrSlug)) {
                    $query = "SELECT * FROM products WHERE id = :val";
                } else {
                    $query = "SELECT * FROM products WHERE slug = :val";
                }
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':val', $productIdOrSlug);
                $stmt->execute();
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    http_response_code(404);
                    echo json_encode(["error" => "Product not found"]);
                    exit;
                }

                // JSON fields decode karna
                $product = formatProduct($product);
                echo json_encode(["success" => true, "product" => $product]);

            } else {
                // All products fetch with filters
                $category = isset($_GET['category']) ? trim($_GET['category']) : null;
                $featured = isset($_GET['featured']) ? $_GET['featured'] : null;
                $search = isset($_GET['search']) ? trim($_GET['search']) : null;

                $query = "SELECT * FROM products WHERE 1=1";
                $params = [];

                if ($category && $category !== 'all') {
                    $query .= " AND category = :category";
                    $params[':category'] = $category;
                }
                if ($featured === 'true' || $featured === '1') {
                    $query .= " AND featured = 1";
                }
                if ($search) {
                    $query .= " AND (name LIKE :search OR description LIKE :search2)";
                    $params[':search'] = "%$search%";
                    $params[':search2'] = "%$search%";
                }

                $query .= " ORDER BY created_at DESC";

                $stmt = $conn->prepare($query);
                $stmt->execute($params);
                $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Har product ke JSON fields decode karna
                $products = array_map('formatProduct', $products);

                echo json_encode(["success" => true, "products" => $products]);
            }
            break;

        // ===== POST - Naya product create karna (Admin Only) =====
        case 'POST':
            require_once __DIR__ . '/../../middleware/auth.php';
            $admin = requireAdmin();

            $data = json_decode(file_get_contents("php://input"), true);

            if (empty($data['name']) || !isset($data['price'])) {
                http_response_code(400);
                echo json_encode(["error" => "Name aur price required hain."]);
                exit;
            }

            $name = trim($data['name']);
            $slug = isset($data['slug']) ? trim($data['slug']) : strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
            $category = isset($data['category']) ? trim($data['category']) : 'bras';
            $description = isset($data['description']) ? trim($data['description']) : null;
            $longDescription = isset($data['longDescription']) ? trim($data['longDescription']) : null;
            $price = (float)$data['price'];
            $originalPrice = isset($data['originalPrice']) ? (float)$data['originalPrice'] : null;
            $image = isset($data['image']) ? trim($data['image']) : null;
            $images = isset($data['images']) ? json_encode($data['images']) : null;
            $sizes = isset($data['sizes']) ? json_encode($data['sizes']) : null;
            $colors = isset($data['colors']) ? json_encode($data['colors']) : null;
            $badge = isset($data['badge']) ? $data['badge'] : null;
            $featured = isset($data['featured']) ? (int)$data['featured'] : 0;
            $inStock = isset($data['inStock']) ? (int)$data['inStock'] : 1;
            $stockCount = isset($data['stockCount']) ? (int)$data['stockCount'] : 0;

            $query = "INSERT INTO products (name, slug, category, description, long_description, price, original_price, image, images, sizes, colors, badge, featured, in_stock, stock_count) 
                      VALUES (:name, :slug, :category, :desc, :long_desc, :price, :orig_price, :image, :images, :sizes, :colors, :badge, :featured, :in_stock, :stock_count)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':slug', $slug);
            $stmt->bindParam(':category', $category);
            $stmt->bindParam(':desc', $description);
            $stmt->bindParam(':long_desc', $longDescription);
            $stmt->bindParam(':price', $price);
            $stmt->bindParam(':orig_price', $originalPrice);
            $stmt->bindParam(':image', $image);
            $stmt->bindParam(':images', $images);
            $stmt->bindParam(':sizes', $sizes);
            $stmt->bindParam(':colors', $colors);
            $stmt->bindParam(':badge', $badge);
            $stmt->bindParam(':featured', $featured, PDO::PARAM_INT);
            $stmt->bindParam(':in_stock', $inStock, PDO::PARAM_INT);
            $stmt->bindParam(':stock_count', $stockCount, PDO::PARAM_INT);
            $stmt->execute();

            $newId = $conn->lastInsertId();

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Product created.",
                "product" => [
                    "id" => (int)$newId,
                    "name" => $name,
                    "slug" => $slug,
                    "price" => $price
                ]
            ]);
            break;

        // ===== PUT - Product update karna (Admin Only) =====
        case 'PUT':
            require_once __DIR__ . '/../../middleware/auth.php';
            $admin = requireAdmin();

            if (!$productIdOrSlug) {
                http_response_code(400);
                echo json_encode(["error" => "Product ID URL me deni zaroori hai."]);
                exit;
            }

            $data = json_decode(file_get_contents("php://input"), true);

            // Existing product check
            $checkQuery = "SELECT * FROM products WHERE id = :id";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $productIdOrSlug, PDO::PARAM_INT);
            $checkStmt->execute();
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$existing) {
                http_response_code(404);
                echo json_encode(["error" => "Product nahi mila."]);
                exit;
            }

            // Jo fields bheje hain woh update, baki purane
            $name = isset($data['name']) ? trim($data['name']) : $existing['name'];
            $slug = isset($data['slug']) ? trim($data['slug']) : $existing['slug'];
            $category = isset($data['category']) ? trim($data['category']) : $existing['category'];
            $description = isset($data['description']) ? trim($data['description']) : $existing['description'];
            $longDescription = isset($data['longDescription']) ? trim($data['longDescription']) : $existing['long_description'];
            $price = isset($data['price']) ? (float)$data['price'] : $existing['price'];
            $originalPrice = array_key_exists('originalPrice', $data) ? ($data['originalPrice'] ? (float)$data['originalPrice'] : null) : $existing['original_price'];
            $image = isset($data['image']) ? trim($data['image']) : $existing['image'];
            $images = isset($data['images']) ? json_encode($data['images']) : $existing['images'];
            $sizes = isset($data['sizes']) ? json_encode($data['sizes']) : $existing['sizes'];
            $colors = isset($data['colors']) ? json_encode($data['colors']) : $existing['colors'];
            $badge = array_key_exists('badge', $data) ? $data['badge'] : $existing['badge'];
            $featured = isset($data['featured']) ? (int)$data['featured'] : $existing['featured'];
            $inStock = isset($data['inStock']) ? (int)$data['inStock'] : $existing['in_stock'];
            $stockCount = isset($data['stockCount']) ? (int)$data['stockCount'] : $existing['stock_count'];

            $updateQuery = "UPDATE products SET name=:name, slug=:slug, category=:category, description=:desc, long_description=:long_desc, 
                           price=:price, original_price=:orig_price, image=:image, images=:images, sizes=:sizes, colors=:colors, 
                           badge=:badge, featured=:featured, in_stock=:in_stock, stock_count=:stock_count WHERE id=:id";
            $stmt = $conn->prepare($updateQuery);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':slug', $slug);
            $stmt->bindParam(':category', $category);
            $stmt->bindParam(':desc', $description);
            $stmt->bindParam(':long_desc', $longDescription);
            $stmt->bindParam(':price', $price);
            $stmt->bindParam(':orig_price', $originalPrice);
            $stmt->bindParam(':image', $image);
            $stmt->bindParam(':images', $images);
            $stmt->bindParam(':sizes', $sizes);
            $stmt->bindParam(':colors', $colors);
            $stmt->bindParam(':badge', $badge);
            $stmt->bindParam(':featured', $featured, PDO::PARAM_INT);
            $stmt->bindParam(':in_stock', $inStock, PDO::PARAM_INT);
            $stmt->bindParam(':stock_count', $stockCount, PDO::PARAM_INT);
            $stmt->bindParam(':id', $productIdOrSlug, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode(["success" => true, "message" => "Product updated."]);
            break;

        // ===== DELETE - Product delete karna (Admin Only) =====
        case 'DELETE':
            require_once __DIR__ . '/../../middleware/auth.php';
            $admin = requireAdmin();

            if (!$productIdOrSlug) {
                http_response_code(400);
                echo json_encode(["error" => "Product ID URL me deni zaroori hai."]);
                exit;
            }

            $deleteQuery = "DELETE FROM products WHERE id = :id";
            $stmt = $conn->prepare($deleteQuery);
            $stmt->bindParam(':id', $productIdOrSlug, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Product delete ho gaya."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Product nahi mila."]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed."]);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Products error: " . $e->getMessage()]);
}

// Helper function - DB row ko frontend format me convert karna
function formatProduct($row) {
    return [
        "id" => (int)$row['id'],
        "name" => $row['name'],
        "slug" => $row['slug'],
        "category" => $row['category'],
        "description" => $row['description'],
        "longDescription" => $row['long_description'],
        "price" => (float)$row['price'],
        "originalPrice" => $row['original_price'] ? (float)$row['original_price'] : null,
        "image" => $row['image'],
        "images" => json_decode($row['images'], true) ?: [],
        "sizes" => json_decode($row['sizes'], true) ?: [],
        "colors" => json_decode($row['colors'], true) ?: [],
        "badge" => $row['badge'],
        "featured" => (bool)$row['featured'],
        "inStock" => (bool)$row['in_stock'],
        "stockCount" => (int)$row['stock_count'],
        "rating" => (float)$row['rating'],
        "reviewCount" => (int)$row['review_count'],
        "createdAt" => $row['created_at']
    ];
}
?>
