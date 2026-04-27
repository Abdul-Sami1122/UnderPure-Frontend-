import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { fetchProducts, fetchWishlist } from "../lib/api";
import { ProductCard } from "../components/shop/ProductCard";
import { useAuthStore } from "../store/authStore";
import { MOCK_PRODUCTS } from "../lib/mockData";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Low to High" },
  { value: "price_desc", label: "High to Low" },
  { value: "rating", label: "Best Rated" },
];

const CATEGORIES = [
  { id: "bras", label: "Bras" },
  { id: "sets", label: "Lingerie Sets" },
  { id: "sleepwear", label: "Sleepwear" },
  { id: "briefs", label: "Briefs & Thongs" },
];

function sortProducts(products, sort) {
  const sorted = [...products];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const { isAuthenticated, token } = useAuthStore();

  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist(token).then(setWishlistedIds).catch(console.error);
    }
  }, [isAuthenticated, token]);

  const setCategory = useCallback(
    (cat) => {
      const params = new URLSearchParams(searchParams);
      if (cat === "all") params.delete("category");
      else params.set("category", cat);
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const setSort = useCallback(
    (s) => {
      const params = new URLSearchParams(searchParams);
      params.set("sort", s);
      setSearchParams(params);
      setSortOpen(false);
    },
    [searchParams, setSearchParams]
  );

  const displayed = sortProducts(
    allProducts.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }),
    sort
  );

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sort)?.label || "Sort";

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#d4a59a]/10 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-14 text-center sm:text-left">
          {search ? (
            <>
              <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-['Montserrat'] mb-2">
                Search results for
              </p>
              <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
                "{search}"
              </h1>
            </>
          ) : (
            <>
              <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-['Montserrat'] mb-2">
                {category === "all" ? "The Full Collection" : CATEGORIES.find((c) => c.id === category)?.label}
              </p>
              <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
                {category === "all" ? "All Pieces" : CATEGORIES.find((c) => c.id === category)?.label}
              </h1>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 border-b border-[#d4a59a]/10 pb-4 sm:pb-6">
          {/* Category filters (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`text-xs tracking-[0.15em] uppercase font-['Montserrat'] transition-colors pb-1 ${category === cat.id ? "text-[#d4a59a] border-b border-[#d4a59a]" : "text-[#9a8f8c] hover:text-[#f5f0ee] border-b border-transparent"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 px-3 py-2 border border-[#d4a59a]/20 rounded-sm text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filters
          </button>

          {/* Results count + Sort */}
          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <span className="text-[10px] sm:text-xs text-[#9a8f8c] font-['Montserrat'] hidden sm:block">
              {displayed.length} {displayed.length === 1 ? "piece" : "pieces"}
            </span>
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-0 py-2 sm:py-0 border sm:border-0 border-[#d4a59a]/20 rounded-sm sm:rounded-none text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.12em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#f5f0ee] transition-colors"
              >
                {currentSortLabel}
                <ChevronDown size={12} className={`sm:w-3.5 sm:h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-[#111] border border-[#d4a59a]/15 z-30 shadow-xl"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs font-['Montserrat'] tracking-wide transition-colors ${sort === opt.value ? "text-[#d4a59a] bg-[#d4a59a]/5" : "text-[#9a8f8c] hover:text-[#f5f0ee] hover:bg-[#1a1a1a]"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-[#141414] animate-pulse" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 sm:py-28 px-4">
            <p className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#f5f0ee]/50 mb-2 sm:mb-3">
              No pieces found
            </p>
            <p className="text-[10px] sm:text-xs text-[#9a8f8c] font-['Montserrat'] mb-6 sm:mb-8">
              Try adjusting your filters or search
            </p>
            <button
              onClick={() => setCategory("all")}
              className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#d4a59a] border border-[#d4a59a]/30 px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-[#d4a59a]/10 transition-colors"
            >
              View All Pieces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {displayed.map((product, i) => (
              <ProductCard key={product.id} product={product} wishlistedIds={wishlistedIds} onWishlistChange={setWishlistedIds} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60" onClick={() => setFiltersOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-[#111] border-r border-[#d4a59a]/10 z-50 flex flex-col"
            >
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#d4a59a]/10">
                <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#f5f0ee]">
                  Filters
                </p>
                <button onClick={() => setFiltersOpen(false)} className="text-[#9a8f8c] hover:text-[#f5f0ee] p-1">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#d4a59a] font-['Montserrat'] mb-3 sm:mb-4">
                  Category
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setCategory("all"); setFiltersOpen(false); }}
                    className={`text-left py-2 text-[10px] sm:text-xs tracking-[0.15em] uppercase font-['Montserrat'] transition-colors ${category === "all" ? "text-[#d4a59a]" : "text-[#9a8f8c] hover:text-[#f5f0ee]"}`}
                  >
                    All Pieces
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategory(cat.id); setFiltersOpen(false); }}
                      className={`text-left py-2 text-[10px] sm:text-xs tracking-[0.15em] uppercase font-['Montserrat'] transition-colors ${category === cat.id ? "text-[#d4a59a]" : "text-[#9a8f8c] hover:text-[#f5f0ee]"}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}