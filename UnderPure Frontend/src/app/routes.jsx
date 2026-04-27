import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { Root } from "./components/layout/Root";

// Standard Resilient Loader
const load = (factory) => lazy(() => 
  factory().then(module => ({ default: module.default || Object.values(module)[0] }))
);

const HomePage = load(() => import("./pages/HomePage"));
const ShopPage = load(() => import("./pages/ShopPage"));
const ProductDetailPage = load(() => import("./pages/ProductDetailPage"));
const AuthPage = load(() => import("./pages/AuthPage"));
const AccountPage = load(() => import("./pages/AccountPage"));
const CheckoutPage = load(() => import("./pages/CheckoutPage"));
const NotFoundPage = load(() => import("./pages/NotFoundPage"));

// Admin
const AdminLayout = load(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = load(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = load(() => import("./pages/admin/AdminProducts"));
const AdminOrders = load(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = load(() => import("./pages/admin/AdminCustomers"));
const AdminAnalytics = load(() => import("./pages/admin/AdminAnalytics"));
const AdminContent = load(() => import("./pages/admin/AdminContent"));
const AdminSettings = load(() => import("./pages/admin/AdminSettings"));
const AdminPromotions = load(() => import("./pages/admin/AdminPromotions"));

const withSuspense = (Component) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-[#d4a59a]">Loading...</div>}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: "shop", element: withSuspense(ShopPage) },
      { path: "product/:slug", element: withSuspense(ProductDetailPage) },
      { path: "auth", element: withSuspense(AuthPage) },
      { path: "account", element: withSuspense(AccountPage) },
      { path: "account/:tab", element: withSuspense(AccountPage) },
      { path: "checkout", element: withSuspense(CheckoutPage) },
      {
        path: "admin",
        element: withSuspense(AdminLayout),
        children: [
          { index: true, element: withSuspense(AdminDashboard) },
          { path: "products", element: withSuspense(AdminProducts) },
          { path: "orders", element: withSuspense(AdminOrders) },
          { path: "customers", element: withSuspense(AdminCustomers) },
          { path: "analytics", element: withSuspense(AdminAnalytics) },
          { path: "content", element: withSuspense(AdminContent) },
          { path: "settings", element: withSuspense(AdminSettings) },
          { path: "promotions", element: withSuspense(AdminPromotions) },
        ],
      },
      { path: "*", element: withSuspense(NotFoundPage) },
    ],
  },
]);