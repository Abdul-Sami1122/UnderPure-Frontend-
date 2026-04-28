import { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchOrders, updateOrderStatus } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  shipped: "text-[#d4a59a] bg-[#d4a59a]/10 border-[#d4a59a]/20",
  delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

// 3 Dummy Orders added for Mobile View testing
const DUMMY_ORDERS = [
  {
    id: "ord-8837a9f1",
    userEmail: "isabelle.m@email.com",
    items: [
      { productName: "Silk Balconette Bra", color: "Noir", size: "M", quantity: 1, price: 68, productImage: "https://images.unsplash.com/photo-1599839770015-53df36f312a8?w=150" },
      { productName: "Satin Sleep Chemise", color: "Ivory", size: "S", quantity: 1, price: 80, productImage: "https://images.unsplash.com/photo-1770294758971-44fa1eae61a3?w=150" }
    ],
    subtotal: 148,
    shipping: 0,
    total: 148,
    status: "pending",
    shippingAddress: { firstName: "Isabelle", lastName: "M", street: "10 Baker St", city: "London", zip: "W1U 3GA", country: "UK" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "ord-b29c48ea",
    userEmail: "camille.d@email.com",
    items: [
      { productName: "Vintage Lace Set", color: "Dusty Pink", size: "S", quantity: 2, price: 112, productImage: "https://images.unsplash.com/photo-1598719830738-32b91fa649be?w=150" }
    ],
    subtotal: 224,
    shipping: 0,
    total: 224,
    status: "processing",
    shippingAddress: { firstName: "Camille", lastName: "D", street: "5 Rue de Rivoli", city: "Paris", zip: "75001", country: "France" },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "ord-ff45012a",
    userEmail: "sophie.k@email.com",
    items: [
      { productName: "Everyday Brief", color: "Black", size: "L", quantity: 3, price: 22, productImage: "https://images.unsplash.com/photo-1547714062-4daa321e1d6f?w=150" }
    ],
    subtotal: 66,
    shipping: 9.95,
    total: 75.95,
    status: "delivered",
    shippingAddress: { firstName: "Sophie", lastName: "K", street: "28 5th Ave", city: "New York", zip: "10001", country: "USA" },
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  }
];

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
    setLoading(true);
    // API Call
    fetchOrders(token)
      .then((data) => {
        // Agar real data aaye toh wo show karein, warna Dummy Orders
        setOrders(data && data.length > 0 ? data : DUMMY_ORDERS);
      })
      .catch(() => {
        // API fail hone par lazmi Dummy Orders show honge
        setOrders(DUMMY_ORDERS);
      })
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (orderId, status) => {
    setUpdatingStatus(orderId);
    try {
      // Sirf UI me update kar rahe hain demo ke liye
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: status } : o))
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
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-3xl font-medium md:font-light text-[#f5f0ee]">
          Orders
        </h1>
        <p className="text-[#9a8f8c] text-sm md:text-xs font-['Montserrat'] mt-2 md:mt-1">
          {orders.length} total orders
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 md:mb-8">
        <div className="relative w-full sm:w-auto">
          <Search
            size={18} md:size={14}
            className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 text-[#9a8f8c]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or email…"
            className="bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-sm md:text-xs font-['Montserrat'] pl-12 md:pl-9 pr-4 py-3.5 md:py-2.5 outline-none placeholder-[#9a8f8c]/50 transition-colors w-full sm:w-64 md:w-60 rounded-sm md:rounded-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs md:text-[9px] tracking-[0.15em] md:tracking-[0.12em] uppercase font-['Montserrat'] px-4 py-2.5 md:px-3 md:py-2 border transition-colors rounded-sm md:rounded-none flex-grow sm:flex-grow-0 ${
                statusFilter === s
                  ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/10 md:bg-[#d4a59a]/5 font-semibold"
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
        <div className="space-y-4 md:space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 md:h-20 bg-[#141414] animate-pulse rounded-sm md:rounded-none" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[#d4a59a]/15 md:border-[#d4a59a]/10 p-12 text-center bg-[#0d0d0d] rounded-sm md:rounded-none">
          <p className="text-[#9a8f8c] text-sm font-['Montserrat']">
            No orders found
          </p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-3">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="border border-[#d4a59a]/15 md:border-[#d4a59a]/10 hover:border-[#d4a59a]/30 md:hover:border-[#d4a59a]/20 bg-[#0d0d0d] transition-colors rounded-sm md:rounded-none overflow-hidden shadow-sm md:shadow-none"
            >
              {/* Order row */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 md:px-5 md:py-4 cursor-pointer"
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )
                }
              >
                <div className="flex items-start sm:items-center gap-4">
                  <ChevronDown
                    size={20} md:size={14}
                    className={`text-[#9a8f8c] transition-transform flex-shrink-0 mt-1 sm:mt-0 ${
                      expandedOrder === order.id ? "rotate-180 text-[#d4a59a]" : ""
                    }`}
                  />
                  <div>
                    <p className="text-sm md:text-xs font-['Montserrat'] text-[#f5f0ee] font-semibold md:font-medium">
                      #{order.id.slice(-10).toUpperCase()}
                    </p>
                    <p className="text-xs md:text-[10px] text-[#9a8f8c] font-['Montserrat'] mt-1 md:mt-0">
                      {order.userEmail} <span className="hidden sm:inline">·</span> <br className="sm:hidden" />
                      <span className="text-[#9a8f8c]/60">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Right side: Price & Status */}
                <div className="flex items-center justify-between sm:justify-end gap-5 mt-4 sm:mt-0 pl-9 sm:pl-0 w-full sm:w-auto border-t border-[#d4a59a]/10 sm:border-0 pt-3 sm:pt-0">
                  <span className="text-base md:text-sm font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee]">
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
                      className={`text-xs md:text-[9px] tracking-[0.12em] uppercase font-['Montserrat'] font-bold md:font-semibold px-3 py-2 md:px-3 md:py-1.5 border outline-none bg-transparent cursor-pointer transition-colors appearance-none pr-8 md:pr-6 rounded-sm md:rounded-none ${
                        STATUS_STYLES[order.status] || STATUS_STYLES.pending
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-[#111] text-[#f5f0ee]">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    {/* Custom tiny arrow for select */}
                    <ChevronDown size={12} className="absolute right-2.5 md:right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
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
                    className="overflow-hidden bg-[#111]"
                  >
                    <div className="px-5 pb-6 border-t border-[#d4a59a]/15 pt-5 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                      
                      {/* Items */}
                      <div>
                        <p className="text-xs md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c] mb-4 md:mb-3">
                          Items
                        </p>
                        <div className="space-y-4 md:space-y-2">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 md:gap-3 bg-[#0a0a0a] md:bg-transparent p-3 md:p-0 rounded-sm md:rounded-none"
                            >
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-14 h-16 md:w-10 md:h-12 object-cover bg-[#1a1a1a] flex-shrink-0 rounded-sm md:rounded-none border border-[#d4a59a]/10"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-xs font-['Montserrat'] font-medium text-[#f5f0ee] truncate mb-1 md:mb-0">
                                  {item.productName}
                                </p>
                                <p className="text-xs md:text-[10px] text-[#9a8f8c] font-['Montserrat']">
                                  {item.color} · {item.size} <span className="text-[#f5f0ee] ml-1">× {item.quantity}</span>
                                </p>
                              </div>
                              <p className="text-sm md:text-xs font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee] flex-shrink-0">
                                £{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping */}
                      <div>
                        <p className="text-xs md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c] mb-4 md:mb-3">
                          Shipping Details
                        </p>
                        <div className="bg-[#0a0a0a] md:bg-transparent p-4 md:p-0 rounded-sm md:rounded-none border border-[#d4a59a]/10 md:border-none">
                          <p className="text-sm md:text-xs font-['Montserrat'] text-[#f5f0ee] font-semibold md:font-normal mb-1">
                            {order.shippingAddress.firstName}{" "}
                            {order.shippingAddress.lastName}
                          </p>
                          <p className="text-xs md:text-xs font-['Montserrat'] text-[#9a8f8c] mb-0.5">
                            {order.shippingAddress.street}
                          </p>
                          <p className="text-xs md:text-xs font-['Montserrat'] text-[#9a8f8c] mb-0.5">
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.zip}
                          </p>
                          <p className="text-xs md:text-xs font-['Montserrat'] text-[#9a8f8c]">
                            {order.shippingAddress.country}
                          </p>

                          <div className="mt-5 md:mt-4 pt-4 border-t border-[#d4a59a]/15 space-y-2 md:space-y-1">
                            <div className="flex justify-between text-sm md:text-xs font-['Montserrat']">
                              <span className="text-[#9a8f8c]">Subtotal</span>
                              <span className="text-[#f5f0ee]">£{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm md:text-xs font-['Montserrat']">
                              <span className="text-[#9a8f8c]">Shipping</span>
                              <span className="text-[#f5f0ee]">
                                {order.shipping === 0 ? "Free" : `£${order.shipping.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="flex justify-between text-base md:text-sm font-['Montserrat'] font-bold md:font-semibold pt-2 md:pt-1 mt-1 md:mt-0">
                              <span className="text-[#f5f0ee]">Total</span>
                              <span className="text-[#d4a59a]">£{order.total.toFixed(2)}</span>
                            </div>
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