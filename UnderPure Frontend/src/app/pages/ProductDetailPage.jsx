import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import {
  Star,
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Shield,
  Package,
  RotateCcw,
  Ruler,
  Minus,
  Plus,
} from "lucide-react";
import { fetchProduct, addToWishlist, removeFromWishlist } from "../lib/api";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { SizeGuideModal } from "../components/shop/SizeGuideModal";
import { RelatedProducts } from "../components/shop/RelatedProducts";
import { ReviewsSection } from "../components/shop/ReviewsSection";
import { MOCK_PRODUCTS } from "../lib/mockData";

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const { addItem } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setImgIdx(0);
    fetchProduct(slug)
      .then((p) => {
        setProduct(p);
        setSelectedSize(p.sizes[0] || "");
        setSelectedColor(p.colors[0] || "");
      })
      .catch(() => {
        const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
        if (mockProduct) {
          setProduct(mockProduct);
          setSelectedSize(mockProduct.sizes[0] || "");
          setSelectedColor(mockProduct.colors[0] || "");
        } else {
          toast.error("Product not found");
          navigate("/shop");
        }
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    setAddingToCart(true);
    setTimeout(() => {
      addItem(product, selectedSize, selectedColor, quantity);
      toast.success(`Added to your bag — ${selectedSize}, ${selectedColor}`);
      setAddingToCart(false);
    }, 400);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated || !token) {
      toast.error("Please sign in to save to your wishlist");
      return;
    }
    if (!product) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(token, product.id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(token, product.id);
        setIsWishlisted(true);
        toast.success("Saved to wishlist ✦");
      }
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const nextImg = () => product && setImgIdx((i) => (i + 1) % product.images.length);
  const prevImg = () => product && setImgIdx((i) => (i - 1 + product.images.length) % product.images.length);

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-20">
            <div className="aspect-[3/4] bg-[#141414] animate-pulse rounded-sm" />
            <div className="space-y-4 sm:space-y-5 pt-4">
              <div className="h-4 w-24 bg-[#141414] animate-pulse" />
              <div className="h-10 sm:h-9 w-3/4 bg-[#141414] animate-pulse" />
              <div className="h-6 sm:h-5 w-24 bg-[#141414] animate-pulse" />
              <div className="h-24 bg-[#141414] animate-pulse" />
              <div className="h-12 bg-[#141414] animate-pulse" />
              <div className="h-14 sm:h-14 bg-[#d4a59a]/20 animate-pulse rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] font-bold md:font-medium text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            <ArrowLeft size={16} md:size={14} />
            Back
          </button>
          <span className="text-[#9a8f8c]/30 text-xs sm:text-sm">/</span>
          <Link to="/shop" className="text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.15em] uppercase font-['Montserrat'] font-bold md:font-medium text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
            Shop
          </Link>
          <span className="text-[#9a8f8c]/30 text-xs sm:text-sm">/</span>
          <Link
            to={`/shop?category=${product.category}`}
            className="text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.15em] uppercase font-['Montserrat'] font-bold md:font-medium text-[#9a8f8c] hover:text-[#d4a59a] transition-colors capitalize"
          >
            {product.category}
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-20">
          {/* ===== IMAGES ===== */}
          <div>
            <div className="relative overflow-hidden aspect-[4/5] md:aspect-[3/4] bg-[#141414] mb-3 group rounded-sm shadow-xl">
              <motion.img
                key={imgIdx} src={product.images[imgIdx] || product.image} alt={product.name}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
                className="w-full h-full object-cover"
              />

              {product.badge && (
                <span className={`absolute top-4 sm:top-5 left-4 sm:left-5 text-[10px] sm:text-xs tracking-[0.2em] uppercase px-4 py-2 font-['Montserrat'] font-bold z-10 rounded-sm shadow-sm ${product.badge === "SALE" ? "bg-[#8b4f5c] text-[#f5f0ee]" : product.badge === "NEW" ? "bg-[#d4a59a] text-[#0a0a0a]" : "bg-[#f5f0ee]/95 text-[#0a0a0a]"}`}>
                  {product.badge}
                </span>
              )}

              {product.images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-[#0a0a0a]/80 text-[#f5f0ee] md:opacity-0 group-hover:opacity-100 transition-all z-10 rounded-full shadow-lg">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-[#0a0a0a]/80 text-[#f5f0ee] md:opacity-0 group-hover:opacity-100 transition-all z-10 rounded-full shadow-lg">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide mt-4">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`w-20 h-24 shrink-0 overflow-hidden border-2 transition-all rounded-sm ${imgIdx === i ? "border-[#d4a59a] opacity-100" : "border-transparent opacity-60 hover:opacity-100 hover:border-[#d4a59a]/40"}`}>
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div className="py-2">
            <p className="text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#d4a59a] font-['Montserrat'] font-bold md:font-semibold mb-3 sm:mb-4 capitalize">
              {product.category === "briefs" ? "Briefs & Thongs" : product.category}
            </p>

            <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl md:text-6xl font-medium text-[#f5f0ee] mb-4 sm:mb-6 leading-tight">
              {product.name}
            </h1>

            {product.rating > 0 && (
              <div className="flex items-center gap-3 mb-6 sm:mb-6">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} md:size={16} className={s <= Math.round(product.rating) ? "text-[#d4a59a]" : "text-[#3a3a3a]"} fill={s <= Math.round(product.rating) ? "currentColor" : "none"} strokeWidth={1} />
                  ))}
                </div>
                <span className="text-sm sm:text-sm text-[#9a8f8c] font-['Montserrat'] font-medium">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3 sm:gap-4 mb-8 sm:mb-8">
              <span className="text-3xl sm:text-3xl md:text-4xl font-['Montserrat'] font-bold md:font-medium text-[#f5f0ee]">
                £{product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="font-['Montserrat'] text-lg sm:text-lg md:text-xl text-[#9a8f8c] line-through font-medium">
                    £{product.originalPrice}
                  </span>
                  {discount && (
                    <span className="text-xs sm:text-sm md:text-base font-['Montserrat'] text-[#8b4f5c] font-bold bg-[#8b4f5c]/10 px-3 py-1.5 rounded-sm">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-sm sm:text-base md:text-lg text-[#9a8f8c] font-['Montserrat'] leading-relaxed sm:leading-loose mb-8 sm:mb-10 border-b border-[#d4a59a]/10 pb-8 sm:pb-10 font-medium md:font-normal">
              {product.description}
            </p>

            {product.colors.length > 0 && (
              <div className="mb-8 sm:mb-8">
                <p className="text-xs sm:text-sm tracking-[0.2em] uppercase font-['Montserrat'] font-bold md:font-semibold text-[#f5f0ee] mb-4">
                  Colour: <span className="text-[#d4a59a] font-bold ml-1">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color} onClick={() => setSelectedColor(color)}
                      className={`px-5 py-3 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-['Montserrat'] font-bold md:font-medium tracking-wide border transition-all rounded-sm ${selectedColor === color ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/10" : "border-[#d4a59a]/20 text-[#9a8f8c] hover:border-[#d4a59a]/60 hover:text-[#f5f0ee] bg-[#111] md:bg-transparent"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mb-10 sm:mb-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm tracking-[0.2em] uppercase font-['Montserrat'] font-bold md:font-semibold text-[#f5f0ee]">
                    Size: <span className="text-[#d4a59a] font-bold ml-1">{selectedSize}</span>
                  </p>
                  <button onClick={() => setSizeGuideOpen(true)} className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-bold text-[#9a8f8c] hover:text-[#d4a59a] transition-colors border-b border-[#9a8f8c]/30 hover:border-[#d4a59a] pb-0.5">
                    <Ruler size={16} md:size={14} strokeWidth={2} />
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size} onClick={() => setSelectedSize(size)}
                      className={`py-3 sm:py-2.5 text-xs sm:text-sm font-['Montserrat'] font-bold md:font-medium tracking-wide border transition-all text-center rounded-sm ${selectedSize === size ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/10" : "border-[#d4a59a]/20 text-[#9a8f8c] hover:border-[#d4a59a]/60 hover:text-[#f5f0ee] bg-[#111] md:bg-transparent"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FIX: SLIMMER Quantity Selector and Add to Cart Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              
              {/* SLIMMER GRID FOR MOBILE */}
              <div className="grid grid-cols-3 sm:flex sm:items-center border border-[#d4a59a]/30 h-12 sm:h-14 bg-[#111] md:bg-transparent rounded-sm w-full sm:w-auto flex-shrink-0">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex items-center justify-center h-full text-[#9a8f8c] hover:text-[#d4a59a] transition-colors sm:px-5">
                  <Minus size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <span className="flex items-center justify-center h-full text-sm text-[#f5f0ee] font-['Montserrat'] font-bold border-x border-[#d4a59a]/30 sm:min-w-[64px]">
                  {quantity}
                </span>
                <button onClick={() => setQuantity((q) => q + 1)} className="flex items-center justify-center h-full text-[#9a8f8c] hover:text-[#d4a59a] transition-colors sm:px-5">
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>

              {/* SLIMMER BUTTONS */}
              <div className="flex gap-3 sm:gap-4 w-full">
                <button
                  onClick={handleAddToCart} disabled={addingToCart || !product.inStock}
                  className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-[#d4a59a] text-[#0a0a0a] h-12 sm:h-14 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] font-bold hover:bg-[#f2c6b4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm sm:shadow-lg rounded-sm"
                >
                  {addingToCart ? <span>Adding…</span> : !product.inStock ? <span>Out of Stock</span> : <><ShoppingBag size={18} className="sm:w-[20px] sm:h-[20px]" strokeWidth={2} />Add to Bag</>}
                </button>

                <button
                  onClick={handleWishlist} disabled={wishlistLoading}
                  className={`w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center border transition-all rounded-sm shadow-sm ${isWishlisted ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/10" : "border-[#d4a59a]/30 text-[#9a8f8c] bg-[#111] md:bg-transparent hover:border-[#d4a59a] hover:text-[#d4a59a]"}`}
                  aria-label="Save to wishlist"
                >
                  <Heart size={20} md:size={20} strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {product.stockCount !== undefined && product.stockCount <= 8 && product.inStock && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs sm:text-sm text-[#8b4f5c] font-['Montserrat'] font-bold mb-8 flex items-center gap-2 bg-[#8b4f5c]/5 p-3 rounded-sm border border-[#8b4f5c]/20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b4f5c] flex-shrink-0 animate-pulse" />
                Only {product.stockCount} remaining in stock
              </motion.p>
            )}

            <div className="border-t border-[#d4a59a]/15 pt-8 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: Package, label: "Free Shipping", sub: "Orders over £150" },
                { icon: RotateCcw, label: "Free Returns", sub: "30-day policy" },
                { icon: Shield, label: "Secure Payment", sub: "100% encrypted" },
              ].map((item) => (
                <div key={item.label} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2.5 bg-[#111] md:bg-transparent p-4 sm:p-0 rounded-sm border border-[#d4a59a]/5 md:border-none">
                  <item.icon size={24} md:size={22} strokeWidth={1.5} className="text-[#d4a59a] shrink-0" />
                  <div>
                    <p className="text-[11px] sm:text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-bold text-[#f5f0ee] mb-1 sm:mb-0">
                      {item.label}
                    </p>
                    <p className="text-[10px] sm:text-[10px] font-['Montserrat'] text-[#9a8f8c] font-medium sm:font-normal">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {product.longDescription && (
          <div className="mt-16 sm:mt-20 md:mt-28 border-t border-[#d4a59a]/15 pt-12 sm:pt-14 bg-[#0d0d0d] md:bg-transparent p-6 md:p-0 rounded-sm md:rounded-none">
            <div className="max-w-3xl">
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-3xl font-medium text-[#f5f0ee] mb-6 sm:mb-6">
                About This Piece
              </h3>
              <p className="text-[#9a8f8c] text-sm sm:text-base md:text-lg font-['Montserrat'] leading-relaxed sm:leading-loose font-medium md:font-normal">
                {product.longDescription}
              </p>
            </div>
          </div>
        )}

        {product.reviewCount > 0 && <ReviewsSection product={product} />}
        <RelatedProducts currentProductId={product.id} category={product.category} />
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} category={product.category} />
    </div>
  );
}