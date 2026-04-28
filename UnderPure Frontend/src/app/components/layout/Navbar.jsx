import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ShoppingBag, Search, User, Menu, X, ChevronDown, ArrowRight } from "lucide-react";
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

const NAV_LINKS = [
  { href: "/shop", label: "Shop All" },
  {
    label: "Bras",
    href: "/shop?category=bras",
    subLinks: [
      { href: "/shop?category=bras&type=balconette", label: "Balconette Bras" },
      { href: "/shop?category=bras&type=plunge", label: "Plunge Bras" },
      { href: "/shop?category=bras&type=wireless", label: "Wireless & Bralettes" },
    ],
  },
  {
    label: "Sets",
    href: "/shop?category=sets",
    subLinks: [
      { href: "/shop?category=sets&type=lace", label: "Lace Sets" },
      { href: "/shop?category=sets&type=silk", label: "Silk Sets" },
      { href: "/shop?category=sets&type=everyday", label: "Everyday Essentials" },
    ],
  },
  {
    label: "Sleepwear",
    href: "/shop?category=sleepwear",
    subLinks: [
      { href: "/shop?category=sleepwear&type=robes", label: "Silk Robes" },
      { href: "/shop?category=sleepwear&type=pajamas", label: "Pajama Sets" },
      { href: "/shop?category=sleepwear&type=chemises", label: "Chemises & Slips" },
    ],
  },
  { href: "/shop?category=briefs", label: "Briefs" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [expandedCategory, setExpandedCategory] = useState(null);

  const { totalItems, toggleCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { announcementText, announcementVisible } = useSiteSettingsStore();
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
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setExpandedCategory(null);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen, searchOpen]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const toggleAccordion = (label) => {
    setExpandedCategory(expandedCategory === label ? null : label);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 w-full z-50 flex flex-col">
        {announcementVisible && (
          <div className="bg-[#8b4f5c] text-[#f5f0ee] text-center py-2 sm:py-2.5 px-4 text-[10px] sm:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] w-full shadow-md font-semibold sm:font-normal">
            {announcementText}
          </div>
        )}

        <header
          className={`w-full transition-all duration-500 ${isScrolled ? "bg-[#0a0a0a]/95 backdrop-blur-lg shadow-lg border-b border-[#d4a59a]/15" : "bg-[#0a0a0a] border-b border-[#d4a59a]/5"
            }`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <div className="flex items-center justify-between h-16 md:h-20 lg:h-24">

              {/* LEFT SIDE: Hamburger & Desktop Nav */}
              <div className="flex-1 flex items-center justify-start">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden text-[#f5f0ee]/80 hover:text-[#d4a59a] p-1.5 sm:p-2 -ml-1 transition-all hover:scale-110 active:scale-95"
                  aria-label="Open menu"
                >
                  <Menu size={22} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
                </button>

                <nav className="hidden lg:flex items-center gap-8 xl:gap-10 h-full">
                  {NAV_LINKS.slice(0, 3).map((link) => (
                    <div key={link.label} className="h-full flex items-center relative group">
                      <Link
                        to={link.href}
                        className="text-[11px] tracking-[0.2em] uppercase text-[#f5f0ee]/80 group-hover:text-[#d4a59a] transition-colors duration-300 font-['Montserrat'] flex items-center gap-1.5 py-8 relative
                        after:content-[''] after:absolute after:bottom-6 after:left-0 after:w-0 after:h-[1px] after:bg-[#d4a59a] group-hover:after:w-full after:transition-all after:duration-300"
                      >
                        {link.label}
                        {link.subLinks && <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300 text-[#9a8f8c] group-hover:text-[#d4a59a]" />}
                      </Link>
                      {link.subLinks && (
                        <div className="absolute top-[85%] left-0 pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform translate-y-3 group-hover:translate-y-0">
                          <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#d4a59a]/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-5 w-56 flex flex-col gap-4 rounded-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4a59a]/50 to-transparent"></div>
                            {link.subLinks.map((sub) => (
                              <Link
                                key={sub.label}
                                to={sub.href}
                                className="text-[10px] tracking-[0.15em] uppercase text-[#9a8f8c] hover:text-[#d4a59a] hover:translate-x-1 transition-all duration-300 font-['Montserrat'] block"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* CENTER SIDE: Logo */}
              <div className="flex-shrink-0 flex items-center justify-center px-2">
                <Link
                  to="/"
                  className="font-['Cormorant_Garamond'] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold sm:font-medium tracking-[0.1em] sm:tracking-[0.25em] uppercase text-[#f5f0ee] hover:text-[#d4a59a] transition-colors duration-500 whitespace-nowrap"
                >
                  UNDERPURE
                </Link>
              </div>

              {/* RIGHT SIDE: Icons & Desktop Nav */}
              <div className="flex-1 flex items-center justify-end gap-1 sm:gap-4 h-full">
                <nav className="hidden lg:flex items-center gap-8 xl:gap-10 mr-4 h-full">
                  {NAV_LINKS.slice(3).map((link) => (
                    <div key={link.label} className="h-full flex items-center relative group">
                      <Link
                        to={link.href}
                        className="text-[11px] tracking-[0.2em] uppercase text-[#f5f0ee]/80 group-hover:text-[#d4a59a] transition-colors duration-300 font-['Montserrat'] flex items-center gap-1.5 py-8 relative
                        after:content-[''] after:absolute after:bottom-6 after:left-0 after:w-0 after:h-[1px] after:bg-[#d4a59a] group-hover:after:w-full after:transition-all after:duration-300"
                      >
                        {link.label}
                        {link.subLinks && <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300 text-[#9a8f8c] group-hover:text-[#d4a59a]" />}
                      </Link>
                      {link.subLinks && (
                        <div className="absolute top-[85%] right-0 pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform translate-y-3 group-hover:translate-y-0">
                          <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#d4a59a]/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-5 w-56 flex flex-col gap-4 rounded-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4a59a]/50 to-transparent"></div>
                            {link.subLinks.map((sub) => (
                              <Link key={sub.label} to={sub.href} className="text-[10px] tracking-[0.15em] uppercase text-[#9a8f8c] hover:text-[#d4a59a] hover:-translate-x-1 transition-all duration-300 font-['Montserrat'] block text-right">
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                <button onClick={() => setSearchOpen(true)} className="text-[#f5f0ee]/80 hover:text-[#d4a59a] p-1.5 sm:p-2 hover:scale-110 transition-all duration-300">
                  <Search size={20} className="sm:w-5 sm:h-5" strokeWidth={1.5} />
                </button>

                <Link to={isAuthenticated ? "/account" : "/auth"} className="hidden sm:block text-[#f5f0ee]/80 hover:text-[#d4a59a] p-1.5 sm:p-2 hover:scale-110 transition-all duration-300">
                  <User size={20} strokeWidth={1.5} />
                </Link>

                <button onClick={toggleCart} className="text-[#f5f0ee]/80 hover:text-[#d4a59a] relative p-1.5 sm:p-2 hover:scale-110 transition-all duration-300">
                  <ShoppingBag size={20} className="sm:w-5 sm:h-5" strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#d4a59a] text-[#0a0a0a] text-[9px] sm:text-[10px] font-bold flex items-center justify-center font-['Montserrat'] shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </header>
      </div>

      <div className={`w-full ${announcementVisible ? "h-[84px] sm:h-[88px] lg:h-32" : "h-16 md:h-20 lg:h-24"}`}></div>

      {/* ===== MOBILE SIDEBAR MENU (POLISHED) ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#0a0a0a] border-r border-[#d4a59a]/15 z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-8 py-8 border-b border-[#d4a59a]/10 bg-gradient-to-b from-[#111] to-transparent">
                <span className="font-['Cormorant_Garamond'] text-3xl tracking-[0.15em] font-semibold uppercase text-[#d4a59a]">
                  UNDERPURE
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#9a8f8c] hover:text-[#f5f0ee] transition-all hover:rotate-90 duration-300 -mr-2 p-2 bg-[#111] rounded-sm border border-[#d4a59a]/10">
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex flex-col px-8 py-6 gap-6 overflow-y-auto scrollbar-hide flex-1">
                {NAV_LINKS.map((link) => (
                  <div key={link.label} className="w-full">
                    <div className="flex items-center justify-between w-full border-b border-[#d4a59a]/5 pb-2">
                      {/* Main Category: Size reduced from 4xl to 2xl, font-medium */}
                      <Link
                        to={link.href}
                        onClick={() => !link.subLinks && setMobileMenuOpen(false)}
                        className={`text-2xl font-['Cormorant_Garamond'] font-medium transition-all duration-300 ${expandedCategory === link.label ? "text-[#d4a59a] italic" : "text-[#f5f0ee] hover:text-[#d4a59a]"}`}
                      >
                        {link.label}
                      </Link>

                      {link.subLinks && (
                        <button onClick={() => toggleAccordion(link.label)} className="p-3 -mr-3 text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
                          <ChevronDown size={28} strokeWidth={1} className={`transition-transform duration-500 ${expandedCategory === link.label ? "rotate-180 text-[#d4a59a]" : ""}`} />
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {link.subLinks && expandedCategory === link.label && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="flex flex-col gap-5 pl-5 pt-6 pb-4 border-l border-[#d4a59a]/20 ml-3 mt-1 relative bg-gradient-to-r from-[#d4a59a]/5 to-transparent pr-4 rounded-r-sm">
                            <div className="absolute left-[-1px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#d4a59a]/80 to-transparent"></div>

                            {link.subLinks.map((sub) => (
                              <Link
                                key={sub.label} to={sub.href} onClick={() => setMobileMenuOpen(false)}
                                /* Sub-category: Same font family, Size xl/lg, font-medium */
                                className="text-lg sm:text-xl font-['Cormorant_Garamond'] font-medium text-[#9a8f8c] hover:text-[#d4a59a] flex items-center gap-4 transition-all duration-300 hover:translate-x-2 group"
                              >
                                <span className="w-3 h-[1px] bg-[#d4a59a]/40 block transition-all duration-300 group-hover:w-6 group-hover:bg-[#d4a59a]"></span>
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>

              <div className="px-8 pb-10 pt-4 bg-gradient-to-t from-[#111] to-transparent">
                <Link
                  to={isAuthenticated ? "/account" : "/auth"} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between border-t border-[#d4a59a]/20 pt-6 pb-2 group"
                >
                  <span className="text-xs tracking-[0.25em] uppercase text-[#9a8f8c] group-hover:text-[#d4a59a] font-['Montserrat'] font-semibold transition-colors">
                    {isAuthenticated ? "My Account" : "Sign In"}
                  </span>
                  <User size={20} strokeWidth={1} className="text-[#9a8f8c] group-hover:text-[#d4a59a] transition-colors" />
                </Link>

                {user?.isAdmin && (
                  <Link
                    to="/admin" onClick={() => setMobileMenuOpen(false)}
                    className="text-[10px] tracking-[0.25em] uppercase text-[#0a0a0a] bg-[#d4a59a] mt-6 px-6 py-4 text-center font-bold hover:bg-[#f2c6b4] transition-colors block rounded-sm shadow-md"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== SEARCH OVERLAY ===== */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[80] bg-[#0a0a0a]/95 backdrop-blur-xl flex items-start justify-center pt-24 md:pt-32 px-4 sm:px-6 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && closeSearch()}
          >
            <div className="w-full max-w-3xl mb-10">
              <div className="relative">
                <input
                  ref={searchInputRef} autoFocus
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections..."
                  className="w-full bg-transparent border-b border-[#d4a59a]/40 focus:border-[#d4a59a] text-[#f5f0ee] text-3xl sm:text-5xl font-['Cormorant_Garamond'] py-4 outline-none transition-colors pr-12"
                />
                <button onClick={closeSearch} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9a8f8c] hover:text-[#d4a59a] p-2 transition-transform hover:rotate-90 duration-300">
                  <X size={28} md:size={32} strokeWidth={1.5} />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-8 md:mt-10 space-y-4 md:space-y-6 pb-10">
                  {searchResults.map((p) => (
                    <Link key={p.id} to={`/product/${p.slug}`} onClick={closeSearch} className="flex items-center gap-4 md:gap-6 group bg-[#111] md:bg-transparent p-3 md:p-0 rounded-sm md:rounded-none border border-[#d4a59a]/10 md:border-none">
                      <div className="w-16 h-20 md:w-16 md:h-20 bg-[#1a1a1a] overflow-hidden shrink-0 rounded-sm md:rounded-none border border-[#d4a59a]/20 md:border-none"><img src={p.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /></div>
                      <div>
                        <p className="text-[#f5f0ee] font-['Cormorant_Garamond'] text-xl md:text-2xl font-medium md:font-normal group-hover:text-[#d4a59a] transition-colors">{p.name}</p>
                        <p className="text-[10px] text-[#9a8f8c] uppercase tracking-[0.2em] font-semibold md:font-normal mt-1">{p.category}</p>
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