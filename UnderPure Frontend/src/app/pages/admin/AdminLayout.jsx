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
        <p className="font-['Cormorant_Garamond'] text-4xl sm:text-3xl font-medium sm:font-light text-[#f5f0ee] tracking-widest uppercase mb-3 sm:mb-2">
          UNDERPURE
        </p>
        <p className="text-[11px] sm:text-[10px] tracking-[0.25em] uppercase text-[#d4a59a] font-['Montserrat'] mb-12 sm:mb-10 font-semibold sm:font-normal">
          Admin Panel
        </p>
        <div className="border border-[#d4a59a]/20 sm:border-[#d4a59a]/15 p-8 sm:p-8 bg-[#111111]">
          <p className="text-base sm:text-sm font-['Montserrat'] text-[#9a8f8c] mb-8 leading-relaxed sm:leading-relaxed">
            This area is restricted to administrators. Connect Supabase and set{" "}
            <code className="text-[#d4a59a] bg-[#d4a59a]/10 px-2 py-1 sm:px-1 sm:py-0.5 text-xs sm:text-[11px] rounded-sm">
              isAdmin: true
            </code>{" "}
            on your user to access with real data, or enter in demo mode below.
          </p>
          <button
            onClick={loginDemo}
            className="w-full bg-[#d4a59a] text-[#0a0a0a] py-4 sm:py-3.5 text-xs sm:text-[11px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold hover:bg-[#f2c6b4] transition-colors mb-4 sm:mb-3 shadow-md sm:shadow-none"
          >
            Enter Demo Mode
          </button>
          <Link
            to="/"
            className="block text-xs sm:text-[10px] tracking-[0.15em] uppercase text-[#9a8f8c] hover:text-[#d4a59a] font-['Montserrat'] font-semibold sm:font-normal transition-colors py-2"
          >
            ← Return to Store
          </Link>
        </div>
        <p className="text-xs sm:text-[10px] text-[#9a8f8c]/60 sm:text-[#9a8f8c]/40 font-['Montserrat'] mt-8 sm:mt-6">
          Demo mode uses mock data. No Supabase connection required.
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, isDemoAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = isAuthenticated && user?.isAdmin;

  if (!isAdmin) return <DemoGate />;

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/");
  };

  const pageTitle = ROUTE_TITLES[location.pathname] || "Admin";

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f0ee] flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[80%] max-w-[300px] lg:w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-[#d4a59a]/15 lg:border-[#d4a59a]/10 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-6 py-6 lg:px-5 lg:py-5 border-b border-[#d4a59a]/15 lg:border-[#d4a59a]/10 flex items-center justify-between">
          <div>
            <p className="font-['Cormorant_Garamond'] text-2xl lg:text-xl font-medium lg:font-light tracking-[0.25em] uppercase text-[#f5f0ee]">
              UNDERPURE
            </p>
            <div className="flex items-center gap-2 mt-1 lg:mt-0.5">
              <span className="text-[10px] lg:text-[9px] tracking-[0.2em] uppercase text-[#d4a59a] font-['Montserrat'] font-semibold lg:font-normal">
                Admin Panel
              </span>
              {isDemoAdmin && (
                <span className="text-[9px] lg:text-[8px] tracking-[0.15em] uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 lg:px-1.5 lg:py-0.5 font-['Montserrat'] font-bold lg:font-normal rounded-sm">
                  Demo
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#9a8f8c] hover:text-[#d4a59a] transition-all p-2 -mr-2 hover:rotate-90 duration-300"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 px-4 lg:px-3 py-6 lg:py-4 overflow-y-auto scrollbar-hide">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6 lg:mb-5">
              <p className="text-[10px] lg:text-[9px] tracking-[0.3em] uppercase text-[#9a8f8c]/60 lg:text-[#9a8f8c]/50 font-['Montserrat'] font-bold lg:font-medium px-4 lg:px-3 mb-3 lg:mb-2">
                {group.label}
              </p>
              <div className="space-y-1 lg:space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 lg:gap-2.5 px-4 lg:px-3 py-3.5 lg:py-2.5 text-xs lg:text-[11px] tracking-[0.08em] uppercase font-['Montserrat'] transition-all rounded-sm ${
                        isActive
                          ? "bg-[#d4a59a]/15 lg:bg-[#d4a59a]/12 text-[#d4a59a] font-bold lg:font-semibold border-l-2 border-[#d4a59a]"
                          : "text-[#9a8f8c] font-medium lg:font-normal hover:text-[#f5f0ee] hover:bg-[#f5f0ee]/5 border-l-2 border-transparent"
                      }`
                    }
                  >
                    {/* Error yahan tha, ab theek kar diya gaya hai */}
                    <item.icon size={18} strokeWidth={1.5} className="shrink-0 lg:w-[16px] lg:h-[16px]" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User + actions */}
        <div className="border-t border-[#d4a59a]/15 lg:border-[#d4a59a]/10 px-4 lg:px-3 py-5 lg:py-4 space-y-2 lg:space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 lg:gap-2.5 px-4 lg:px-3 py-3 lg:py-2 text-xs lg:text-[11px] tracking-[0.08em] uppercase font-['Montserrat'] font-semibold lg:font-medium text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            <ExternalLink size={16} strokeWidth={1.5} className="lg:w-[14px] lg:h-[14px]" />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 lg:gap-2.5 px-4 lg:px-3 py-3 lg:py-2 text-xs lg:text-[11px] tracking-[0.08em] uppercase font-['Montserrat'] font-semibold lg:font-medium text-[#9a8f8c] hover:text-red-400 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.5} className="lg:w-[14px] lg:h-[14px]" />
            Sign Out
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-3 lg:gap-3 px-4 lg:px-3 py-4 lg:py-3 mt-3 lg:mt-2 border-t border-[#d4a59a]/15 lg:border-[#d4a59a]/10 bg-[#111] lg:bg-transparent rounded-sm lg:rounded-none">
            <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-[#d4a59a]/20 border border-[#d4a59a]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs lg:text-[11px] font-['Montserrat'] font-bold text-[#d4a59a]">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs lg:text-[11px] font-['Montserrat'] font-semibold lg:font-medium text-[#f5f0ee] truncate">
                {user?.name || "Admin User"}
              </p>
              <p className="text-[10px] lg:text-[10px] font-['Montserrat'] text-[#9a8f8c] truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#080808]">
        {/* Top bar */}
        <header className="h-16 lg:h-16 border-b border-[#d4a59a]/15 lg:border-[#d4a59a]/10 bg-[#0a0a0a]/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 lg:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-[#f5f0ee]/80 hover:text-[#d4a59a] transition-all active:scale-95 p-1.5 -ml-1.5 rounded-md"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 lg:gap-1.5 text-xs lg:text-[11px] font-['Montserrat'] font-medium lg:font-normal">
              <span className="text-[#9a8f8c] hidden sm:inline">Admin Space</span>
              <ChevronRight size={14} className="text-[#9a8f8c]/40 hidden sm:inline lg:w-[12px] lg:h-[12px]" />
              <span className="text-[#d4a59a]">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-5">
            {isDemoAdmin && (
              <span className="hidden md:flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 font-['Montserrat'] font-semibold rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Demo Mode Active
              </span>
            )}
            <button className="relative text-[#9a8f8c] hover:text-[#d4a59a] transition-colors p-2 lg:p-1">
              <Bell size={20} strokeWidth={1.5} className="lg:w-[18px] lg:h-[18px]" />
              <span className="absolute top-1 lg:top-0 right-1 lg:right-0 w-2.5 h-2.5 lg:w-2 lg:h-2 rounded-full bg-[#d4a59a] border border-[#0a0a0a]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#080808]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}