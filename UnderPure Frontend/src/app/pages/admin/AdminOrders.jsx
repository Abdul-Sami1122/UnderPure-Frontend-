import { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchOrders, updateOrderStatus } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  shipped: "text-[#d4a59a] bg-[#d4a59a]/10 border-[#d4a59a]/20",
  delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

export function AdminOrders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    if (!token) return;
    setLoading(true);
    fetchOrders(token)
      .then(setOrders)
      .catch(() => {
        // Fallback to empty array when API fails
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (orderId, status) => {
    if (!token) return;
    setUpdatingStatus(orderId);
    try {
      const updated = await updateOrderStatus(token, orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee]">
          Orders
        </h1>
        <p className="text-[#9a8f8c] text-xs font-['Montserrat'] mt-1">
          {orders.length} total orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8f8c]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or email…"
            className="bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-xs font-['Montserrat'] pl-8 pr-4 py-2.5 outline-none placeholder-[#9a8f8c]/50 transition-colors w-60"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[9px] tracking-[0.12em] uppercase font-['Montserrat'] px-3 py-2 border transition-colors ${statusFilter === s
                  ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/5"
                  : "border-[#d4a59a]/15 text-[#9a8f8c] hover:text-[#f5f0ee] hover:border-[#d4a59a]/30"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-[#141414] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[#d4a59a]/10 p-12 text-center">
          <p className="text-[#9a8f8c] text-sm font-['Montserrat']">
            No orders found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="border border-[#d4a59a]/10 hover:border-[#d4a59a]/20 transition-colors"
            >
              {/* Order row */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )
                }
              >
                <div className="flex items-center gap-4">
                  <ChevronDown
                    size={14}
                    className={`text-[#9a8f8c] transition-transform flex-shrink-0 ${expandedOrder === order.id ? "rotate-180" : ""
                      }`}
                  />
                  <div>
                    <p className="text-xs font-['Montserrat'] text-[#f5f0ee] font-medium">
                      #{order.id.slice(-10).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-[#9a8f8c] font-['Montserrat']">
                      {order.userEmail} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-sm font-['Montserrat'] text-[#f5f0ee]">
                    £{order.total.toFixed(2)}
                  </span>
                  {/* Status dropdown */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={order.status}
                      disabled={updatingStatus === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`text-[9px] tracking-[0.12em] uppercase font-['Montserrat'] font-semibold px-3 py-1.5 border outline-none bg-transparent cursor-pointer transition-colors appearance-none pr-6 ${STATUS_STYLES[order.status] || STATUS_STYLES.pending
                        }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-[#111] text-[#f5f0ee]">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-[#d4a59a]/10 pt-4 grid md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-3">
                          Items
                        </p>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3"
                            >
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-10 h-12 object-cover bg-[#1a1a1a] flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-['Montserrat'] text-[#f5f0ee] truncate">
                                  {item.productName}
                                </p>
                                <p className="text-[10px] text-[#9a8f8c] font-['Montserrat']">
                                  {item.color} · {item.size} × {item.quantity}
                                </p>
                              </div>
                              <p className="text-xs font-['Montserrat'] text-[#f5f0ee] flex-shrink-0">
                                £{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping */}
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-3">
                          Shipping Address
                        </p>
                        <p className="text-xs font-['Montserrat'] text-[#f5f0ee]">
                          {order.shippingAddress.firstName}{" "}
                          {order.shippingAddress.lastName}
                        </p>
                        <p className="text-xs font-['Montserrat'] text-[#9a8f8c]">
                          {order.shippingAddress.street}
                        </p>
                        <p className="text-xs font-['Montserrat'] text-[#9a8f8c]">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.zip}
                        </p>
                        <p className="text-xs font-['Montserrat'] text-[#9a8f8c]">
                          {order.shippingAddress.country}
                        </p>
                        <div className="mt-4 pt-4 border-t border-[#d4a59a]/10 space-y-1">
                          <div className="flex justify-between text-xs font-['Montserrat']">
                            <span className="text-[#9a8f8c]">Subtotal</span>
                            <span className="text-[#f5f0ee]">£{order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-['Montserrat']">
                            <span className="text-[#9a8f8c]">Shipping</span>
                            <span className="text-[#f5f0ee]">
                              {order.shipping === 0 ? "Free" : `£${order.shipping.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-['Montserrat'] font-semibold pt-1">
                            <span className="text-[#f5f0ee]">Total</span>
                            <span className="text-[#d4a59a]">£{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}