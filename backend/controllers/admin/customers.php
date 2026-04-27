<?php
// Customers API - sirf admin registered users ki list dekh sakta hai
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Admin check
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
    // Search/filter support (optional query params)
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;
    $role = isset($_GET['role']) ? trim($_GET['role']) : null;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // Base query - password nahi bhejenge response me
    $query = "SELECT id, name, email, phone, role, created_at FROM users WHERE 1=1";
    $countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    $params = [];

    // Search filter (name ya email se search)
    if ($search) {
        $query .= " AND (name LIKE :search OR email LIKE :search2 OR phone LIKE :search3)";
        $countQuery .= " AND (name LIKE :search OR email LIKE :search2 OR phone LIKE :search3)";
        $params[':search'] = "%$search%";
        $params[':search2'] = "%$search%";
        $params[':search3'] = "%$search%";
    }

    // Role filter
    if ($role && in_array($role, ['admin', 'customer'])) {
        $query .= " AND role = :role";
        $countQuery .= " AND role = :role";
        $params[':role'] = $role;
    }

    // Total count (pagination ke liye)
    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute($params);
    $totalCustomers = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Users fetch karna with pagination
    $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
    $stmt = $conn->prepare($query);

    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Har customer ke sath uski total orders aur total spend bhi bhejo
    foreach ($customers as &$customer) {
        $statsQuery = "SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_spent 
                       FROM orders WHERE user_id = :uid AND status NOT IN ('cancelled')";
        $statsStmt = $conn->prepare($statsQuery);
        $statsStmt->bindParam(':uid', $customer['id'], PDO::PARAM_INT);
        $statsStmt->execute();
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

        $customer['total_orders'] = (int)$stats['total_orders'];
        $customer['total_spent'] = (float)$stats['total_spent'];
    }

    // Response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "customers" => $customers,
        "pagination" => [
            "current_page" => $page,
            "per_page" => $limit,
            "total" => (int)$totalCustomers,
            "total_pages" => ceil($totalCustomers / $limit)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Customers list nahi mil saki: " . $e->getMessage()]);
}
?>
