import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  ShoppingBag,
  User,
  Mail,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

const MOCK_CUSTOMERS = [
  {
    id: "c1",
    name: "Isabelle Martin",
    email: "isabelle.m@email.com",
    orders: 7,
    totalSpent: 1024.5,
    lastOrder: "2026-04-18",
    joined: "2025-06-12",
    country: "🇬🇧 United Kingdom",
    isVip: true,
    status: "active",
  },
  {
    id: "c2",
    name: "Camille Dubois",
    email: "camille.d@email.com",
    orders: 4,
    totalSpent: 612.0,
    lastOrder: "2026-04-20",
    joined: "2025-09-03",
    country: "🇫🇷 France",
    isVip: false,
    status: "active",
  },
  {
    id: "c3",
    name: "Sophie Keating",
    email: "sophie.k@email.com",
    orders: 2,
    totalSpent: 249.0,
    lastOrder: "2026-03-15",
    joined: "2025-11-28",
    country: "🇺🇸 United States",
    isVip: false,
    status: "active",
  },
  {
    id: "c4",
    name: "Amara Traore",
    email: "amara.t@email.com",
    orders: 9,
    totalSpent: 1890.0,
    lastOrder: "2026-04-21",
    joined: "2025-02-14",
    country: "🇦🇪 UAE",
    isVip: true,
    status: "active",
  },
  {
    id: "c5",
    name: "Elena Vasquez",
    email: "elena.v@email.com",
    orders: 3,
    totalSpent: 487.0,
    lastOrder: "2026-04-17",
    joined: "2025-07-22",
    country: "🇮🇹 Italy",
    isVip: false,
    status: "active",
  },
];

export function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ||
      (filter === "vip" && c.isVip) ||
      (filter === "active" && c.status === "active") ||
      (filter === "inactive" && c.status === "inactive");
    return matchSearch && matchFilter;
  });

  const totalRevenue = MOCK_CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0);
  const vipCount = MOCK_CUSTOMERS.filter((c) => c.isVip).length;
  const avgOrderValue =
    totalRevenue / MOCK_CUSTOMERS.reduce((s, c) => s + c.orders, 0);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto relative h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-2 md:gap-0">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-3xl font-medium md:font-light text-[#f5f0ee]">
            Customers
          </h1>
          <p className="text-[#9a8f8c] text-sm md:text-xs font-['Montserrat'] mt-2 md:mt-1">
            {MOCK_CUSTOMERS.length} registered clients
          </p>
        </div>
      </div>

      {/* Summary stats - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 md:mb-8">
        {[
          { label: "Total Clients", value: MOCK_CUSTOMERS.length },
          { label: "VIP Members", value: vipCount },
          { label: "Avg Order Value", value: `£${avgOrderValue.toFixed(0)}` },
          {
            label: "Total Revenue",
            value: `£${totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 0 })}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-[#d4a59a]/15 md:border-[#d4a59a]/10 bg-[#0d0d0d] p-4 md:p-4 rounded-sm md:rounded-none shadow-sm md:shadow-none"
          >
            <p className="font-['Cormorant_Garamond'] text-3xl md:text-2xl font-medium md:font-light text-[#f5f0ee] mb-1">
              {s.value}
            </p>
            <p className="text-[10px] md:text-[8px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 md:mb-5">
        <div className="relative w-full sm:w-auto">
          <Search
            size={18} md:size={13}
            className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 text-[#9a8f8c]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-sm md:text-xs font-['Montserrat'] pl-12 md:pl-8 pr-4 py-3.5 md:py-2.5 outline-none placeholder-[#9a8f8c]/50 transition-colors w-full sm:w-64 rounded-sm md:rounded-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "vip", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs md:text-[9px] tracking-[0.15em] md:tracking-[0.12em] uppercase font-['Montserrat'] font-medium md:font-normal px-4 py-2.5 md:px-3 md:py-2 border transition-colors rounded-sm md:rounded-none flex-grow sm:flex-grow-0 ${filter === f
                  ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/10 md:bg-[#d4a59a]/5 font-semibold"
                  : "border-[#d4a59a]/15 text-[#9a8f8c] hover:text-[#f5f0ee] hover:border-[#d4a59a]/30"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 relative">

        {/* ====== MOBILE VIEW (Cards View) ====== */}
        <div className="md:hidden w-full space-y-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}
              className={`border border-[#d4a59a]/15 p-4 rounded-sm relative shadow-sm cursor-pointer transition-colors ${selected?.id === c.id ? "bg-[#d4a59a]/5 border-[#d4a59a]/40" : "bg-[#0d0d0d] hover:border-[#d4a59a]/30"}`}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#d4a59a]/15 border border-[#d4a59a]/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg font-['Cormorant_Garamond'] font-medium text-[#d4a59a]">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-base font-['Montserrat'] text-[#f5f0ee] font-semibold mb-0.5 truncate">
                      {c.name}
                    </p>
                    {c.isVip && (
                      <span className="text-[8px] tracking-[0.15em] uppercase bg-[#d4a59a]/20 text-[#d4a59a] font-bold px-2 py-1 rounded-sm">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9a8f8c] font-['Montserrat'] mb-3 truncate">{c.email}</p>

                  <div className="flex flex-wrap items-center gap-3 gap-y-2 text-xs font-['Montserrat'] text-[#f5f0ee]">
                    <span className="bg-[#111] px-2.5 py-1 rounded-sm border border-[#d4a59a]/10">{c.orders} Orders</span>
                    <span className="bg-[#111] px-2.5 py-1 rounded-sm border border-[#d4a59a]/10">£{c.totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-[#9a8f8c] text-sm font-['Montserrat'] border border-[#d4a59a]/15 bg-[#0d0d0d] rounded-sm">
              No customers found
            </div>
          )}
        </div>

        {/* ====== DESKTOP VIEW (Table View) ====== */}
        <div className="hidden md:block flex-1 border border-[#d4a59a]/10 overflow-hidden bg-[#0d0d0d]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d4a59a]/10 bg-[#0a0a0a]">
                  {[
                    "Customer", "Country", "Orders", "Total Spent", "Last Order", "Status", ""
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4a59a]/10">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-[#d4a59a]/5 transition-colors cursor-pointer ${selected?.id === c.id ? "bg-[#d4a59a]/10" : ""
                      }`}
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#d4a59a]/15 border border-[#d4a59a]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-['Montserrat'] font-bold text-[#d4a59a]">
                            {c.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-['Montserrat'] text-[#f5f0ee] font-medium flex items-center gap-1.5">
                            {c.name}
                            {c.isVip && (
                              <span className="text-[8px] tracking-[0.15em] uppercase bg-[#d4a59a]/20 text-[#d4a59a] px-1.5 py-0.5 rounded-sm font-bold">
                                VIP
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#9a8f8c] font-['Montserrat'] mt-0.5">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] font-['Montserrat'] text-[#9a8f8c]">
                      {c.country}
                    </td>
                    <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#f5f0ee]">
                      {c.orders}
                    </td>
                    <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#f5f0ee]">
                      £{c.totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-['Montserrat'] text-[#9a8f8c]">
                      {new Date(c.lastOrder).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[8px] tracking-[0.12em] uppercase font-['Montserrat'] font-semibold px-2 py-1 rounded-sm ${c.status === "active"
                            ? "text-green-400 bg-green-400/10"
                            : "text-[#9a8f8c] bg-[#9a8f8c]/10"
                          }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                        className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors p-1.5 bg-[#111] hover:bg-[#d4a59a]/10 rounded-sm border border-[#d4a59a]/10"
                      >
                        <ArrowUpRight size={14} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#9a8f8c] text-sm font-['Montserrat']">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ====== DETAIL PANEL (Mobile: Bottom Sheet/Overlay, Desktop: Side Panel) ====== */}
        <AnimatePresence>
          {selected && (
            <>
              {/* Mobile Backdrop */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSelected(null)} />

              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="fixed bottom-0 left-0 right-0 max-h-[85vh] md:max-h-none overflow-y-auto z-50 md:static md:w-[320px] md:flex-shrink-0 border-t md:border-t-0 md:border md:border-[#d4a59a]/15 bg-[#111] md:bg-[#0d0d0d] rounded-t-xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none"
              >
                <div className="flex items-center justify-between px-6 py-5 md:px-5 md:py-4 border-b border-[#d4a59a]/15 md:border-[#d4a59a]/10 sticky top-0 bg-[#111] md:bg-transparent z-10">
                  <p className="text-xs md:text-[10px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold md:font-normal text-[#9a8f8c]">
                    Profile Details
                  </p>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-[#9a8f8c] hover:text-[#f5f0ee] transition-all p-1 bg-[#1a1a1a] rounded-sm hover:rotate-90 duration-300"
                  >
                    <X size={20} md:size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="p-6 md:p-5">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-8 md:mb-6 text-center">
                    <div className="w-20 h-20 md:w-16 md:h-16 rounded-full bg-[#d4a59a]/15 border border-[#d4a59a]/30 flex items-center justify-center mb-4 md:mb-3 shadow-sm">
                      <span className="font-['Cormorant_Garamond'] text-3xl md:text-2xl text-[#d4a59a]">
                        {selected.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <p className="font-['Cormorant_Garamond'] text-3xl md:text-xl font-medium md:font-light text-[#f5f0ee]">
                      {selected.name}
                    </p>
                    {selected.isVip && (
                      <span className="text-[9px] md:text-[8px] tracking-[0.2em] uppercase bg-[#d4a59a]/20 text-[#d4a59a] font-bold px-3 py-1.5 md:px-2 md:py-1 mt-2 rounded-sm">
                        VIP Member
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4 md:space-y-3 mb-8 md:mb-6 bg-[#0a0a0a] md:bg-transparent p-4 md:p-0 rounded-sm md:rounded-none border border-[#d4a59a]/10 md:border-none">
                    {[
                      { icon: Mail, label: selected.email },
                      { icon: Calendar, label: `Joined ${new Date(selected.joined).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}` },
                      { icon: ShoppingBag, label: `${selected.orders} orders placed` },
                      { icon: User, label: selected.country },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 md:gap-3">
                        <item.icon size={16} md:size={14} strokeWidth={1.5} className="text-[#d4a59a] flex-shrink-0" />
                        <p className="text-sm md:text-[11px] font-['Montserrat'] font-medium md:font-normal text-[#9a8f8c] truncate">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="border border-[#d4a59a]/20 md:border-[#d4a59a]/15 bg-[#1a1a1a] md:bg-[#111] p-5 md:p-4 mb-8 md:mb-6 rounded-sm">
                    <p className="text-[10px] md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c] mb-2 md:mb-3">
                      Lifetime Value
                    </p>
                    <p className="font-['Cormorant_Garamond'] text-4xl md:text-3xl font-medium md:font-light text-[#d4a59a]">
                      £{selected.totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs md:text-[10px] font-['Montserrat'] font-medium md:font-normal text-[#9a8f8c] mt-2 md:mt-1">
                      Avg: £{(selected.totalSpent / selected.orders).toFixed(2)} / order
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 md:space-y-2 pb-4 md:pb-0">
                    <a
                      href={`mailto:${selected.email}`}
                      className="flex items-center justify-center gap-3 md:gap-2 w-full py-4 md:py-3 px-4 md:px-3 bg-[#d4a59a] text-[#0a0a0a] text-xs md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase font-['Montserrat'] font-bold md:font-semibold hover:bg-[#f2c6b4] transition-colors rounded-sm shadow-md md:shadow-none"
                    >
                      <Mail size={16} md:size={13} strokeWidth={2} />
                      Email Customer
                    </a>
                    {!selected.isVip && (
                      <button className="flex items-center justify-center gap-2 w-full py-4 md:py-3 px-4 md:px-3 border border-[#d4a59a]/30 md:border-[#d4a59a]/20 text-[#f5f0ee] md:text-[#9a8f8c] text-xs md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal hover:text-[#d4a59a] hover:border-[#d4a59a]/50 transition-colors bg-[#1a1a1a] md:bg-transparent rounded-sm">
                        Promote to VIP
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}