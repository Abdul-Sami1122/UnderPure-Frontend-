<?php
// Checkout API - cart items, shipping address leke order place karna
// PDO Transaction use hoga taake orders + order_items dono consistent rahein
// Order save hone ke baad PostEx courier API call hogi
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../helpers/PostExHelper.php';

// 1. User authentication - token verify karna (sirf logged-in users order de sakte hain)
$loggedInUser = authenticateToken();

// 2. Sirf POST method allow hai
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Sirf POST method allowed hai."]);
    exit;
}

// 3. Input data lena
$data = json_decode(file_get_contents("php://input"), true);

// 4. Validation - zaroori fields check karna
if (empty($data['cart_items']) || !is_array($data['cart_items'])) {
    http_response_code(400);
    echo json_encode(["error" => "Cart items required hain."]);
    exit;
}

if (empty($data['shipping_name']) || empty($data['shipping_phone']) || 
    empty($data['shipping_address']) || empty($data['shipping_city'])) {
    http_response_code(400);
    echo json_encode(["error" => "Shipping details (name, phone, address, city) required hain."]);
    exit;
}

// Cart items ko validate karna - har item me product_id, quantity, price hona chahiye
foreach ($data['cart_items'] as $index => $item) {
    if (empty($item['product_id']) || empty($item['quantity']) || !isset($item['price'])) {
        http_response_code(400);
        echo json_encode(["error" => "Cart item #" . ($index + 1) . " me product_id, quantity aur price required hain."]);
        exit;
    }
    if ($item['quantity'] < 1) {
        http_response_code(400);
        echo json_encode(["error" => "Cart item #" . ($index + 1) . " ki quantity 1 se kam nahi ho sakti."]);
        exit;
    }
}

// 5. Variables ready karna
$userId = $loggedInUser['user_id'];
$cartItems = $data['cart_items'];
$shippingName = trim($data['shipping_name']);
$shippingPhone = trim($data['shipping_phone']);
$shippingAddress = trim($data['shipping_address']);
$shippingCity = trim($data['shipping_city']);
$shippingZip = isset($data['shipping_zip']) ? trim($data['shipping_zip']) : null;

// Total amount calculate karna (backend par verify karna, frontend par trust mat karo)
$totalAmount = 0;
foreach ($cartItems as $item) {
    $totalAmount += $item['price'] * $item['quantity'];
}

// Database connection
$db = new Database();
$conn = $db->getConnection();

// 6. ===== TRANSACTION START =====
// Transaction ka matlab: agar orders ya order_items me se koi bhi query fail ho,
// toh poora data rollback ho jayega. Aadha data kabhi insert nahi hoga.
try {
    $conn->beginTransaction();

    // Step A: Order insert karna
    $orderQuery = "INSERT INTO orders (user_id, total_amount, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip, status)
                   VALUES (:user_id, :total_amount, :shipping_name, :shipping_phone, :shipping_address, :shipping_city, :shipping_zip, 'pending')";
    
    $orderStmt = $conn->prepare($orderQuery);
    $orderStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $orderStmt->bindParam(':total_amount', $totalAmount);
    $orderStmt->bindParam(':shipping_name', $shippingName);
    $orderStmt->bindParam(':shipping_phone', $shippingPhone);
    $orderStmt->bindParam(':shipping_address', $shippingAddress);
    $orderStmt->bindParam(':shipping_city', $shippingCity);
    $orderStmt->bindParam(':shipping_zip', $shippingZip);
    $orderStmt->execute();

    // Naya order ka ID lena
    $orderId = $conn->lastInsertId();

    // Step B: Har cart item ko order_items me insert karna
    $itemQuery = "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
                  VALUES (:order_id, :product_id, :product_name, :quantity, :unit_price, :subtotal)";
    $itemStmt = $conn->prepare($itemQuery);

    $orderItemsList = []; // Response ke liye items list

    foreach ($cartItems as $item) {
        $productId = $item['product_id'];
        $productName = isset($item['product_name']) ? $item['product_name'] : 'Product #' . $productId;
        $quantity = (int)$item['quantity'];
        $unitPrice = (float)$item['price'];
        $subtotal = $unitPrice * $quantity;

        $itemStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
        $itemStmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
        $itemStmt->bindParam(':product_name', $productName);
        $itemStmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
        $itemStmt->bindParam(':unit_price', $unitPrice);
        $itemStmt->bindParam(':subtotal', $subtotal);
        $itemStmt->execute();

        // Step C: Product stock update karna
        $stockQuery = "UPDATE products SET stock_count = stock_count - :qty WHERE id = :pid AND stock_count >= :qty";
        $stockStmt = $conn->prepare($stockQuery);
        $stockStmt->bindParam(':qty', $quantity, PDO::PARAM_INT);
        $stockStmt->bindParam(':pid', $productId, PDO::PARAM_INT);
        $stockStmt->execute();

        // Agar stock kam tha toh rollback
        if ($stockStmt->rowCount() === 0) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode([
                "error" => "Product '$productName' ka stock available nahi hai ya quantity zyada hai."
            ]);
            exit;
        }

        $orderItemsList[] = [
            "product_id" => $productId,
            "product_name" => $productName,
            "quantity" => $quantity,
            "unit_price" => $unitPrice,
            "subtotal" => $subtotal
        ];
    }

    // Sab kuch theek raha toh COMMIT karo
    $conn->commit();

    // ===== 7. POST EX COURIER API CALL =====
    // Order database me save ho chuka hai, ab PostEx ko shipment book karna hai
    $postExData = [
        'order_id'         => $orderId,
        'shipping_name'    => $shippingName,
        'shipping_phone'   => $shippingPhone,
        'shipping_address' => $shippingAddress,
        'shipping_city'    => $shippingCity,
        'total_amount'     => $totalAmount,
        'items'            => $orderItemsList
    ];

    $postExResult = PostExHelper::createShipment($postExData);

    $trackingNumber = null;
    $courierMessage = null;

    if ($postExResult['success']) {
        // PostEx se tracking number mila - database me save karo
        $trackingNumber = $postExResult['tracking_number'];
        PostExHelper::saveTrackingToOrder($conn, $orderId, $trackingNumber);
        $courierMessage = "PostEx shipment booked. Tracking: " . $trackingNumber;
    } else {
        // PostEx call fail hua - order toh save hai, courier baad me retry kar sakte hain
        $courierMessage = "Order saved, lekin PostEx booking fail: " . ($postExResult['error'] ?? 'Unknown error');
    }

    // 8. Success response bhejna
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Order successfully place ho gaya!",
        "courier" => $courierMessage,
        "order" => [
            "order_id" => (int)$orderId,
            "total_amount" => $totalAmount,
            "tracking_number" => $trackingNumber,
            "status" => $trackingNumber ? "processing" : "pending",
            "shipping" => [
                "name" => $shippingName,
                "phone" => $shippingPhone,
                "address" => $shippingAddress,
                "city" => $shippingCity,
                "zip" => $shippingZip
            ],
            "items" => $orderItemsList
        ]
    ]);

} catch (PDOException $e) {
    // Koi bhi error aaye toh rollback karo
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Order place nahi ho saka: " . $e->getMessage()]);
}
?>
