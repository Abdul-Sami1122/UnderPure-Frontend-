// Real Backend API calls - connects to PHP backend
const API_BASE = "http://localhost/backend/index.php";

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  };

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    // Auto-logout if token is invalid or expired
    if (res.status === 401) {
      import("../store/authStore").then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/auth" && window.location.pathname !== "/") {
            window.location.href = "/auth";
        }
      });
    }
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// Auth header helper
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// ===== PRODUCTS =====
export async function fetchProducts(params) {
  const queryParts = [];
  if (params?.category && params.category !== "all")
    queryParts.push(`category=${params.category}`);
  if (params?.featured) queryParts.push("featured=true");
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  const query = queryParts.length ? `?${queryParts.join("&")}` : "";

  const data = await apiCall(`/products${query}`);
  return data.products || [];
}

export async function fetchProduct(idOrSlug) {
  const data = await apiCall(`/products/${idOrSlug}`);
  return data.product;
}

export async function createProduct(token, productData) {
  const data = await apiCall("/products", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(productData),
  });
  return data.product;
}

export async function updateProduct(token, id, productData) {
  const data = await apiCall(`/products/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(productData),
  });
  return data;
}

export async function deleteProduct(token, id) {
  await apiCall(`/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return true;
}

// ===== AUTH =====
export async function register(email, password, name) {
  const data = await apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return { user: data.user, token: data.token };
}

export async function login(email, password) {
  const data = await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return { user: data.user, token: data.token };
}

export async function getMe(token) {
  const data = await apiCall("/profile", {
    headers: authHeaders(token),
  });
  return data.user;
}

// ===== ORDERS =====
export async function fetchOrders(token) {
  const data = await apiCall("/orders", {
    headers: authHeaders(token),
  });
  return data.orders || [];
}

export async function createOrder(token, orderData) {
  // Frontend sends: { items, subtotal, shipping, total, shippingAddress, paymentMethod }
  // Backend expects: { cart_items, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip }
  const addr = orderData.shippingAddress;
  const cartItems = orderData.items.map((i) => ({
    product_id: i.productId,
    product_name: i.productName,
    quantity: i.quantity,
    price: i.price,
  }));

  const data = await apiCall("/checkout", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      cart_items: cartItems,
      shipping_name: `${addr.firstName} ${addr.lastName}`.trim(),
      shipping_phone: addr.phone || "",
      shipping_address: addr.street,
      shipping_city: addr.city,
      shipping_zip: addr.zip,
    }),
  });

  // Return in frontend format
  return {
    id: String(data.order?.order_id || Date.now()),
    ...orderData,
    status: data.order?.status || "pending",
    createdAt: new Date().toISOString(),
  };
}

export async function updateOrderStatus(token, id, status) {
  const data = await apiCall(`/orders/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  return data.order;
}

// ===== WISHLIST =====
export async function fetchWishlist(token) {
  const data = await apiCall("/wishlist", {
    headers: authHeaders(token),
  });
  // Frontend expects array of product IDs
  return (data.wishlist || []).map((item) => item.product_id);
}

export async function addToWishlist(token, productId) {
  await apiCall("/wishlist", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ product_id: productId }),
  });
  // Return updated wishlist
  return fetchWishlist(token);
}

export async function removeFromWishlist(token, productId) {
  await apiCall(`/wishlist/${productId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return fetchWishlist(token);
}
