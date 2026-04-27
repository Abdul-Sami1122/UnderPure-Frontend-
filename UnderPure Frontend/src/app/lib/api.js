import { MOCK_PRODUCTS } from "./mockData";

// Local state to act as a fake database (No Supabase needed)
let localProducts = [...MOCK_PRODUCTS];
let localOrders = [];
let localWishlist = [];

const fakeUser = {
  id: "admin-123",
  name: "Admin User",
  email: "admin@underpure.com",
  isAdmin: true,
  createdAt: new Date().toISOString(),
};

// Artificial delay to feel like a real database
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ===== PRODUCTS =====
export async function fetchProducts(params) {
  await delay(400);
  let res = [...localProducts];
  if (params?.category && params.category !== "all") {
    res = res.filter((p) => p.category === params.category);
  }
  if (params?.featured) {
    res = res.filter((p) => p.featured);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    res = res.filter((p) => p.name.toLowerCase().includes(q));
  }
  return res;
}

export async function fetchProduct(idOrSlug) {
  await delay(300);
  const prod = localProducts.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug,
  );
  if (!prod) throw new Error("Product not found");
  return prod;
}

export async function createProduct(token, data) {
  await delay(500);
  const newProd = {
    ...data,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  localProducts.unshift(newProd); // Add to top
  return newProd;
}

export async function updateProduct(token, id, data) {
  await delay(500);
  const idx = localProducts.findIndex((p) => p.id === id);
  if (idx > -1) {
    localProducts[idx] = { ...localProducts[idx], ...data };
    return localProducts[idx];
  }
  throw new Error("Product not found");
}

export async function deleteProduct(token, id) {
  await delay(500);
  localProducts = localProducts.filter((p) => p.id !== id);
  return true;
}

// ===== AUTH =====
export async function register(email, password, name) {
  await delay(600);
  return {
    user: {
      id: `u-${Date.now()}`,
      email,
      name,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    },
    token: "fake-jwt-token",
  };
}

export async function login(email, password) {
  await delay(600);
  // Agar admin ka word ho email mein, to Admin login warna normal
  if (email.toLowerCase().includes("admin")) {
    return { user: fakeUser, token: "admin-jwt-token" };
  }
  return {
    user: {
      id: "u-normal",
      email,
      name: "Customer",
      isAdmin: false,
      createdAt: new Date().toISOString(),
    },
    token: "user-jwt-token",
  };
}

export async function getMe(token) {
  await delay(300);
  return token === "admin-jwt-token"
    ? fakeUser
    : {
        id: "u-normal",
        email: "user@test.com",
        name: "Customer",
        isAdmin: false,
      };
}

// ===== ORDERS =====
export async function fetchOrders(token) {
  await delay(400);
  return localOrders;
}

export async function createOrder(token, data) {
  await delay(600);
  const newOrder = {
    id: `ord-${Date.now()}`,
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  localOrders.unshift(newOrder);
  return newOrder;
}

export async function updateOrderStatus(token, id, status) {
  await delay(400);
  const idx = localOrders.findIndex((o) => o.id === id);
  if (idx > -1) {
    localOrders[idx].status = status;
    return localOrders[idx];
  }
  throw new Error("Order not found");
}

// ===== WISHLIST =====
export async function fetchWishlist(token) {
  await delay(300);
  return localWishlist;
}

export async function addToWishlist(token, productId) {
  await delay(300);
  if (!localWishlist.includes(productId)) {
    localWishlist.push(productId);
  }
  return localWishlist;
}

export async function removeFromWishlist(token, productId) {
  await delay(300);
  localWishlist = localWishlist.filter((id) => id !== productId);
  return localWishlist;
}
