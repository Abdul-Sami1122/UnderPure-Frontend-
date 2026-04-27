import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ShoppingBag, Search, User, Menu, X, Heart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useSiteSettingsStore } from "../../store/siteSettingsStore";
import { fetchProducts } from "../../lib/api";
import { MOCK_PRODUCTS } from "../../lib/mockData";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const { totalItems, toggleCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { announcementText, announcementVisible } = useSiteSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const debouncedQuery = useDebounce(searchQuery, 280);

  const cartCount = totalItems();

  useEffect(() => {
    fetchProducts().then(setAllProducts).catch(() => setAllProducts(MOCK_PRODUCTS));
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const q = debouncedQuery.toLowerCase();
    const results = allProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 5);
    setSearchResults(results);
  }, [debouncedQuery, allProducts]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const navLinks = [
    { href: "/shop", label: "Shop All" },
    { href: "/shop?category=bras", label: "Bras" },
    { href: "/shop?category=sets", label: "Sets" },
    { href: "/shop?category=sleepwear", label: "Sleepwear" },
    { href: "/shop?category=briefs", label: "Briefs" },
  ];

  return (
    <>
      {announcementVisible && (
        <div className="bg-[#8b4f5c] text-[#f5f0ee] text-center py-2 px-2 text-[9px] tracking-[0.2em] uppercase font-['Montserrat']">
          {announcementText}
        </div>
      )}

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled ? "bg-[#0a0a0a]/96 backdrop-blur-md border-b border-[#d4a59a]/10 shadow-lg" : "bg-[#0a0a0a]"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Hamburger - Visible on Mobile AND Tablet (lg:hidden) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-[#f5f0ee]/80 hover:text-[#d4a59a] p-2 -ml-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Nav (Left) - Only visible on LG (1024px+) */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link key={link.href} to={link.href} className="text-[11px] tracking-[0.15em] uppercase text-[#f5f0ee]/70 hover:text-[#d4a59a] transition-colors font-['Montserrat']">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo - Centered and Responsive */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 font-['Cormorant_Garamond'] text-xl sm:text-2xl lg:text-3xl font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#f5f0ee] hover:text-[#d4a59a] transition-colors"
            >
              Underpure
            </Link>

            {/* Right Icons & Nav */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Nav (Right) - Only visible on LG */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mr-4">
                {navLinks.slice(3).map((link) => (
                  <Link key={link.href} to={link.href} className="text-[11px] tracking-[0.15em] uppercase text-[#f5f0ee]/70 hover:text-[#d4a59a] transition-colors font-['Montserrat']">
                    {link.label}
                  </Link>
                ))}
              </nav>

              <button onClick={() => setSearchOpen(true)} className="text-[#f5f0ee]/70 hover:text-[#d4a59a] p-2">
                <Search size={19} strokeWidth={1.5} />
              </button>

              <Link to={isAuthenticated ? "/account" : "/auth"} className="hidden sm:block text-[#f5f0ee]/70 hover:text-[#d4a59a] relative p-2">
                <User size={19} strokeWidth={1.5} />
              </Link>

              <button onClick={toggleCart} className="text-[#f5f0ee]/70 hover:text-[#d4a59a] relative p-2">
                <ShoppingBag size={19} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d4a59a] text-[#0a0a0a] text-[9px] font-bold flex items-center justify-center font-['Montserrat']">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Drawer Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? "max-h-screen opacity-100 border-t border-[#d4a59a]/10" : "max-h-0 opacity-0"}`}>
          <nav className="bg-[#0d0d0d] px-8 py-10 flex flex-col gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="text-sm tracking-[0.25em] uppercase text-[#f5f0ee]/80 hover:text-[#d4a59a] font-['Montserrat']">
                {link.label}
              </Link>
            ))}
            <hr className="border-[#d4a59a]/10 my-2" />
            <Link to={isAuthenticated ? "/account" : "/auth"} className="text-sm tracking-[0.2em] uppercase text-[#f5f0ee]/80 flex items-center gap-3">
              <User size={18} /> {isAuthenticated ? "Account" : "Sign In"}
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className="text-sm tracking-[0.2em] uppercase text-[#d4a59a]">Admin Panel</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0a0a0a]/98 backdrop-blur-md flex items-start justify-center pt-24 px-6"
            onClick={(e) => e.target === e.currentTarget && closeSearch()}
          >
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  ref={searchInputRef} autoFocus
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections..."
                  className="w-full bg-transparent border-b border-[#d4a59a]/30 focus:border-[#d4a59a] text-[#f5f0ee] text-2xl sm:text-4xl font-['Cormorant_Garamond'] py-4 outline-none transition-colors"
                />
                <button onClick={closeSearch} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9a8f8c] hover:text-[#f5f0ee] p-2">
                  <X size={24} />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-8 space-y-4">
                  {searchResults.map((p) => (
                    <Link key={p.id} to={`/product/${p.slug}`} onClick={closeSearch} className="flex items-center gap-4 group">
                      <div className="w-12 h-16 bg-[#1a1a1a] overflow-hidden"><img src={p.image} className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="text-[#f5f0ee] font-['Cormorant_Garamond'] text-lg group-hover:text-[#d4a59a]">{p.name}</p>
                        <p className="text-[10px] text-[#9a8f8c] uppercase tracking-widest">{p.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}