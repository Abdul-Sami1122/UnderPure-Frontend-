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
            <div className="aspect-[3/4] bg-[#141414] animate-pulse" />
            <div className="space-y-4 sm:space-y-5 pt-4">
              <div className="h-3 w-16 bg-[#141414] animate-pulse" />
              <div className="h-8 sm:h-9 w-3/4 bg-[#141414] animate-pulse" />
              <div className="h-4 sm:h-5 w-20 bg-[#141414] animate-pulse" />
              <div className="h-20 bg-[#141414] animate-pulse" />
              <div className="h-10 bg-[#141414] animate-pulse" />
              <div className="h-12 sm:h-14 bg-[#d4a59a]/20 animate-pulse" />
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
        <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <span className="text-[#9a8f8c]/30 text-[10px] sm:text-xs">/</span>
          <Link to="/shop" className="text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
            Shop
          </Link>
          <span className="text-[#9a8f8c]/30 text-[10px] sm:text-xs">/</span>
          <Link
            to={`/shop?category=${product.category}`}
            className="text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors capitalize"
          >
            {product.category}
          </Link>
          <span className="text-[#9a8f8c]/30 text-[10px] sm:text-xs">/</span>
          <span className="text-[10px] tracking-[0.1em] uppercase font-['Montserrat'] text-[#f5f0ee]/40 truncate max-w-24 sm:max-w-32">
            {product.name}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-20">
          {/* ===== IMAGES ===== */}
          <div>
            <div className="relative overflow-hidden aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] bg-[#141414] mb-3 group">
              <motion.img
                key={imgIdx} src={product.images[imgIdx] || product.image} alt={product.name}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
                className="w-full h-full object-cover"
              />

              {product.badge && (
                <span className={`absolute top-3 sm:top-4 left-3 sm:left-4 text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase px-2 py-1 sm:px-2.5 sm:py-1 font-['Montserrat'] font-semibold z-10 ${product.badge === "SALE" ? "bg-[#8b4f5c] text-[#f5f0ee]" : product.badge === "NEW" ? "bg-[#d4a59a] text-[#0a0a0a]" : "bg-[#f5f0ee]/10 text-[#f5f0ee] backdrop-blur-sm"}`}>
                  {product.badge}
                </span>
              )}

              {product.images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#0a0a0a]/70 text-[#f5f0ee]/60 hover:text-[#d4a59a] md:opacity-0 group-hover:opacity-100 transition-all z-10">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextImg} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#0a0a0a]/70 text-[#f5f0ee]/60 hover:text-[#d4a59a] md:opacity-0 group-hover:opacity-100 transition-all z-10">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {product.images.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {product.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${imgIdx === i ? "bg-[#d4a59a] w-4" : "bg-[#f5f0ee]/30"}`} />
                  ))}
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`w-14 h-16 sm:w-16 sm:h-20 shrink-0 overflow-hidden border-2 transition-all ${imgIdx === i ? "border-[#d4a59a] opacity-100" : "border-transparent opacity-60 hover:opacity-100 hover:border-[#d4a59a]/40"}`}>
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div className="py-2">
            <p className="text-[9px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#9a8f8c] font-['Montserrat'] mb-2 sm:mb-3 capitalize">
              {product.category === "briefs" ? "Briefs & Thongs" : product.category}
            </p>

            <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-medium text-[#f5f0ee] mb-3 sm:mb-4 leading-tight">
              {product.name}
            </h1>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className={s <= Math.round(product.rating) ? "text-[#d4a59a]" : "text-[#3a3a3a]"} fill={s <= Math.round(product.rating) ? "currentColor" : "none"} strokeWidth={1} />
                  ))}
                </div>
                <span className="text-[10px] sm:text-xs text-[#9a8f8c] font-['Montserrat']">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-2 sm:gap-3 mb-5 sm:mb-6">
              <span className="text-xl sm:text-2xl font-['Montserrat'] text-[#f5f0ee]">
                £{product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="font-['Montserrat'] text-sm sm:text-base text-[#9a8f8c] line-through">
                    £{product.originalPrice}
                  </span>
                  {discount && (
                    <span className="text-[10px] sm:text-xs font-['Montserrat'] text-[#8b4f5c] font-semibold">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#9a8f8c] font-['Montserrat'] leading-relaxed sm:leading-loose mb-6 sm:mb-8 border-b border-[#d4a59a]/10 pb-6 sm:pb-8">
              {product.description}
            </p>

            {product.colors.length > 0 && (
              <div className="mb-5 sm:mb-6">
                <p className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#f5f0ee] mb-2 sm:mb-3">
                  Colour: <span className="text-[#d4a59a]">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color} onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-['Montserrat'] tracking-wide border transition-all ${selectedColor === color ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/5" : "border-[#d4a59a]/20 text-[#9a8f8c] hover:border-[#d4a59a]/50 hover:text-[#f5f0ee]"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#f5f0ee]">
                    Size: <span className="text-[#d4a59a]">{selectedSize}</span>
                  </p>
                  <button onClick={() => setSizeGuideOpen(true)} className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
                    <Ruler size={10} strokeWidth={1.5} className="sm:w-[11px] sm:h-[11px]" />
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size} onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] sm:min-w-[52px] px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-['Montserrat'] tracking-wide border transition-all text-center ${selectedSize === size ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/5" : "border-[#d4a59a]/20 text-[#9a8f8c] hover:border-[#d4a59a]/50 hover:text-[#f5f0ee]"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 mb-4">
              <div className="flex items-center border border-[#d4a59a]/20 h-10 sm:h-12">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-2 sm:px-3 h-full text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
                  <Minus size={14} />
                </button>
                <span className="px-3 sm:px-4 h-full flex items-center justify-center text-xs sm:text-sm text-[#f5f0ee] font-['Montserrat'] border-x border-[#d4a59a]/20 min-w-[40px] sm:min-w-[48px] text-center">
                  {quantity}
                </span>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-2 sm:px-3 h-full text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart} disabled={addingToCart || !product.inStock}
                className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-[#d4a59a] text-[#0a0a0a] h-10 sm:h-12 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingToCart ? <span>Adding…</span> : !product.inStock ? <span>Out of Stock</span> : <><ShoppingBag size={14} strokeWidth={1.5} />Add to Bag</>}
              </button>

              <button
                onClick={handleWishlist} disabled={wishlistLoading}
                className={`w-10 sm:w-14 h-10 sm:h-12 flex items-center justify-center border transition-all ${isWishlisted ? "border-[#d4a59a] text-[#d4a59a] bg-[#d4a59a]/5" : "border-[#d4a59a]/20 text-[#9a8f8c] hover:border-[#d4a59a] hover:text-[#d4a59a]"}`}
                aria-label="Save to wishlist"
              >
                <Heart size={16} strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {product.stockCount !== undefined && product.stockCount <= 8 && product.inStock && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] sm:text-xs text-[#8b4f5c] font-['Montserrat'] mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b4f5c] flex-shrink-0" />
                Only {product.stockCount} remaining
              </motion.p>
            )}

            <div className="border-t border-[#d4a59a]/10 pt-5 sm:pt-7 mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: Package, label: "Free Shipping", sub: "Orders over £150" },
                { icon: RotateCcw, label: "Free Returns", sub: "30-day policy" },
                { icon: Shield, label: "Secure Payment", sub: "SSL encrypted", className: "col-span-2 sm:col-span-1" },
              ].map((item) => (
                <div key={item.label} className={`flex flex-col items-center text-center gap-1.5 sm:gap-2 ${item.className || ""}`}>
                  <item.icon size={16} strokeWidth={1.5} className="text-[#d4a59a]" />
                  <p className="text-[8px] sm:text-[9px] tracking-[0.1em] uppercase font-['Montserrat'] text-[#f5f0ee]">
                    {item.label}
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-['Montserrat'] text-[#9a8f8c]">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {product.longDescription && (
          <div className="mt-12 sm:mt-16 md:mt-20 border-t border-[#d4a59a]/10 pt-8 sm:pt-12">
            <div className="max-w-2xl">
              <h3 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee] mb-4 sm:mb-5">
                About This Piece
              </h3>
              <p className="text-[#9a8f8c] text-xs sm:text-sm font-['Montserrat'] leading-relaxed sm:leading-loose">
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