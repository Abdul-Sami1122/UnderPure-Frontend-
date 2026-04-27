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
  {
    id: "c6",
    name: "Natasha Romanova",
    email: "natasha.r@email.com",
    orders: 12,
    totalSpent: 2340.0,
    lastOrder: "2026-04-10",
    joined: "2024-12-01",
    country: "🇷🇺 Russia",
    isVip: true,
    status: "active",
  },
  {
    id: "c7",
    name: "Priya Sharma",
    email: "priya.s@email.com",
    orders: 1,
    totalSpent: 89.0,
    lastOrder: "2026-02-28",
    joined: "2026-01-15",
    country: "🇮🇳 India",
    isVip: false,
    status: "inactive",
  },
  {
    id: "c8",
    name: "Charlotte Webb",
    email: "charlotte.w@email.com",
    orders: 5,
    totalSpent: 743.5,
    lastOrder: "2026-03-30",
    joined: "2025-05-07",
    country: "🇬🇧 United Kingdom",
    isVip: false,
    status: "active",
  },
  {
    id: "c9",
    name: "Aiko Tanaka",
    email: "aiko.t@email.com",
    orders: 8,
    totalSpent: 1456.0,
    lastOrder: "2026-04-05",
    joined: "2025-03-19",
    country: "🇯🇵 Japan",
    isVip: true,
    status: "active",
  },
  {
    id: "c10",
    name: "Valentina Cruz",
    email: "valentina.c@email.com",
    orders: 2,
    totalSpent: 198.0,
    lastOrder: "2026-01-12",
    joined: "2025-10-30",
    country: "🇧🇷 Brazil",
    isVip: false,
    status: "inactive",
  },
];

const INPUT_CLS =
  "w-full bg-[#0d0d0d] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-xs font-['Montserrat'] px-3 py-2.5 outline-none transition-colors placeholder-[#9a8f8c]/50";

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
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee]">
            Customers
          </h1>
          <p className="text-[#9a8f8c] text-xs font-['Montserrat'] mt-1">
            {MOCK_CUSTOMERS.length} registered clients
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Clients", value: MOCK_CUSTOMERS.length },
          { label: "VIP Members", value: vipCount },
          { label: "Avg Order Value", value: `£${avgOrderValue.toFixed(0)}` },
          {
            label: "Total Revenue",
            value: `£${totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-[#d4a59a]/10 bg-[#0d0d0d] p-4"
          >
            <p className="font-['Cormorant_Garamond'] text-2xl font-light text-[#f5f0ee] mb-1">
              {s.value}
            </p>
            <p className="text-[8px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8f8c]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-xs font-['Montserrat'] pl-8 pr-4 py-2.5 outline-none placeholder-[#9a8f8c]/50 transition-colors w-64"
          />
        </div>
        <div className="flex gap-2">
          {["all", "vip", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[9px] tracking-[0.12em] uppercase font-['Montserrat'] px-3 py-2 border transition-colors ${
                filter === f
                  ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/5"
                  : "border-[#d4a59a]/15 text-[#9a8f8c] hover:text-[#f5f0ee] hover:border-[#d4a59a]/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className="flex-1 border border-[#d4a59a]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d4a59a]/10 bg-[#0d0d0d]">
                  {[
                    "Customer",
                    "Country",
                    "Orders",
                    "Total Spent",
                    "Last Order",
                    "Status",
                    "",
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
                    className={`hover:bg-[#d4a59a]/3 transition-colors cursor-pointer ${selected?.id === c.id ? "bg-[#d4a59a]/5" : ""}`}
                    onClick={() =>
                      setSelected(selected?.id === c.id ? null : c)
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#d4a59a]/15 border border-[#d4a59a]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-['Montserrat'] text-[#d4a59a]">
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-['Montserrat'] text-[#f5f0ee] font-medium flex items-center gap-1.5">
                            {c.name}
                            {c.isVip && (
                              <span className="text-[7px] tracking-[0.15em] uppercase bg-[#d4a59a]/20 text-[#d4a59a] px-1.5 py-0.5">
                                VIP
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] text-[#9a8f8c] font-['Montserrat']">
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
                      £
                      {c.totalSpent.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-['Montserrat'] text-[#9a8f8c]">
                      {new Date(c.lastOrder).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[8px] tracking-[0.12em] uppercase font-['Montserrat'] font-semibold px-2 py-1 ${
                          c.status === "active"
                            ? "text-green-400 bg-green-400/10"
                            : "text-[#9a8f8c] bg-[#9a8f8c]/10"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(c);
                        }}
                        className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
                      >
                        <ArrowUpRight size={13} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-[#9a8f8c] text-sm font-['Montserrat']"
                    >
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 280 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.25 }}
              className="w-[280px] flex-shrink-0 border border-[#d4a59a]/10 bg-[#0d0d0d] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#d4a59a]/10">
                <p className="text-[10px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">
                  Profile
                </p>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[#9a8f8c] hover:text-[#f5f0ee] transition-colors"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-5">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#d4a59a]/15 border border-[#d4a59a]/30 flex items-center justify-center mb-3">
                    <span className="font-['Cormorant_Garamond'] text-xl text-[#d4a59a]">
                      {selected.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <p className="font-['Cormorant_Garamond'] text-lg font-light text-[#f5f0ee]">
                    {selected.name}
                  </p>
                  {selected.isVip && (
                    <span className="text-[7px] tracking-[0.2em] uppercase bg-[#d4a59a]/20 text-[#d4a59a] px-2 py-1 mt-1">
                      VIP Member
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: Mail, label: selected.email },
                    {
                      icon: Calendar,
                      label: `Joined ${new Date(selected.joined).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`,
                    },
                    {
                      icon: ShoppingBag,
                      label: `${selected.orders} orders placed`,
                    },
                    { icon: User, label: selected.country },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon
                        size={12}
                        strokeWidth={1.5}
                        className="text-[#d4a59a] flex-shrink-0"
                      />
                      <p className="text-[10px] font-['Montserrat'] text-[#9a8f8c] truncate">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="border border-[#d4a59a]/10 p-4 mb-5">
                  <p className="text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-3">
                    Lifetime Value
                  </p>
                  <p className="font-['Cormorant_Garamond'] text-2xl font-light text-[#d4a59a]">
                    £
                    {selected.totalSpent.toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c] mt-1">
                    Avg: £{(selected.totalSpent / selected.orders).toFixed(2)} /
                    order
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#d4a59a] text-[#0a0a0a] text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors"
                  >
                    <Mail size={11} strokeWidth={1.5} />
                    Email Customer
                  </a>
                  {!selected.isVip && (
                    <button className="flex items-center justify-center gap-2 w-full py-2.5 px-3 border border-[#d4a59a]/20 text-[#9a8f8c] text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] hover:text-[#d4a59a] hover:border-[#d4a59a]/40 transition-colors">
                      Promote to VIP
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
