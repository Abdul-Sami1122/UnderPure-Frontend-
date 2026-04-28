import { Link } from "react-router";
import { Heart } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";
import { addToWishlist, removeFromWishlist } from "../../lib/api";

export function ProductCard({ product, wishlistedIds = [], onWishlistChange = () => {} }) {
  const { isAuthenticated, token } = useAuthStore();
  const isWishlisted = wishlistedIds.includes(product.id);

  // Hover image ke liye logic
  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : primaryImage;
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  const handleWishlist = async (e) => {
    e.preventDefault(); 
    if (!isAuthenticated || !token) {
      toast.error("Please sign in to save items");
      return;
    }
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(token, product.id);
        onWishlistChange(wishlistedIds.filter(id => id !== product.id));
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(token, product.id);
        onWishlistChange([...wishlistedIds, product.id]);
        toast.success("Saved to wishlist ✦");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    // Yahan hum ne 'group' ki jagah 'group/card' use kia he (Named Group)
    <div className="group/card flex flex-col relative">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden aspect-[4/5] bg-[#141414] rounded-sm mb-3 md:mb-4 border border-[#d4a59a]/10 group-hover/card:border-[#d4a59a]/30 transition-colors">
        
        {/* SECONDARY IMAGE (Peechay wali image jo hover par nazar aayegi) */}
        <img
          src={secondaryImage}
          alt={`${product.name} alternate view`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover/card:scale-110"
        />

        {/* PRIMARY IMAGE (Jo pehli nazar me show hogi) */}
        <img
          src={primaryImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-[800ms] ease-out group-hover/card:opacity-0 group-hover/card:scale-110"
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-[#0a0a0a]/50 backdrop-blur-sm rounded-full flex items-center justify-center text-[#f5f0ee] hover:bg-[#d4a59a] hover:text-[#0a0a0a] transition-all opacity-100 md:opacity-0 group-hover/card:opacity-100"
          aria-label="Wishlist"
        >
          <Heart size={16} className="sm:w-5 sm:h-5" strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Badge (NEW, SALE etc) */}
        {product.badge && (
          <span className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-10 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 font-['Montserrat'] font-bold rounded-sm shadow-sm ${
            product.badge === "SALE" ? "bg-[#8b4f5c] text-[#f5f0ee]" : 
            product.badge === "NEW" ? "bg-[#d4a59a] text-[#0a0a0a]" : 
            "bg-[#f5f0ee]/95 text-[#0a0a0a]"
          }`}>
            {product.badge}
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex flex-col flex-1 px-1">
        <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] font-semibold mb-1.5 truncate">
          {product.category}
        </p>
        
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-['Cormorant_Garamond'] text-lg sm:text-xl font-medium text-[#f5f0ee] group-hover/card:text-[#d4a59a] transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2.5 sm:gap-3 mt-auto pt-1">
          <span className="text-sm sm:text-base font-['Montserrat'] font-bold text-[#f5f0ee]">
            £{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm font-['Montserrat'] text-[#9a8f8c] line-through font-medium">
              £{product.originalPrice}
            </span>
          )}
          {discount && (
            <span className="text-[10px] sm:text-[11px] font-['Montserrat'] text-[#8b4f5c] font-bold bg-[#8b4f5c]/10 px-2 py-0.5 rounded-sm ml-auto">
              -{discount}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}