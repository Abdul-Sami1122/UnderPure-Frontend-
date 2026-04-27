import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, ShoppingBag, Users, ArrowUpRight } from "lucide-react";

const WEEKLY_REVENUE = [
  { week: "W1 Jan", revenue: 820, orders: 5, customers: 4 },
  { week: "W2 Jan", revenue: 1240, orders: 8, customers: 7 },
  { week: "W3 Jan", revenue: 980, orders: 6, customers: 5 },
  { week: "W4 Jan", revenue: 1680, orders: 11, customers: 10 },
  { week: "W1 Feb", revenue: 1890, orders: 12, customers: 11 },
  { week: "W2 Feb", revenue: 1450, orders: 9, customers: 8 },
  { week: "W3 Feb", revenue: 2340, orders: 16, customers: 14 },
  { week: "W4 Feb", revenue: 2100, orders: 14, customers: 12 },
  { week: "W1 Mar", revenue: 2780, orders: 19, customers: 17 },
  { week: "W2 Mar", revenue: 3120, orders: 22, customers: 20 },
  { week: "W3 Mar", revenue: 2870, orders: 18, customers: 16 },
  { week: "W4 Mar", revenue: 3450, orders: 24, customers: 22 },
  { week: "W1 Apr", revenue: 3890, orders: 27, customers: 25 },
  { week: "W2 Apr", revenue: 4230, orders: 30, customers: 28 },
  { week: "W3 Apr", revenue: 4680, orders: 33, customers: 31 },
];

const CATEGORY_REVENUE = [
  { category: "Bras", revenue: 12480, units: 89 },
  { category: "Sets", revenue: 9840, units: 56 },
  { category: "Sleepwear", revenue: 6320, units: 48 },
  { category: "Briefs", revenue: 5580, units: 112 },
];

const TOP_PRODUCTS = [
  { name: "Obsidian Lace Bralette", sales: 34, revenue: 2618, category: "Bras" },
  { name: "Silk Dreams Chemise", sales: 28, revenue: 4172, category: "Sleepwear" },
  { name: "Velvet Reverie Set", sales: 22, revenue: 4818, category: "Sets" },
  { name: "Midnight French Knicker", sales: 48, revenue: 2880, category: "Briefs" },
  { name: "Noir Balconette Bra", sales: 19, revenue: 2052, category: "Bras" },
];

const STATUS_DATA = [
  { name: "Delivered", value: 68, color: "#4ade80" },
  { name: "Processing", value: 15, color: "#60a5fa" },
  { name: "Shipped", value: 10, color: "#d4a59a" },
  { name: "Pending", value: 5, color: "#facc15" },
  { name: "Cancelled", value: 2, color: "#f87171" },
];

const CT = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-[#111] border border-[#d4a59a]/20 px-3 py-2.5 text-[10px] font-['Montserrat']">
      <p className="text-[#9a8f8c] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#d4a59a" }}>
          {p.name}: {p.name === "revenue" ? `£${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  ) : null;

export function AdminAnalytics() {
  const totalRevenue = WEEKLY_REVENUE.reduce((s, w) => s + w.revenue, 0);
  const totalOrders = WEEKLY_REVENUE.reduce((s, w) => s + w.orders, 0);
  const totalCustomers = WEEKLY_REVENUE.reduce((s, w) => s + w.customers, 0);

  return (
    <div className="p-6 md:p-8 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee]">Analytics</h1>
        <p className="text-[#9a8f8c] text-xs font-['Montserrat'] mt-1">
          Performance overview · Last 15 weeks
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total Revenue", value: `£${totalRevenue.toLocaleString("en-GB")}`, change: "+18.4%", icon: TrendingUp, color: "text-[#d4a59a]" },
          { label: "Total Orders", value: totalOrders, change: "+12.1%", icon: ShoppingBag, color: "text-blue-400" },
          { label: "New Customers", value: totalCustomers, change: "+9.3%", icon: Users, color: "text-purple-400" },
        ].map((k) => (
          <div key={k.label} className="border border-[#d4a59a]/10 bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between mb-3">
              <k.icon size={15} strokeWidth={1.5} className={k.color} />
              <span className="flex items-center gap-0.5 text-[9px] font-['Montserrat'] text-green-400">
                <ArrowUpRight size={10} />{k.change}
              </span>
            </div>
            <p className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee] mb-1">{k.value}</p>
            <p className="text-[8px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Orders line chart */}
      <div className="border border-[#d4a59a]/10 bg-[#0d0d0d] p-5 mb-4">
        <p className="text-xs tracking-[0.18em] uppercase font-['Montserrat'] text-[#f5f0ee] mb-1">
          Revenue & Orders Over Time
        </p>
        <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c] mb-5">Weekly breakdown</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={WEEKLY_REVENUE} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4a59a10" />
            <XAxis dataKey="week" tick={{ fill: "#9a8f8c", fontSize: 9, fontFamily: "Montserrat" }} axisLine={false} tickLine={false} interval={2} />
            <YAxis yAxisId="rev" tick={{ fill: "#9a8f8c", fontSize: 9, fontFamily: "Montserrat" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="ord" orientation="right" tick={{ fill: "#9a8f8c", fontSize: 9, fontFamily: "Montserrat" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CT />} />
            <Line yAxisId="rev" type="monotone" dataKey="revenue" name="revenue" stroke="#d4a59a" strokeWidth={2} dot={false} />
            <Line yAxisId="ord" type="monotone" dataKey="orders" name="orders" stroke="#60a5fa" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown + Status pie */}
      <div className="grid md:grid-cols-5 gap-4 mb-4">
        {/* Category bar chart */}
        <div className="md:col-span-3 border border-[#d4a59a]/10 bg-[#0d0d0d] p-5">
          <p className="text-xs tracking-[0.18em] uppercase font-['Montserrat'] text-[#f5f0ee] mb-1">Revenue by Category</p>
          <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c] mb-5">All time</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CATEGORY_REVENUE} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4a59a10" />
              <XAxis dataKey="category" tick={{ fill: "#9a8f8c", fontSize: 9, fontFamily: "Montserrat" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9a8f8c", fontSize: 9, fontFamily: "Montserrat" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid rgba(212,165,154,0.2)", fontFamily: "Montserrat", fontSize: 10, color: "#f5f0ee", borderRadius: 0 }}
                formatter={(v) => [`£${v.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#d4a59a" opacity={0.85} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="md:col-span-2 border border-[#d4a59a]/10 bg-[#0d0d0d] p-5">
          <p className="text-xs tracking-[0.18em] uppercase font-['Montserrat'] text-[#f5f0ee] mb-1">Order Status</p>
          <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c] mb-3">Distribution</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={STATUS_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                {STATUS_DATA.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(212,165,154,0.2)", fontFamily: "Montserrat", fontSize: 10, color: "#f5f0ee", borderRadius: 0 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {STATUS_DATA.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-[9px] font-['Montserrat'] text-[#9a8f8c]">{s.name}</span>
                </div>
                <span className="text-[9px] font-['Montserrat'] text-[#f5f0ee]">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products table */}
      <div className="border border-[#d4a59a]/10 bg-[#0d0d0d]">
        <div className="px-5 py-4 border-b border-[#d4a59a]/10">
          <p className="text-xs tracking-[0.18em] uppercase font-['Montserrat'] text-[#f5f0ee]">Top Products</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d4a59a]/10">
              {["Product", "Category", "Units Sold", "Revenue", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4a59a]/10">
            {TOP_PRODUCTS.map((p, i) => (
              <tr key={i} className="hover:bg-[#d4a59a]/3 transition-colors">
                <td className="px-5 py-3 text-xs font-['Montserrat'] text-[#f5f0ee]">{p.name}</td>
                <td className="px-5 py-3">
                  <span className="text-[9px] tracking-[0.1em] uppercase font-['Montserrat'] text-[#9a8f8c]">{p.category}</span>
                </td>
                <td className="px-5 py-3 text-xs font-['Montserrat'] text-[#f5f0ee]">{p.sales}</td>
                <td className="px-5 py-3 text-xs font-['Montserrat'] text-[#d4a59a]">
                  £{p.revenue.toLocaleString("en-GB")}
                </td>
                <td className="px-5 py-3">
                  {/* Bar indicator */}
                  <div className="w-24 h-1 bg-[#1a1a1a] overflow-hidden">
                    <div
                      className="h-full bg-[#d4a59a]/60"
                      style={{ width: `${(p.revenue / TOP_PRODUCTS[0].revenue) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}