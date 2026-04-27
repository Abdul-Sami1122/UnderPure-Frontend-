<?php
// Simple JWT Helper Class - bina kisi external library ke
// Yeh class JWT token generate aur verify karti hai
require_once __DIR__ . '/../config/jwt_secret.php';

class JwtHelper {

    // Base64 URL encode (standard base64 se thoda different hota hai)
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    // Base64 URL decode
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    // JWT Token Generate karna
    public static function generateToken($payload) {
        // Header - algorithm aur type define karta hai
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);

        // Payload me issued at aur expiry time add karna
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        $payloadJson = json_encode($payload);

        // Header aur Payload ko Base64 URL encode karna
        $base64Header = self::base64UrlEncode($header);
        $base64Payload = self::base64UrlEncode($payloadJson);

        // Signature banana - HMAC SHA256 se
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $base64Signature = self::base64UrlEncode($signature);

        // Final JWT Token = header.payload.signature
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    // JWT Token Verify karna
    public static function verifyToken($token) {
        // Token ko 3 parts me split karna
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null; // Invalid format
        }

        list($base64Header, $base64Payload, $base64Signature) = $parts;

        // Signature verify karna - dobara generate karke compare karein
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $expectedSignature = self::base64UrlEncode($signature);

        if (!hash_equals($expectedSignature, $base64Signature)) {
            return null; // Signature match nahi hua - tampered token
        }

        // Payload decode karna
        $payload = json_decode(self::base64UrlDecode($base64Payload), true);

        // Expiry check karna
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Token expire ho gaya
        }

        return $payload; // Sab theek hai, payload return karo
    }
}
?>
