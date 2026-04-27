import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  BarChart2,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart2, end: false },
    ],
  },
  {
    label: "Store",
    items: [
      { to: "/admin/products", label: "Products", icon: Package, end: false },
      { to: "/admin/orders", label: "Orders", icon: ShoppingBag, end: false },
      { to: "/admin/customers", label: "Customers", icon: Users, end: false },
      { to: "/admin/promotions", label: "Promotions", icon: Tag, end: false },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/content", label: "Homepage", icon: FileText, end: false },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
    ],
  },
];

const ROUTE_TITLES = {
  "/admin": "Dashboard",
  "/admin/analytics": "Analytics",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/promotions": "Promotions",
  "/admin/content": "Homepage Content",
  "/admin/settings": "Settings",
};

// Demo gate — shown when not authenticated as admin
function DemoGate() {
  const { loginDemo } = useAuthStore();
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <p className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee] tracking-widest uppercase mb-2">
          Underpure
        </p>
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#d4a59a] font-['Montserrat'] mb-10">
          Admin Panel
        </p>
        <div className="border border-[#d4a59a]/15 p-8">
          <p className="text-sm font-['Montserrat'] text-[#9a8f8c] mb-8 leading-relaxed">
            This area is restricted to administrators. Connect Supabase and set{" "}
            <code className="text-[#d4a59a] bg-[#d4a59a]/10 px-1 py-0.5 text-[11px]">
              isAdmin: true
            </code>{" "}
            on your user to access with real data, or enter in demo mode below.
          </p>
          <button
            onClick={loginDemo}
            className="w-full bg-[#d4a59a] text-[#0a0a0a] py-3.5 text-xs tracking-[0.2em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors mb-3"
          >
            Enter Demo Mode
          </button>
          <Link
            to="/"
            className="block text-[10px] tracking-[0.15em] uppercase text-[#9a8f8c] hover:text-[#f5f0ee] font-['Montserrat'] transition-colors"
          >
            ← Return to Store
          </Link>
        </div>
        <p className="text-[9px] text-[#9a8f8c]/40 font-['Montserrat'] mt-6">
          Demo mode uses mock data. No Supabase connection required.
        </p>
      </div>
    </div>
  );
}

// YAHAN DEFAULT EXPORT LAGAYA GAYA HAI TAQAY ERROR NA AAYE
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, isDemoAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth check
  const isAdmin = isAuthenticated && user?.isAdmin;

  if (!isAdmin) return <DemoGate />;

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/");
  };

  const pageTitle = ROUTE_TITLES[location.pathname] || "Admin";

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f0ee] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 flex-shrink-0 bg-[#0a0a0a] border-r border-[#d4a59a]/10 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[#d4a59a]/10 flex items-center justify-between">
          <div>
            <p className="font-['Cormorant_Garamond'] text-lg font-light tracking-[0.25em] uppercase text-[#f5f0ee]">
              Underpure
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#d4a59a] font-['Montserrat']">
                Admin Panel
              </span>
              {isDemoAdmin && (
                <span className="text-[7px] tracking-[0.15em] uppercase bg-amber-500/20 text-amber-400 px-1.5 py-0.5 font-['Montserrat']">
                  Demo
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#9a8f8c] hover:text-[#f5f0ee] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="text-[8px] tracking-[0.3em] uppercase text-[#9a8f8c]/50 font-['Montserrat'] px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 text-[11px] tracking-[0.08em] uppercase font-['Montserrat'] transition-all rounded-sm ${isActive
                        ? "bg-[#d4a59a]/12 text-[#d4a59a] border-l-2 border-[#d4a59a]"
                        : "text-[#9a8f8c] hover:text-[#f5f0ee] hover:bg-[#f5f0ee]/3 border-l-2 border-transparent"
                      }`
                    }
                  >
                    <item.icon size={13} strokeWidth={1.5} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User + actions */}
        <div className="border-t border-[#d4a59a]/10 px-3 py-4 space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 text-[11px] tracking-[0.08em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#f5f0ee] transition-colors"
          >
            <ExternalLink size={13} strokeWidth={1.5} />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] tracking-[0.08em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-red-400 transition-colors"
          >
            <LogOut size={13} strokeWidth={1.5} />
            Sign Out
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-[#d4a59a]/10">
            <div className="w-7 h-7 rounded-full bg-[#d4a59a]/20 border border-[#d4a59a]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-['Montserrat'] font-semibold text-[#d4a59a]">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-['Montserrat'] text-[#f5f0ee] truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c] truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-[#d4a59a]/10 bg-[#0a0a0a] flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-[#9a8f8c] hover:text-[#f5f0ee] transition-colors mr-1"
            >
              <Menu size={18} />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[10px] font-['Montserrat']">
              <span className="text-[#9a8f8c]">Admin</span>
              <ChevronRight size={10} className="text-[#9a8f8c]/40" />
              <span className="text-[#f5f0ee]">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isDemoAdmin && (
              <span className="hidden sm:block text-[8px] tracking-[0.2em] uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-1 font-['Montserrat']">
                Demo Mode — No Supabase Connected
              </span>
            )}
            <button className="relative text-[#9a8f8c] hover:text-[#f5f0ee] transition-colors">
              <Bell size={16} strokeWidth={1.5} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#d4a59a]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}