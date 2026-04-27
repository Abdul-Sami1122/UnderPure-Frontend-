<?php
// PostEx Courier Service Helper
// Yeh class PostEx ki API se order book karta hai aur tracking number wapas deta hai
require_once __DIR__ . '/../config/postex.php';

class PostExHelper {

    // ===== 1. PostEx par Order Book karna =====
    // Order successfully save hone ke baad yeh function call hoga
    public static function createShipment($orderData) {
        $url = POSTEX_BASE_URL . '/order/create';

        // PostEx ke liye order items ki description banana
        $itemsDescription = '';
        if (isset($orderData['items']) && is_array($orderData['items'])) {
            $itemNames = [];
            foreach ($orderData['items'] as $item) {
                $itemNames[] = $item['product_name'] . ' x' . $item['quantity'];
            }
            $itemsDescription = implode(', ', $itemNames);
        }

        // PostEx API ke required fields
        $postData = [
            'orderRefNumber'  => 'ORD-' . $orderData['order_id'],   // Apna internal order ID
            'customerName'    => $orderData['shipping_name'],
            'customerPhone'   => $orderData['shipping_phone'],       // Format: 03xxxxxxxxx
            'customerAddress' => $orderData['shipping_address'],
            'cityName'        => $orderData['shipping_city'],
            'orderAmount'     => (float)$orderData['total_amount'],  // COD amount
            'orderDetail'     => $itemsDescription,                  // Items ki description
            'orderType'       => 'Normal',                           // Normal delivery
        ];

        // cURL se PostEx API ko call karna
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($postData),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . POSTEX_API_TOKEN,   // PostEx token header me jayega
            ],
            CURLOPT_TIMEOUT        => 30,   // 30 second timeout
            CURLOPT_SSL_VERIFYPEER => true,  // SSL verify karna (production me true rakhein)
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // cURL error check
        if ($curlError) {
            return [
                'success' => false,
                'error'   => 'cURL Error: ' . $curlError
            ];
        }

        // Response decode karna
        $responseData = json_decode($response, true);

        // HTTP status aur response check karna
        if ($httpCode === 200 && isset($responseData['dist']['trackingNumber'])) {
            return [
                'success'         => true,
                'tracking_number' => $responseData['dist']['trackingNumber'],
                'postex_response' => $responseData
            ];
        } else {
            return [
                'success'  => false,
                'error'    => isset($responseData['message']) ? $responseData['message'] : 'PostEx API Error',
                'http_code' => $httpCode,
                'response' => $responseData
            ];
        }
    }

    // ===== 2. Tracking Number se Order ka Status Check karna =====
    public static function trackShipment($trackingNumber) {
        $url = POSTEX_BASE_URL . '/order/track/' . $trackingNumber;

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPGET        => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . POSTEX_API_TOKEN,
            ],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return [
                'success' => false,
                'error'   => 'cURL Error: ' . $curlError
            ];
        }

        $responseData = json_decode($response, true);

        if ($httpCode === 200) {
            return [
                'success'  => true,
                'tracking' => $responseData
            ];
        } else {
            return [
                'success'  => false,
                'error'    => isset($responseData['message']) ? $responseData['message'] : 'Tracking Error',
                'response' => $responseData
            ];
        }
    }

    // ===== 3. Tracking Number Database me Save karna =====
    public static function saveTrackingToOrder($conn, $orderId, $trackingNumber) {
        $query = "UPDATE orders SET tracking_number = :tracking, courier_status = 'booked', status = 'processing' WHERE id = :order_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':tracking', $trackingNumber);
        $stmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
?>
