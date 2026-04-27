<?php
// Coupons/Promotions API - admin discount codes create aur manage kar sakta hai
// GET = list all, POST = create, PUT = update, DELETE = delete
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Admin check
$admin = requireAdmin();

// Database connection
$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// URL se coupon ID lena (agar hai toh)
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $requestUri);
$couponId = isset($uri[4]) ? (int)$uri[4] : null; // /backend/admin/coupons/5

try {
    switch ($method) {

        // ===== GET - Saare coupons list karna =====
        case 'GET':
            if ($couponId) {
                // Single coupon fetch
                $query = "SELECT * FROM coupons WHERE id = :id";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id', $couponId, PDO::PARAM_INT);
                $stmt->execute();
                $coupon = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$coupon) {
                    http_response_code(404);
                    echo json_encode(["error" => "Coupon nahi mila."]);
                    exit;
                }

                echo json_encode(["success" => true, "coupon" => $coupon]);
            } else {
                // All coupons fetch
                $query = "SELECT * FROM coupons ORDER BY created_at DESC";
                $stmt = $conn->prepare($query);
                $stmt->execute();
                $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(["success" => true, "coupons" => $coupons]);
            }
            break;

        // ===== POST - Naya coupon/discount code create karna =====
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);

            // Validation
            if (empty($data['code']) || empty($data['discount_type']) || !isset($data['discount_value'])) {
                http_response_code(400);
                echo json_encode(["error" => "Code, discount_type aur discount_value required hain."]);
                exit;
            }

            $code = strtoupper(trim($data['code'])); // Code always uppercase
            $discountType = $data['discount_type'];
            $discountValue = (float)$data['discount_value'];
            $minOrderAmount = isset($data['min_order_amount']) ? (float)$data['min_order_amount'] : 0;
            $maxUses = isset($data['max_uses']) ? (int)$data['max_uses'] : null;
            $expiresAt = isset($data['expires_at']) ? $data['expires_at'] : null;

            // Discount type validate karna
            if (!in_array($discountType, ['percentage', 'fixed'])) {
                http_response_code(400);
                echo json_encode(["error" => "Discount type sirf 'percentage' ya 'fixed' ho sakta hai."]);
                exit;
            }

            // Percentage 100 se zyada nahi hona chahiye
            if ($discountType === 'percentage' && ($discountValue <= 0 || $discountValue > 100)) {
                http_response_code(400);
                echo json_encode(["error" => "Percentage discount 1 se 100 ke beech hona chahiye."]);
                exit;
            }

            // Duplicate code check
            $checkQuery = "SELECT id FROM coupons WHERE code = :code";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bindParam(':code', $code);
            $checkStmt->execute();

            if ($checkStmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(["error" => "Yeh coupon code '$code' already exist karta hai."]);
                exit;
            }

            // Insert coupon
            $query = "INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, expires_at) 
                      VALUES (:code, :type, :value, :min_amount, :max_uses, :expires)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':code', $code);
            $stmt->bindParam(':type', $discountType);
            $stmt->bindParam(':value', $discountValue);
            $stmt->bindParam(':min_amount', $minOrderAmount);
            $stmt->bindParam(':max_uses', $maxUses, PDO::PARAM_INT);
            $stmt->bindParam(':expires', $expiresAt);
            $stmt->execute();

            $newId = $conn->lastInsertId();

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Coupon '$code' create ho gaya.",
                "coupon" => [
                    "id" => (int)$newId,
                    "code" => $code,
                    "discount_type" => $discountType,
                    "discount_value" => $discountValue,
                    "min_order_amount" => $minOrderAmount,
                    "max_uses" => $maxUses,
                    "expires_at" => $expiresAt
                ]
            ]);
            break;

        // ===== PUT - Existing coupon update karna =====
        case 'PUT':
            if (!$couponId) {
                http_response_code(400);
                echo json_encode(["error" => "Coupon ID URL me deni zaroori hai. e.g., /admin/coupons/5"]);
                exit;
            }

            $data = json_decode(file_get_contents("php://input"), true);

            // Check coupon exists
            $checkQuery = "SELECT * FROM coupons WHERE id = :id";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $couponId, PDO::PARAM_INT);
            $checkStmt->execute();

            if ($checkStmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["error" => "Coupon nahi mila."]);
                exit;
            }

            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

            // Jo fields bheje hain woh update karo, baki purane rahein
            $code = isset($data['code']) ? strtoupper(trim($data['code'])) : $existing['code'];
            $discountType = isset($data['discount_type']) ? $data['discount_type'] : $existing['discount_type'];
            $discountValue = isset($data['discount_value']) ? (float)$data['discount_value'] : $existing['discount_value'];
            $minOrderAmount = isset($data['min_order_amount']) ? (float)$data['min_order_amount'] : $existing['min_order_amount'];
            $maxUses = isset($data['max_uses']) ? (int)$data['max_uses'] : $existing['max_uses'];
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : $existing['is_active'];
            $expiresAt = isset($data['expires_at']) ? $data['expires_at'] : $existing['expires_at'];

            $updateQuery = "UPDATE coupons SET code = :code, discount_type = :type, discount_value = :value, 
                           min_order_amount = :min_amount, max_uses = :max_uses, is_active = :active, expires_at = :expires 
                           WHERE id = :id";
            $stmt = $conn->prepare($updateQuery);
            $stmt->bindParam(':code', $code);
            $stmt->bindParam(':type', $discountType);
            $stmt->bindParam(':value', $discountValue);
            $stmt->bindParam(':min_amount', $minOrderAmount);
            $stmt->bindParam(':max_uses', $maxUses, PDO::PARAM_INT);
            $stmt->bindParam(':active', $isActive, PDO::PARAM_INT);
            $stmt->bindParam(':expires', $expiresAt);
            $stmt->bindParam(':id', $couponId, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode([
                "success" => true,
                "message" => "Coupon '$code' update ho gaya."
            ]);
            break;

        // ===== DELETE - Coupon delete karna =====
        case 'DELETE':
            if (!$couponId) {
                http_response_code(400);
                echo json_encode(["error" => "Coupon ID URL me deni zaroori hai."]);
                exit;
            }

            $deleteQuery = "DELETE FROM coupons WHERE id = :id";
            $stmt = $conn->prepare($deleteQuery);
            $stmt->bindParam(':id', $couponId, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Coupon delete ho gaya."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Coupon nahi mila ya pehle se delete hai."]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed."]);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Coupons error: " . $e->getMessage()]);
}
?>
