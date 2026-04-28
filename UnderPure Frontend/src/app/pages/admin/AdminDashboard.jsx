import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuthStore } from "../../store/authStore";

// ── Mock data (used when Supabase is not connected) ───────────────────────────
const MOCK_REVENUE = [
  { week: "27 Jan", revenue: 1240, orders: 8 },
  { week: "3 Feb", revenue: 1890, orders: 12 },
  { week: "10 Feb", revenue: 1450, orders: 9 },
  { week: "17 Feb", revenue: 2340, orders: 16 },
  { week: "24 Feb", revenue: 2100, orders: 14 },
  { week: "3 Mar", revenue: 2780, orders: 19 },
  { week: "10 Mar", revenue: 3120, orders: 22 },
  { week: "17 Mar", revenue: 2870, orders: 18 },
  { week: "24 Mar", revenue: 3450, orders: 24 },
  { week: "31 Mar", revenue: 3890, orders: 27 },
  { week: "7 Apr", revenue: 4230, orders: 30 },
  { week: "14 Apr", revenue: 4680, orders: 33 },
];

const MOCK_STATUS = [
  { name: "Delivered", value: 68, color: "#4ade80" },
  { name: "Processing", value: 15, color: "#60a5fa" },
  { name: "Shipped", value: 10, color: "#d4a59a" },
  { name: "Pending", value: 5, color: "#facc15" },
  { name: "Cancelled", value: 2, color: "#f87171" },
];

const MOCK_STATS = {
  totalProducts: 10,
  totalOrders: 236,
  revenue: 34218.5,
  pendingOrders: 12,
  totalCustomers: 184,
  revenueChange: 18.4,
  ordersChange: 12.1,
  customersChange: 9.3,
  recentOrders: [],
};

const MOCK_ORDERS = [
  {
    id: "ord-0001aabbcc",
    userId: "u1",
    userEmail: "isabelle.m@email.com",
    items: [],
    subtotal: 148,
    shipping: 0,
    total: 148,
    status: "delivered",
    shippingAddress: {
      firstName: "Isabelle",
      lastName: "M",
      street: "10 Baker St",
      city: "London",
      state: "",
      zip: "W1U 3GA",
      country: "UK",
    },
    paymentMethod: "card",
    createdAt: "2026-04-18T11:22:00Z",
    updatedAt: "2026-04-18T11:22:00Z",
  },
  {
    id: "ord-0002ccddee",
    userId: "u2",
    userEmail: "camille.d@email.com",
    items: [],
    subtotal: 224,
    shipping: 0,
    total: 224,
    status: "processing",
    shippingAddress: {
      firstName: "Camille",
      lastName: "D",
      street: "5 Rue de Rivoli",
      city: "Paris",
      state: "",
      zip: "75001",
      country: "France",
    },
    paymentMethod: "card",
    createdAt: "2026-04-20T09:14:00Z",
    updatedAt: "2026-04-20T09:14:00Z",
  },
  {
    id: "ord-0003eeffgg",
    userId: "u3",
    userEmail: "sophie.k@email.com",
    items: [],
    subtotal: 89,
    shipping: 9,
    total: 98,
    status: "shipped",
    shippingAddress: {
      firstName: "Sophie",
      lastName: "K",
      street: "28 5th Ave",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
    paymentMethod: "card",
    createdAt: "2026-04-21T14:55:00Z",
    updatedAt: "2026-04-21T14:55:00Z",
  },
  {
    id: "ord-0004hhiijj",
    userId: "u4",
    userEmail: "amara.t@email.com",
    items: [],
    subtotal: 312,
    shipping: 0,
    total: 312,
    status: "pending",
    shippingAddress: {
      firstName: "Amara",
      lastName: "T",
      street: "Al Wasl Rd",
      city: "Dubai",
      state: "",
      zip: "00000",
      country: "UAE",
    },
    paymentMethod: "card",
    createdAt: "2026-04-22T07:30:00Z",
    updatedAt: "2026-04-22T07:30:00Z",
  },
  {
    id: "ord-0005kkllmm",
    userId: "u5",
    userEmail: "elena.v@email.com",
    items: [],
    subtotal: 175,
    shipping: 0,
    total: 175,
    status: "delivered",
    shippingAddress: {
      firstName: "Elena",
      lastName: "V",
      street: "Via Montenapoleone",
      city: "Milan",
      state: "",
      zip: "20121",
      country: "Italy",
    },
    paymentMethod: "card",
    createdAt: "2026-04-17T16:40:00Z",
    updatedAt: "2026-04-17T16:40:00Z",
  },
];

const STATUS_COLORS = {
  pending: "text-yellow-400 bg-yellow-400/10",
  processing: "text-blue-400 bg-blue-400/10",
  shipped: "text-[#d4a59a] bg-[#d4a59a]/10",
  delivered: "text-green-400 bg-green-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111] border border-[#d4a59a]/20 px-4 py-3 text-sm md:text-xs font-['Montserrat'] shadow-xl">
        <p className="text-[#9a8f8c] mb-1">{label}</p>
        <p className="text-[#d4a59a] font-semibold text-lg md:text-sm">
          £{payload[0]?.value?.toLocaleString()}
        </p>
        <p className="text-[#f5f0ee]">{payload[1]?.value} orders</p>
      </div>
    );
  }
  return null;
};

export function AdminDashboard() {
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, isDemoAdmin } = useAuthStore();

  useEffect(() => {
    // Static mode: Simulate network loading, then use MOCK_STATS
    const loadDashboard = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 600)); // Fake delay
        setLiveStats(MOCK_STATS);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token, isDemoAdmin]);

  const stats = liveStats || MOCK_STATS;
  const recentOrders = (
    liveStats?.recentOrders?.length ? liveStats.recentOrders : MOCK_ORDERS
  ).slice(0, 5);

  const STAT_CARDS = [
    {
      label: "Total Revenue",
      value: `£${stats.revenue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      change: stats.revenueChange ?? 18.4,
      link: "/admin/analytics",
      color: "text-[#d4a59a]",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      change: stats.ordersChange ?? 12.1,
      link: "/admin/orders",
      color: "text-blue-400",
    },
    {
      label: "Products",
      value: stats.totalProducts,
      icon: Package,
      change: null,
      link: "/admin/products",
      color: "text-emerald-400",
    },
    {
      label: "Customers",
      value: stats.totalCustomers ?? 184,
      icon: Users,
      change: stats.customersChange ?? 9.3,
      link: "/admin/customers",
      color: "text-purple-400",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      change: null,
      link: "/admin/orders",
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-3xl font-medium md:font-light text-[#f5f0ee]">
          Dashboard
        </h1>
        <p className="text-[#9a8f8c] text-sm md:text-xs font-['Montserrat'] mt-2 md:mt-1">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {isDemoAdmin && " — Demo Mode"}
        </p>
      </div>

      {/* Stat Cards - Responsive Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 md:h-28 bg-[#141414] animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {STAT_CARDS.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="border border-[#d4a59a]/15 md:border-[#d4a59a]/10 p-5 md:p-4 hover:border-[#d4a59a]/40 md:hover:border-[#d4a59a]/25 transition-all group bg-[#0d0d0d] rounded-sm md:rounded-none shadow-sm md:shadow-none"
            >
              <div className="flex items-center justify-between mb-4 md:mb-3">
                <card.icon size={20} md:size={15} strokeWidth={1.5} className={card.color} />
                <ArrowRight
                  size={16} md:size={11}
                  className="text-[#9a8f8c]/40 group-hover:text-[#d4a59a] transition-colors"
                />
              </div>
              <p className="font-['Cormorant_Garamond'] text-4xl md:text-2xl font-medium md:font-light text-[#f5f0ee] mb-1">
                {card.value}
              </p>
              <p className="text-xs md:text-[8px] tracking-[0.2em] md:tracking-[0.18em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-3 md:mb-2 font-semibold md:font-normal">
                {card.label}
              </p>
              {card.change !== null && (
                <div
                  className={`flex items-center gap-1 text-[11px] md:text-[9px] font-['Montserrat'] font-medium ${
                    card.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {card.change >= 0 ? (
                    <ArrowUpRight size={14} md:size={10} />
                  ) : (
                    <ArrowDownRight size={14} md:size={10} />
                  )}
                  {Math.abs(card.change)}% vs last month
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-4 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 border border-[#d4a59a]/15 md:border-[#d4a59a]/10 bg-[#0d0d0d] p-5 md:p-5 rounded-sm">
          <div className="flex items-center justify-between mb-6 md:mb-5">
            <div>
              <p className="text-sm md:text-xs tracking-[0.2em] md:tracking-[0.18em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee]">
                Revenue Overview
              </p>
              <p className="text-xs md:text-[9px] font-['Montserrat'] text-[#9a8f8c] mt-1 md:mt-0.5">
                Last 12 weeks
              </p>
            </div>
            <Link
              to="/admin/analytics"
              className="text-xs md:text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors flex items-center gap-1 font-semibold"
            >
              Full Report <ArrowRight size={14} md:size={10} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={MOCK_REVENUE}
              margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="adminDashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a59a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d4a59a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4a59a10" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: "#9a8f8c", fontSize: 10, fontFamily: "Montserrat" }}
                axisLine={false}
                tickLine={false}
                interval={window.innerWidth < 768 ? 3 : 2}
              />
              <YAxis
                tick={{ fill: "#9a8f8c", fontSize: 10, fontFamily: "Montserrat" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#d4a59a"
                strokeWidth={2}
                fill="url(#adminDashboardRevenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status Pie */}
        <div className="border border-[#d4a59a]/15 md:border-[#d4a59a]/10 bg-[#0d0d0d] p-5 md:p-5 rounded-sm">
          <p className="text-sm md:text-xs tracking-[0.2em] md:tracking-[0.18em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee] mb-1">
            Orders by Status
          </p>
          <p className="text-xs md:text-[9px] font-['Montserrat'] text-[#9a8f8c] mb-6 md:mb-5">
            All time
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={MOCK_STATUS}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {MOCK_STATUS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(212,165,154,0.2)",
                  fontFamily: "Montserrat",
                  fontSize: 12,
                  color: "#f5f0ee",
                }}
                formatter={(value) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 md:space-y-1.5 mt-4 md:mt-2">
            {MOCK_STATUS.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-2">
                  <div
                    className="w-3 h-3 md:w-2 md:h-2 rounded-full flex-shrink-0"
                    style={{ background: s.color }}
                  />
                  <span className="text-xs md:text-[9px] font-['Montserrat'] text-[#9a8f8c] font-medium md:font-normal">
                    {s.name}
                  </span>
                </div>
                <span className="text-xs md:text-[9px] font-['Montserrat'] text-[#f5f0ee] font-semibold md:font-normal">
                  {s.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-4">
        
        {/* Recent orders */}
        <div className="lg:col-span-2 border border-[#d4a59a]/15 md:border-[#d4a59a]/10 bg-[#0d0d0d] rounded-sm">
          <div className="flex items-center justify-between px-5 py-5 md:py-4 border-b border-[#d4a59a]/10">
            <p className="text-sm md:text-xs tracking-[0.2em] md:tracking-[0.18em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee]">
              Recent Orders
            </p>
            <Link
              to="/admin/orders"
              className="text-xs md:text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] font-semibold md:font-normal transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={14} md:size={10} />
            </Link>
          </div>
          <div className="divide-y divide-[#d4a59a]/10">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 hover:bg-[#f5f0ee]/5 md:hover:bg-[#f5f0ee]/2 transition-colors gap-3 sm:gap-0"
              >
                <div>
                  <p className="text-sm md:text-xs font-['Montserrat'] text-[#f5f0ee] font-semibold md:font-medium">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs md:text-[9px] text-[#9a8f8c] font-['Montserrat'] mt-1 md:mt-0">
                    {order.userEmail} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                  <span
                    className={`text-[10px] md:text-[8px] tracking-[0.15em] md:tracking-[0.12em] uppercase font-['Montserrat'] font-bold md:font-semibold px-2.5 py-1.5 md:px-2 md:py-1 rounded-sm md:rounded-none ${
                      STATUS_COLORS[order.status] || STATUS_COLORS.pending
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm md:text-xs font-['Montserrat'] text-[#f5f0ee] font-semibold md:font-normal">
                    £{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Actions */}
        <div className="border border-[#d4a59a]/15 md:border-[#d4a59a]/10 bg-[#0d0d0d] rounded-sm">
          <div className="px-5 py-5 md:py-4 border-b border-[#d4a59a]/10">
            <p className="text-sm md:text-xs tracking-[0.2em] md:tracking-[0.18em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee]">
              Alerts
            </p>
          </div>
          <div className="p-5 md:p-4 space-y-4 md:space-y-3">
            {[
              {
                msg: `${stats.pendingOrders} orders awaiting processing`,
                color: "text-yellow-400",
                dot: "bg-yellow-400",
                link: "/admin/orders",
              },
              {
                msg: "3 products low on stock",
                color: "text-red-400",
                dot: "bg-red-400",
                link: "/admin/products",
              },
              {
                msg: "New collection launch ready",
                color: "text-[#d4a59a]",
                dot: "bg-[#d4a59a]",
                link: "/admin/products",
              },
            ].map((alert, i) => (
              <Link
                key={i}
                to={alert.link}
                className="flex items-start gap-3 p-3 md:p-3 hover:bg-[#f5f0ee]/5 transition-colors group rounded-sm md:rounded-none border border-[#d4a59a]/5 md:border-transparent"
              >
                <span className={`w-2 h-2 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0 mt-1.5 ${alert.dot}`} />
                <p className={`text-xs md:text-[10px] font-['Montserrat'] font-medium md:font-normal ${alert.color} leading-relaxed`}>
                  {alert.msg}
                </p>
                <ArrowRight
                  size={14} md:size={10}
                  className="text-[#9a8f8c]/40 group-hover:text-[#9a8f8c] ml-auto flex-shrink-0 mt-0.5 transition-colors"
                />
              </Link>
            ))}

            <div className="border-t border-[#d4a59a]/15 md:border-[#d4a59a]/10 pt-5 md:pt-3 mt-4 md:mt-1">
              <p className="text-xs md:text-[9px] tracking-[0.2em] md:tracking-[0.18em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c] mb-4 md:mb-3">
                Quick Actions
              </p>
              <div className="space-y-3 md:space-y-2">
                <Link
                  to="/admin/products"
                  className="flex items-center gap-3 md:gap-2 w-full py-3.5 md:py-2 px-4 md:px-3 border border-[#d4a59a]/20 md:border-[#d4a59a]/15 text-xs md:text-[10px] font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee] md:text-[#9a8f8c] hover:text-[#d4a59a] hover:border-[#d4a59a]/50 transition-colors rounded-sm md:rounded-none"
                >
                  <Package size={16} md:size={11} strokeWidth={1.5} />
                  Add New Product
                </Link>
                <Link
                  to="/admin/content"
                  className="flex items-center gap-3 md:gap-2 w-full py-3.5 md:py-2 px-4 md:px-3 border border-[#d4a59a]/20 md:border-[#d4a59a]/15 text-xs md:text-[10px] font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee] md:text-[#9a8f8c] hover:text-[#d4a59a] hover:border-[#d4a59a]/50 transition-colors rounded-sm md:rounded-none"
                >
                  <FileText size={16} md:size={11} strokeWidth={1.5} />
                  Edit Homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}