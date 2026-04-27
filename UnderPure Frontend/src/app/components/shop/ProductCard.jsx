import { useState } from "react";
import { Link } from "react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "motion/react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { addToWishlist, removeFromWishlist } from "../../lib/api";
import { toast } from "sonner";

export function ProductCard({ product, wishlistedIds = [], onWishlistChange, index = 0 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [img2Loaded, setImg2Loaded] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { addItem } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();

  const isWishlisted = wishlistedIds.includes(product.id);
  const hasSecondImage = product.images && product.images.length > 1;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes && product.sizes.length > 0) {
      addItem(product, product.sizes[0], product.colors[0] || "Black", 1);
      toast.success(`Added — ${product.sizes[0]}, ${product.colors[0] || "Black"}`);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !token) {
      toast.error("Please sign in to save to your wishlist");
      return;
    }
    setWishlistLoading(true);
    try {
      let newIds;
      if (isWishlisted) {
        newIds = await removeFromWishlist(token, product.id);
        toast.success("Removed from wishlist");
      } else {
        newIds = await addToWishlist(token, product.id);
        toast.success("Saved to wishlist ✦");
      }
      onWishlistChange?.(newIds);
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06 }} className="group">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-[#141414] aspect-[3/4] mb-3 sm:mb-4">
          {!imgLoaded && <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse" />}

          <img
            src={product.image} alt={product.name} onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${hasSecondImage ? "md:group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"} ${imgLoaded ? "opacity-100 scale-100" : "opacity-0"}`}
          />

          {hasSecondImage && (
            <img
              src={product.images[1]} alt={`${product.name} alternate view`} onLoad={() => setImg2Loaded(true)}
              className={`hidden md:block absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 ${img2Loaded ? "" : "invisible"}`}
            />
          )}

          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10">
            {product.badge && (
              <span className={`text-[7px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase px-1.5 py-0.5 sm:px-2.5 sm:py-1 font-['Montserrat'] font-semibold ${product.badge === "SALE" ? "bg-[#8b4f5c] text-[#f5f0ee]" : product.badge === "NEW" ? "bg-[#d4a59a] text-[#0a0a0a]" : "bg-[#f5f0ee]/10 text-[#f5f0ee] backdrop-blur-sm"}`}>
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="text-[7px] sm:text-[9px] tracking-[0.1em] sm:tracking-[0.15em] uppercase px-1.5 py-0.5 sm:px-2.5 sm:py-1 font-['Montserrat'] font-semibold bg-[#8b4f5c] text-[#f5f0ee]">
                −{discount}%
              </span>
            )}
          </div>

          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 z-10 md:opacity-0 group-hover:opacity-100 transition-all duration-300 md:translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist} disabled={wishlistLoading} aria-label="Save to wishlist"
              className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-[#0a0a0a]/85 backdrop-blur-sm border transition-colors ${isWishlisted ? "border-[#d4a59a] text-[#d4a59a]" : "border-[#f5f0ee]/20 text-[#f5f0ee]/70 hover:text-[#d4a59a] hover:border-[#d4a59a]"}`}
            >
              <Heart size={12} className="sm:w-[13px] sm:h-[13px]" strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleQuickAdd} aria-label="Quick add to bag"
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-[#0a0a0a]/85 backdrop-blur-sm border border-[#f5f0ee]/20 text-[#f5f0ee]/70 hover:text-[#d4a59a] hover:border-[#d4a59a] transition-colors"
            >
              <ShoppingBag size={12} className="sm:w-[13px] sm:h-[13px]" strokeWidth={1.5} />
            </button>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a]/92 py-2.5 sm:py-3 text-center text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] text-[#d4a59a] md:opacity-0 group-hover:opacity-100 transition-all duration-300 md:translate-y-full group-hover:translate-y-0 cursor-pointer z-10"
              onClick={handleQuickAdd}
            >
              Quick Add · {product.sizes[0]}
            </div>
          )}
        </div>

        <div>
          <p className="text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#9a8f8c] font-['Montserrat'] mb-1 sm:mb-1.5 capitalize truncate">
            {product.category === "briefs" ? "Briefs & Thongs" : product.category}
          </p>
          <h3 className="font-['Cormorant_Garamond'] text-sm sm:text-base font-medium text-[#f5f0ee] group-hover:text-[#d4a59a] transition-colors leading-tight mb-1.5 sm:mb-2 truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-['Montserrat'] text-xs sm:text-sm text-[#f5f0ee]">£{product.price}</span>
            {product.originalPrice && <span className="font-['Montserrat'] text-[10px] sm:text-xs text-[#9a8f8c] line-through">£{product.originalPrice}</span>}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={8} className={`sm:w-2.5 sm:h-2.5 ${s <= Math.round(product.rating) ? "text-[#d4a59a]" : "text-[#3a3a3a]"}`} fill={s <= Math.round(product.rating) ? "currentColor" : "none"} strokeWidth={1} />
                ))}
              </div>
              <span className="text-[8px] sm:text-[10px] text-[#9a8f8c] font-['Montserrat']">({product.reviewCount})</span>
            </div>
          )}
          {product.colors && product.colors.length > 1 && (
            <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
              {product.colors.slice(0, 4).map((c) => (
                <div
                  key={c} title={c} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-[#d4a59a]/20"
                  style={{
                    background: c.toLowerCase().includes("noir") || c.toLowerCase().includes("black") ? "#111" : c.toLowerCase().includes("ivory") || c.toLowerCase().includes("champagne") ? "#f0e8d8" : c.toLowerCase().includes("blush") || c.toLowerCase().includes("rose") ? "#e8b4a8" : c.toLowerCase().includes("burgundy") || c.toLowerCase().includes("crimson") ? "#6b1f2e" : c.toLowerCase().includes("nude") ? "#d4b898" : "#9a8f8c",
                  }}
                />
              ))}
              {product.colors.length > 4 && <span className="text-[7px] sm:text-[9px] text-[#9a8f8c] font-['Montserrat']">+{product.colors.length - 4}</span>}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}