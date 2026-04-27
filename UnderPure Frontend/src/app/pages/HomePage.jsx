import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import { fetchProducts } from "../lib/api";
import { ProductSlider } from "../components/shop/ProductSlider";
import { useSiteSettingsStore } from "../store/siteSettingsStore";
import { MOCK_PRODUCTS } from "../lib/mockData";

const HERO_IMG =
  "https://images.unsplash.com/photo-1762843353166-e0542bba1a66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80";

const CATEGORIES = [
  {
    id: "bras",
    label: "Bras",
    sub: "Support & Elegance",
    image:
      "https://images.unsplash.com/photo-1599839770015-53df36f312a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
  },
  {
    id: "sets",
    label: "Lingerie Sets",
    sub: "Complete Collections",
    image:
      "https://images.unsplash.com/photo-1598719830738-32b91fa649be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
  },
  {
    id: "sleepwear",
    label: "Sleepwear",
    sub: "Dreams in Silk",
    image:
      "https://images.unsplash.com/photo-1750064139819-da3bf362e7b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
  },
  {
    id: "briefs",
    label: "Briefs & Thongs",
    sub: "Effortless Intimacy",
    image:
      "https://images.unsplash.com/photo-1547714062-4daa321e1d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
  },
];

export function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const featuredRef = useRef(null);
  const {
    heroHeadline,
    heroHeadlineItalic,
    heroSubheadline,
    heroBadgeText,
    heroCtaText,
  } = useSiteSettingsStore();

  useEffect(() => {
    fetchProducts()
      .then(setAllProducts)
      .catch(() => {
        setAllProducts(MOCK_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const newArrivals = allProducts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const bestSellers = allProducts
    .filter((p) => p.rating >= 4.7)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 8);

  const topPicks = allProducts
    .filter((p) => p.featured)
    .slice(0, 8);

  const saleItems = allProducts
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 8);

  const braProducts = allProducts.filter((p) => p.category === "bras").slice(0, 8);
  const briefProducts = allProducts.filter((p) => p.category === "briefs").slice(0, 8);
  const setProducts = allProducts.filter((p) => p.category === "sets").slice(0, 8);
  const sleepwearProducts = allProducts.filter((p) => p.category === "sleepwear").slice(0, 8);

  const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#0a0a0a]">
      {/* ===== HERO ===== */}
      <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Velour hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/30 to-[#0a0a0a]/80" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase font-['Montserrat'] mb-4 sm:mb-6"
          >
            {heroBadgeText}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
            className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-[#f5f0ee] leading-[1.1] sm:leading-none tracking-tight mb-4 sm:mb-6"
          >
            {heroHeadline}
            <br />
            <span className="italic text-[#d4a59a]">{heroHeadlineItalic}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="text-[#f5f0ee]/60 text-xs sm:text-sm md:text-base font-['Montserrat'] font-light tracking-wide max-w-xl mx-auto mb-8 sm:mb-10 px-2"
          >
            {heroSubheadline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
          >
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-3 bg-[#d4a59a] text-[#0a0a0a] px-8 py-4 sm:px-10 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors duration-300 w-full sm:w-auto"
            >
              {heroCtaText}
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/shop?category=sets"
              className="inline-flex items-center justify-center gap-3 border border-[#f5f0ee]/30 text-[#f5f0ee]/80 px-8 py-4 sm:px-10 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:border-[#d4a59a] hover:text-[#d4a59a] transition-colors duration-300 w-full sm:w-auto"
            >
              View Sets
            </Link>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.button
          onClick={scrollToFeatured}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 text-[#f5f0ee]/40 hover:text-[#d4a59a] transition-colors flex flex-col items-center gap-1 sm:gap-2"
        >
          <span className="text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] uppercase font-['Montserrat']">
            Explore
          </span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
            <ChevronDown size={14} className="sm:w-4 sm:h-4" strokeWidth={1.5} />
          </motion.div>
        </motion.button>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="overflow-hidden border-y border-[#d4a59a]/10 py-3 sm:py-4 bg-[#0d0d0d]">
        <div className="flex gap-8 sm:gap-12 animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) =>
            ["Handcrafted Luxury", "French Lace", "Mulberry Silk", "Free Returns", "Sustainable Packaging", "New Collection"].map(
              (text) => (
                <span
                  key={`${i}-${text}`}
                  className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#9a8f8c] font-['Montserrat'] flex items-center gap-8 sm:gap-12"
                >
                  {text}
                  <span className="text-[#d4a59a]/30">✦</span>
                </span>
              )
            )
          )}
        </div>
      </div>

      {/* ===== CATEGORIES ===== */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
            Shop by Category
          </p>
          <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
            Our Collections
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link to={`/shop?category=${cat.id}`} className="group relative block overflow-hidden aspect-[3/4] sm:aspect-[2/3]">
                <img
                  src={cat.image} alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-center sm:text-left">
                  <p className="text-[#d4a59a] text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.25em] uppercase font-['Montserrat'] mb-1">
                    {cat.sub}
                  </p>
                  <p className="font-['Cormorant_Garamond'] text-lg sm:text-xl md:text-2xl font-light text-[#f5f0ee] group-hover:text-[#d4a59a] transition-colors duration-300">
                    {cat.label}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 bg-[#d4a59a] w-0 group-hover:w-full transition-all duration-500" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section ref={featuredRef} className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-14 text-center sm:text-left gap-4">
          <div>
            <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
              Just In
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            View All <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] bg-[#141414] animate-pulse" />)}
          </div>
        ) : (
          <ProductSlider products={newArrivals} />
        )}
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto bg-[#0d0d0d]">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-14 text-center sm:text-left gap-4">
          <div>
            <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
              Customer Favorites
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?sort=rating"
            className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            View All <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] bg-[#141414] animate-pulse" />)}
          </div>
        ) : (
          <ProductSlider products={bestSellers} />
        )}
      </section>

      {/* ===== TOP PICKS ===== */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-14 text-center sm:text-left gap-4">
          <div>
            <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
              Editor's Choice
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
              Top Picks
            </h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            View All <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] bg-[#141414] animate-pulse" />)}
          </div>
        ) : (
          <ProductSlider products={topPicks} />
        )}
      </section>

      {/* ===== ON SALE ===== */}
      {saleItems.length > 0 && (
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto bg-[#0d0d0d]">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-14 text-center sm:text-left gap-4">
            <div>
              <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
                Limited Time
              </p>
              <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
                On Sale
              </h2>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
            >
              View All <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
            </Link>
          </div>
          <ProductSlider products={saleItems} />
        </section>
      )}

      {/* ===== FEATURED PRODUCT BANNER ===== */}
      {newArrivals.length > 0 && (
        <section className="py-16 sm:py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={newArrivals[0].image}
              alt="Featured collection"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/80 md:via-[#0a0a0a]/70 to-[#0a0a0a]/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 md:gap-12 items-center text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-3 sm:px-4 py-1.5 bg-[#d4a59a]/10 border border-[#d4a59a]/30 text-[#d4a59a] text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] uppercase font-['Montserrat'] font-semibold mb-4 sm:mb-6">
                New Collection
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-[#f5f0ee] mb-3 sm:mb-4 leading-tight">
                {newArrivals[0].name}
              </h2>
              <p className="text-[#9a8f8c] text-xs sm:text-sm md:text-base leading-relaxed font-['Montserrat'] mb-6 sm:mb-8 max-w-md mx-auto md:mx-0">
                {newArrivals[0].description}
              </p>
              <div className="flex items-baseline justify-center md:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10">
                <span className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#f5f0ee]">
                  £{newArrivals[0].price}
                </span>
                {newArrivals[0].originalPrice && (
                  <span className="font-['Montserrat'] text-base sm:text-lg text-[#9a8f8c] line-through">
                    £{newArrivals[0].originalPrice}
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 sm:gap-4">
                <Link
                  to={`/product/${newArrivals[0].slug}`}
                  className="inline-flex items-center justify-center gap-3 bg-[#d4a59a] text-[#0a0a0a] px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors w-full sm:w-auto"
                >
                  Shop Now <ArrowRight size={14} />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-3 border border-[#f5f0ee]/30 text-[#f5f0ee] px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:border-[#d4a59a] hover:text-[#d4a59a] transition-colors w-full sm:w-auto"
                >
                  View Collection
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <img
                  src={newArrivals[0].image}
                  alt={newArrivals[0].name}
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 w-48 h-48 border border-[#d4a59a]/30" />
                <div className="absolute -top-6 -left-6 w-32 h-32 border border-[#d4a59a]/20" />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== BRAS COLLECTION ===== */}
      {braProducts.length > 0 && (
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-14 text-center sm:text-left gap-4">
            <div>
              <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
                Essential Support
              </p>
              <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
                Bras
              </h2>
            </div>
            <Link to="/shop?category=bras" className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
              View All <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
            </Link>
          </div>
          <ProductSlider products={braProducts} />
        </section>
      )}

      {/* ===== LINGERIE SETS COLLECTION ===== */}
      {setProducts.length > 0 && (
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto bg-[#0d0d0d]">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-14 text-center sm:text-left gap-4">
            <div>
              <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
                Complete Collections
              </p>
              <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee]">
                Lingerie Sets
              </h2>
            </div>
            <Link to="/shop?category=sets" className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
              View All <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
            </Link>
          </div>
          <ProductSlider products={setProducts} />
        </section>
      )}

      {/* ===== CUSTOMER REVIEWS ===== */}
      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
            Testimonials
          </p>
          <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee] mb-3 sm:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-[#9a8f8c] text-xs sm:text-sm font-['Montserrat'] max-w-2xl mx-auto px-2">
            Join thousands of women who have discovered the perfect blend of luxury, comfort, and confidence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              name: "Sophie Laurent",
              location: "Paris, France",
              rating: 5,
              review: "The Silk Balconette Bra is absolutely divine. The quality is exceptional and it fits like a dream. I've never felt more confident and comfortable at the same time.",
              product: "Silk Balconette Bra",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
              productImage: "https://images.unsplash.com/photo-1599839770015-53df36f312a8?w=400&q=80",
            },
            {
              name: "Isabella Martinez",
              location: "Barcelona, Spain",
              rating: 5,
              review: "I bought the Vintage Lace Set for my honeymoon and it exceeded all expectations. The craftsmanship is impeccable and the lace is so delicate. Worth every penny!",
              product: "Vintage Lace Set",
              image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
              productImage: "https://images.unsplash.com/photo-1598719830738-32b91fa649be?w=400&q=80",
            },
            {
              name: "Emma Thompson",
              location: "London, UK",
              rating: 5,
              review: "The Satin Sleep Chemise is pure luxury. The fabric feels amazing against my skin and the fit is perfect. I now own it in three colors!",
              product: "Satin Sleep Chemise",
              image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
              productImage: "https://images.unsplash.com/photo-1770294758971-44fa1eae61a3?w=400&q=80",
            }
          ].map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
              className="border border-[#d4a59a]/10 bg-[#0d0d0d] overflow-hidden group hover:border-[#d4a59a]/30 transition-all flex flex-col"
            >
              <div className="relative h-40 sm:h-48 overflow-hidden shrink-0">
                <img
                  src={review.productImage}
                  alt={review.product}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} size={12} className="text-[#d4a59a] fill-[#d4a59a]" strokeWidth={1} />
                    ))}
                  </div>
                  <p className="text-[#9a8f8c] text-[11px] sm:text-sm leading-relaxed font-['Montserrat'] mb-4">
                    "{review.review}"
                  </p>
                </div>
                <div>
                  <p className="text-[#d4a59a] text-[9px] sm:text-[10px] tracking-[0.15em] uppercase font-['Montserrat'] mb-4">
                    {review.product}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#d4a59a]/10">
                    <img src={review.image} alt={review.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-[#f5f0ee] text-[10px] sm:text-xs font-['Montserrat'] font-medium">{review.name}</p>
                      <p className="text-[#9a8f8c] text-[9px] sm:text-[10px] font-['Montserrat']">{review.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <p className="text-[#9a8f8c] text-xs sm:text-sm font-['Montserrat'] mb-4 sm:mb-6 px-4">
            Join our community of satisfied customers
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-[#d4a59a] text-[#0a0a0a] px-8 sm:px-10 py-3.5 sm:py-4 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors w-[85%] sm:w-auto"
          >
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}