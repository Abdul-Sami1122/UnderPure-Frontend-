<?php
// Admin Dashboard Analytics API - sirf admin access kar sakta hai
// Total revenue, total orders, total customers, recent orders return karta hai
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Admin check - sirf admin role wala token hi access kar sakta hai
$admin = requireAdmin();

// Sirf GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Sirf GET method allowed hai."]);
    exit;
}

// Database connection
$db = new Database();
$conn = $db->getConnection();

try {
    // 1. Total Revenue - saare completed/delivered orders ki total amount
    $revenueQuery = "SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status NOT IN ('cancelled')";
    $revenueStmt = $conn->prepare($revenueQuery);
    $revenueStmt->execute();
    $totalRevenue = $revenueStmt->fetch(PDO::FETCH_ASSOC)['total_revenue'];

    // 2. Total Orders count
    $ordersQuery = "SELECT COUNT(*) as total_orders FROM orders";
    $ordersStmt = $conn->prepare($ordersQuery);
    $ordersStmt->execute();
    $totalOrders = $ordersStmt->fetch(PDO::FETCH_ASSOC)['total_orders'];

    // 3. Total Customers count (sirf customer role wale)
    $customersQuery = "SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'";
    $customersStmt = $conn->prepare($customersQuery);
    $customersStmt->execute();
    $totalCustomers = $customersStmt->fetch(PDO::FETCH_ASSOC)['total_customers'];

    // 4. Orders by Status - har status kitne orders hain
    $statusQuery = "SELECT status, COUNT(*) as count FROM orders GROUP BY status";
    $statusStmt = $conn->prepare($statusQuery);
    $statusStmt->execute();
    $ordersByStatus = $statusStmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Today's Revenue
    $todayQuery = "SELECT COALESCE(SUM(total_amount), 0) as today_revenue FROM orders WHERE DATE(created_at) = CURDATE() AND status NOT IN ('cancelled')";
    $todayStmt = $conn->prepare($todayQuery);
    $todayStmt->execute();
    $todayRevenue = $todayStmt->fetch(PDO::FETCH_ASSOC)['today_revenue'];

    // 6. Today's Orders count
    $todayOrdersQuery = "SELECT COUNT(*) as today_orders FROM orders WHERE DATE(created_at) = CURDATE()";
    $todayOrdersStmt = $conn->prepare($todayOrdersQuery);
    $todayOrdersStmt->execute();
    $todayOrders = $todayOrdersStmt->fetch(PDO::FETCH_ASSOC)['today_orders'];

    // 7. Recent 10 Orders (latest)
    $recentQuery = "SELECT o.id, o.total_amount, o.status, o.shipping_name, o.shipping_city, o.tracking_number, o.created_at 
                    FROM orders o ORDER BY o.created_at DESC LIMIT 10";
    $recentStmt = $conn->prepare($recentQuery);
    $recentStmt->execute();
    $recentOrders = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

    // 8. Monthly Revenue (last 6 months)
    $monthlyQuery = "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COALESCE(SUM(total_amount), 0) as revenue 
                     FROM orders WHERE status NOT IN ('cancelled') 
                     GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
                     ORDER BY month DESC LIMIT 6";
    $monthlyStmt = $conn->prepare($monthlyQuery);
    $monthlyStmt->execute();
    $monthlyRevenue = $monthlyStmt->fetchAll(PDO::FETCH_ASSOC);

    // Response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "dashboard" => [
            "total_revenue"    => (float)$totalRevenue,
            "today_revenue"    => (float)$todayRevenue,
            "total_orders"     => (int)$totalOrders,
            "today_orders"     => (int)$todayOrders,
            "total_customers"  => (int)$totalCustomers,
            "orders_by_status" => $ordersByStatus,
            "monthly_revenue"  => $monthlyRevenue,
            "recent_orders"    => $recentOrders
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Dashboard data nahi mil saka: " . $e->getMessage()]);
}
?>
