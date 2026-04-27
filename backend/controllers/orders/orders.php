<?php
// Orders API - GET (fetch all/single), PUT (update status)
// Admin can see all orders, customer can see own orders
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Authentication required
$loggedInUser = authenticateToken();

$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $requestUri);
$orderId = isset($uri[3]) ? $uri[3] : null;
$action = isset($uri[4]) ? $uri[4] : null; // /orders/5/status

try {
    switch ($method) {

        // ===== GET - Orders fetch karna =====
        case 'GET':
            if ($orderId && is_numeric($orderId)) {
                // Single order fetch with items
                $query = "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o 
                          JOIN users u ON o.user_id = u.id WHERE o.id = :oid";
                
                // Non-admin sirf apne orders dekh sakta hai
                if ($loggedInUser['role'] !== 'admin') {
                    $query .= " AND o.user_id = :uid";
                }

                $stmt = $conn->prepare($query);
                $stmt->bindParam(':oid', $orderId, PDO::PARAM_INT);
                if ($loggedInUser['role'] !== 'admin') {
                    $stmt->bindParam(':uid', $loggedInUser['user_id'], PDO::PARAM_INT);
                }
                $stmt->execute();
                $order = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$order) {
                    http_response_code(404);
                    echo json_encode(["error" => "Order nahi mila."]);
                    exit;
                }

                // Order items bhi fetch karna
                $itemsQuery = "SELECT * FROM order_items WHERE order_id = :oid";
                $itemsStmt = $conn->prepare($itemsQuery);
                $itemsStmt->bindParam(':oid', $orderId, PDO::PARAM_INT);
                $itemsStmt->execute();
                $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

                $order = formatOrder($order, $items);
                echo json_encode(["success" => true, "order" => $order]);

            } else {
                // All orders fetch
                if ($loggedInUser['role'] === 'admin') {
                    // Admin saare orders dekh sakta hai
                    $query = "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o 
                              JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC";
                    $stmt = $conn->prepare($query);
                } else {
                    // Customer sirf apne orders
                    $query = "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o 
                              JOIN users u ON o.user_id = u.id WHERE o.user_id = :uid ORDER BY o.created_at DESC";
                    $stmt = $conn->prepare($query);
                    $stmt->bindParam(':uid', $loggedInUser['user_id'], PDO::PARAM_INT);
                }
                $stmt->execute();
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Har order ke items bhi fetch karna
                $formattedOrders = [];
                foreach ($orders as $order) {
                    $itemsQuery = "SELECT * FROM order_items WHERE order_id = :oid";
                    $itemsStmt = $conn->prepare($itemsQuery);
                    $itemsStmt->bindParam(':oid', $order['id'], PDO::PARAM_INT);
                    $itemsStmt->execute();
                    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
                    $formattedOrders[] = formatOrder($order, $items);
                }

                echo json_encode(["success" => true, "orders" => $formattedOrders]);
            }
            break;

        // ===== PUT - Order status update karna (Admin Only or User Cancelling) =====
        case 'PUT':
            if (!$orderId) {
                http_response_code(400);
                echo json_encode(["error" => "Order ID URL me zaroori hai."]);
                exit;
            }

            $data = json_decode(file_get_contents("php://input"), true);

            if (empty($data['status'])) {
                http_response_code(400);
                echo json_encode(["error" => "Status required hai."]);
                exit;
            }

            $status = $data['status'];
            
            // Check current order ownership and status
            $checkQuery = "SELECT user_id, status FROM orders WHERE id = :id";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $orderId, PDO::PARAM_INT);
            $checkStmt->execute();
            $currentOrder = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$currentOrder) {
                http_response_code(404);
                echo json_encode(["error" => "Order nahi mila."]);
                exit;
            }

            // Role based logic
            if ($loggedInUser['role'] !== 'admin') {
                // Customer logic
                if ($currentOrder['user_id'] != $loggedInUser['user_id']) {
                    http_response_code(403);
                    echo json_encode(["error" => "Aap dusre ka order update nahi kar sakte."]);
                    exit;
                }
                
                // Customers can only cancel their own pending orders
                if ($status !== 'cancelled') {
                    http_response_code(403);
                    echo json_encode(["error" => "Aap sirf order cancel kar sakte hain."]);
                    exit;
                }
                if ($currentOrder['status'] !== 'pending') {
                    http_response_code(400);
                    echo json_encode(["error" => "Sirf pending orders cancel kiye ja sakte hain."]);
                    exit;
                }
            } else {
                // Admin logic
                $allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                if (!in_array($status, $allowedStatuses)) {
                    http_response_code(400);
                    echo json_encode(["error" => "Invalid status. Allowed: " . implode(', ', $allowedStatuses)]);
                    exit;
                }
            }

            // Transaction for updating status and potentially restoring stock
            $conn->beginTransaction();

            $updateQuery = "UPDATE orders SET status = :status WHERE id = :id";
            $stmt = $conn->prepare($updateQuery);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $orderId, PDO::PARAM_INT);
            $stmt->execute();

            // If order is cancelled, restore stock
            if ($status === 'cancelled' && $currentOrder['status'] !== 'cancelled') {
                $itemsQuery = "SELECT product_id, quantity FROM order_items WHERE order_id = :oid";
                $itemsStmt = $conn->prepare($itemsQuery);
                $itemsStmt->bindParam(':oid', $orderId, PDO::PARAM_INT);
                $itemsStmt->execute();
                $itemsToRestore = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

                $stockQuery = "UPDATE products SET stock_count = stock_count + :qty WHERE id = :pid";
                $stockStmt = $conn->prepare($stockQuery);
                
                foreach ($itemsToRestore as $itemToRestore) {
                    $stockStmt->bindParam(':qty', $itemToRestore['quantity'], PDO::PARAM_INT);
                    $stockStmt->bindParam(':pid', $itemToRestore['product_id'], PDO::PARAM_INT);
                    $stockStmt->execute();
                }
            }

            $conn->commit();

            // Updated order wapas fetch karna
            $fetchQuery = "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o 
                          JOIN users u ON o.user_id = u.id WHERE o.id = :oid";
            $fetchStmt = $conn->prepare($fetchQuery);
            $fetchStmt->bindParam(':oid', $orderId, PDO::PARAM_INT);
            $fetchStmt->execute();
            $order = $fetchStmt->fetch(PDO::FETCH_ASSOC);

            $itemsQuery = "SELECT * FROM order_items WHERE order_id = :oid";
            $itemsStmt = $conn->prepare($itemsQuery);
            $itemsStmt->bindParam(':oid', $orderId, PDO::PARAM_INT);
            $itemsStmt->execute();
            $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "message" => "Status updated.", "order" => formatOrder($order, $items)]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed."]);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Orders error: " . $e->getMessage()]);
}

// Helper - Order ko frontend format me convert karna
function formatOrder($order, $items) {
    $formattedItems = array_map(function($item) {
        return [
            "productId" => (int)$item['product_id'],
            "productName" => $item['product_name'],
            "productImage" => "",
            "quantity" => (int)$item['quantity'],
            "price" => (float)$item['unit_price'],
            "subtotal" => (float)$item['subtotal']
        ];
    }, $items);

    // Items ka subtotal calculate karna
    $subtotal = array_reduce($formattedItems, function($sum, $item) {
        return $sum + $item['subtotal'];
    }, 0);
    $shipping = $subtotal >= 150 ? 0 : 9.95;

    return [
        "id" => (string)$order['id'],
        "userId" => (int)$order['user_id'],
        "userName" => $order['user_name'],
        "userEmail" => $order['user_email'],
        "status" => $order['status'],
        "items" => $formattedItems,
        "subtotal" => (float)$subtotal,
        "shipping" => $shipping,
        "total" => (float)$order['total_amount'],
        "shippingAddress" => [
            "firstName" => explode(' ', $order['shipping_name'])[0],
            "lastName" => implode(' ', array_slice(explode(' ', $order['shipping_name']), 1)),
            "street" => $order['shipping_address'],
            "city" => $order['shipping_city'],
            "zip" => $order['shipping_zip'],
            "country" => "United Kingdom"
        ],
        "trackingNumber" => $order['tracking_number'],
        "createdAt" => $order['created_at']
    ];
}
?>
