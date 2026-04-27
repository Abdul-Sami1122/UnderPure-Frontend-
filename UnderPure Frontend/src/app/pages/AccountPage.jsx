import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { motion } from "motion/react";
import {
  Package,
  Heart,
  User,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { fetchOrders, fetchWishlist, fetchProducts } from "../lib/api";
import { ProductCard } from "../components/shop/ProductCard";
import { toast } from "sonner";
import { MOCK_PRODUCTS } from "../lib/mockData";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "profile", label: "Profile", icon: User },
];

const STATUS_META = {
  pending: { label: "Pending", color: "text-yellow-400", icon: Clock },
  processing: { label: "Processing", color: "text-blue-400", icon: Clock },
  shipped: { label: "Shipped", color: "text-[#d4a59a]", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-400", icon: XCircle },
};

export function AccountPage() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState(tab || "orders");
  const [orders, setOrders] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: "/account" } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    Promise.all([
      fetchOrders(token).catch(() => []),
      fetchWishlist(token).catch(() => []),
      fetchProducts().catch(() => MOCK_PRODUCTS),
    ])
      .then(([o, w, p]) => {
        setOrders(o);
        setWishlistIds(w);
        setAllProducts(p);
        setWishlistProducts(p.filter((prod) => w.includes(prod.id)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, token]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    navigate(`/account/${id}`);
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-0 mb-8 sm:mb-10 md:mb-14">
          <div>
            <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-['Montserrat'] mb-1.5 sm:mb-2">
              My Account
            </p>
            <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-light text-[#f5f0ee]">
              Welcome, {user.name.split(" ")[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {user.isAdmin && (
              <Link
                to="/admin"
                className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#d4a59a] border border-[#d4a59a]/30 px-3 py-2 hover:bg-[#d4a59a]/10 transition-colors text-center flex-1 sm:flex-none"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] border border-[#9a8f8c]/20 sm:border-transparent px-3 py-2 sm:px-0 sm:py-0 hover:text-[#d4a59a] transition-colors flex-1 sm:flex-none"
            >
              <LogOut size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={1.5} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] gap-6 md:gap-10 lg:gap-14">
          {/* Sidebar / Top Tabs */}
          <div className="overflow-x-auto pb-2 md:pb-0 scrollbar-hide md:overflow-visible border-b border-[#d4a59a]/10 md:border-b-0 mb-4 md:mb-0">
            <nav className="flex md:flex-col gap-2 md:gap-1 min-w-max md:min-w-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs tracking-[0.15em] uppercase font-['Montserrat'] transition-colors md:text-left ${activeTab === t.id
                      ? "bg-[#d4a59a]/10 text-[#d4a59a] border-b-2 md:border-b-0 md:border-l-2 border-[#d4a59a]"
                      : "text-[#9a8f8c] hover:text-[#f5f0ee] border-b-2 md:border-b-0 md:border-l-2 border-transparent"
                    }`}
                >
                  <t.icon size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={1.5} />
                  {t.label}
                  {t.id === "orders" && orders.length > 0 && (
                    <span className="ml-1.5 md:ml-auto text-[8px] sm:text-[9px] bg-[#d4a59a]/20 text-[#d4a59a] px-1.5 py-0.5 font-semibold">
                      {orders.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {/* ===== ORDERS ===== */}
            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee] mb-5 sm:mb-7">Order History</h2>
                {loading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 sm:h-28 bg-[#141414] animate-pulse rounded-sm" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 sm:py-20 border border-[#d4a59a]/10 px-4">
                    <ShoppingBag size={32} strokeWidth={1} className="text-[#d4a59a]/30 mx-auto mb-3 sm:mb-4 sm:w-[36px] sm:h-[36px]" />
                    <p className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee]/50 mb-2">No orders yet</p>
                    <p className="text-[10px] sm:text-xs text-[#9a8f8c] font-['Montserrat'] mb-6 sm:mb-8">Your order history will appear here</p>
                    <Link to="/shop" className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#d4a59a] border border-[#d4a59a]/30 px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-[#d4a59a]/10 transition-colors inline-block">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {orders.map((order) => {
                      const meta = STATUS_META[order.status] || STATUS_META.pending;
                      const StatusIcon = meta.icon;
                      return (
                        <div key={order.id} className="border border-[#d4a59a]/10 p-4 sm:p-5 md:p-6 hover:border-[#d4a59a]/25 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 border-b border-[#d4a59a]/10 pb-3 sm:border-none sm:pb-0">
                            <div>
                              <p className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-[9px] sm:text-[10px] font-['Montserrat'] text-[#9a8f8c]">
                                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 self-start bg-[#111] px-2 py-1 rounded-sm border border-[#d4a59a]/5">
                              <StatusIcon size={10} className={`${meta.color} sm:w-[12px] sm:h-[12px]`} />
                              <span className={`text-[8px] sm:text-[10px] tracking-[0.1em] uppercase font-['Montserrat'] font-semibold ${meta.color}`}>{meta.label}</span>
                            </div>
                          </div>
                          <div className="space-y-2 mb-3 sm:mb-4">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-xs font-['Montserrat'] gap-1 sm:gap-0">
                                <span className="text-[#9a8f8c] truncate pr-2">{item.productName} <span className="hidden sm:inline">· {item.size} · {item.color}</span> × {item.quantity}</span>
                                <span className="text-[#f5f0ee]">£{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-[#d4a59a]/10">
                            <span className="text-[9px] sm:text-[10px] tracking-[0.1em] uppercase font-['Montserrat'] text-[#9a8f8c]">Total</span>
                            <span className="text-xs sm:text-sm font-['Montserrat'] text-[#f5f0ee]">£{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== WISHLIST ===== */}
            {activeTab === "wishlist" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee] mb-5 sm:mb-7">My Wishlist</h2>
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="aspect-[3/4] bg-[#141414] animate-pulse rounded-sm" />)}
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="text-center py-16 sm:py-20 border border-[#d4a59a]/10 px-4">
                    <Heart size={32} strokeWidth={1} className="text-[#d4a59a]/30 mx-auto mb-3 sm:mb-4 sm:w-[36px] sm:h-[36px]" />
                    <p className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee]/50 mb-2">No saved pieces</p>
                    <p className="text-[10px] sm:text-xs text-[#9a8f8c] font-['Montserrat'] mb-6 sm:mb-8">Save pieces you love by tapping the heart</p>
                    <Link to="/shop" className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#d4a59a] border border-[#d4a59a]/30 px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-[#d4a59a]/10 transition-colors inline-block">Explore Collections</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {wishlistProducts.map((p) => (
                      <ProductCard
                        key={p.id} product={p} wishlistedIds={wishlistIds}
                        onWishlistChange={(ids) => { setWishlistIds(ids); setWishlistProducts(allProducts.filter((prod) => ids.includes(prod.id))); }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== PROFILE ===== */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee] mb-5 sm:mb-7">My Profile</h2>
                <div className="border border-[#d4a59a]/10 p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5 max-w-lg">
                  {[
                    { label: "Full Name", value: user.name },
                    { label: "Email Address", value: user.email },
                    { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) },
                    { label: "Account Type", value: user.isAdmin ? "Administrator" : "Member" },
                  ].map((row) => (
                    <div key={row.label} className="flex flex-col gap-1 pb-4 sm:pb-5 border-b border-[#d4a59a]/10 last:border-0 last:pb-0">
                      <p className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">{row.label}</p>
                      <p className="text-xs sm:text-sm font-['Montserrat'] text-[#f5f0ee] break-all sm:break-normal">{row.value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-6 sm:mt-8 flex items-center justify-center sm:justify-start gap-2 text-[10px] sm:text-xs tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors border border-[#d4a59a]/20 px-6 py-2.5 sm:py-3 hover:border-[#d4a59a]/50 w-full sm:w-auto"
                >
                  <LogOut size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={1.5} /> Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}