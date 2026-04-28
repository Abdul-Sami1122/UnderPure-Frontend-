import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useCartStore } from "../../store/cartStore";
import { motion, AnimatePresence } from "motion/react";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();
  const sub = subtotal();
  const shipping = sub >= 150 ? 0 : 9.95;
  const total = sub + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.32, 0, 0.32, 1] }}
            className="fixed top-0 right-0 z-[60] h-full w-[90%] max-w-md bg-[#111111] border-l border-[#d4a59a]/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-5 sm:py-5 border-b border-[#d4a59a]/10 shrink-0">
              <div className="flex items-center gap-3 sm:gap-3">
                <ShoppingBag size={20} strokeWidth={1.5} className="text-[#d4a59a] sm:w-[18px] sm:h-[18px]" />
                <span className="text-sm sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold sm:font-medium text-[#f5f0ee]">
                  Your Bag
                </span>
                {items.length > 0 && (
                  <span className="text-xs sm:text-[10px] text-[#9a8f8c] font-['Montserrat'] font-medium">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="text-[#9a8f8c] hover:text-[#d4a59a] transition-all hover:rotate-90 duration-300 p-2 -mr-2"
                aria-label="Close cart"
              >
                <X size={24} strokeWidth={1.5} className="sm:w-[20px] sm:h-[20px]" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                  <ShoppingBag size={48} strokeWidth={1} className="text-[#d4a59a]/30 mb-5 sm:w-[40px] sm:h-[40px]" />
                  <p className="font-['Cormorant_Garamond'] text-2xl sm:text-xl font-medium sm:font-light text-[#f5f0ee]/80 sm:text-[#f5f0ee]/60 mb-2">
                    Your bag is empty
                  </p>
                  <p className="text-sm sm:text-xs text-[#9a8f8c] font-['Montserrat'] mb-8">
                    Discover our curated collections
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="text-xs sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-bold sm:font-semibold text-[#d4a59a] border border-[#d4a59a]/40 sm:border-[#d4a59a]/30 px-8 py-4 sm:px-6 sm:py-3 hover:bg-[#d4a59a]/10 transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-5 sm:space-y-5 py-2">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex gap-4 sm:gap-4 pb-5 sm:pb-5 border-b border-[#d4a59a]/15 sm:border-[#d4a59a]/10 last:border-0"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-24 sm:w-20 sm:h-24 object-cover bg-[#1a1a1a] flex-shrink-0 rounded-sm sm:rounded-none shadow-sm"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              to={`/product/${item.product.slug}`}
                              onClick={closeCart}
                              className="font-['Cormorant_Garamond'] text-xl sm:text-lg font-medium text-[#f5f0ee] hover:text-[#d4a59a] transition-colors leading-tight line-clamp-2 pr-2"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.product.id, item.size, item.color)}
                              className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors flex-shrink-0 p-1.5 sm:p-1 -mr-1.5 sm:-mr-1 -mt-1"
                              aria-label="Remove item"
                            >
                              <X size={18} className="sm:w-[16px] sm:h-[16px]" />
                            </button>
                          </div>
                          <p className="text-xs sm:text-[11px] text-[#9a8f8c] font-['Montserrat'] font-medium mt-1.5 sm:mt-1.5 truncate">
                            {item.color} · {item.size}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3 sm:mt-3">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-[#d4a59a]/30 sm:border-[#d4a59a]/20 h-9 sm:h-8 rounded-sm sm:rounded-none">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                              className="w-9 sm:w-8 h-full flex items-center justify-center text-[#f5f0ee] sm:text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
                            >
                              <Minus size={14} className="sm:w-[12px] sm:h-[12px]" />
                            </button>
                            <span className="w-8 sm:w-8 text-center text-sm sm:text-xs text-[#f5f0ee] font-['Montserrat'] font-semibold sm:font-medium border-x border-[#d4a59a]/30 sm:border-[#d4a59a]/20 flex items-center justify-center h-full">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                              className="w-9 sm:w-8 h-full flex items-center justify-center text-[#f5f0ee] sm:text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
                            >
                              <Plus size={14} className="sm:w-[12px] sm:h-[12px]" />
                            </button>
                          </div>
                          {/* Price */}
                          <p className="text-base sm:text-sm font-['Montserrat'] font-semibold sm:font-medium text-[#f5f0ee]">
                            £{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with totals */}
            {items.length > 0 && (
              <div className="border-t border-[#d4a59a]/20 sm:border-[#d4a59a]/10 px-4 sm:px-6 py-6 sm:py-6 space-y-3 sm:space-y-3 shrink-0 bg-[#111111]">
                <div className="flex justify-between text-sm sm:text-xs font-['Montserrat'] font-medium text-[#9a8f8c]">
                  <span>Subtotal</span>
                  <span>£{sub.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-xs font-['Montserrat'] font-medium text-[#9a8f8c]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Complimentary" : `£${shipping.toFixed(2)}`}</span>
                </div>
                {sub < 150 && (
                  <p className="text-xs sm:text-[10px] text-[#d4a59a] font-['Montserrat'] font-semibold">
                    Add £{(150 - sub).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between font-['Montserrat'] text-[#f5f0ee] pt-4 sm:pt-4 mt-2 sm:mt-0 border-t border-[#d4a59a]/20 sm:border-[#d4a59a]/10">
                  <span className="text-xs sm:text-[11px] tracking-[0.15em] uppercase font-bold sm:font-semibold">Total</span>
                  <span className="text-xl sm:text-lg font-bold sm:font-medium">£{total.toFixed(2)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-3 sm:gap-2 w-full bg-[#d4a59a] text-[#0a0a0a] py-4 sm:py-4 text-xs sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-bold hover:bg-[#f2c6b4] transition-colors mt-4 sm:mt-4 shadow-lg sm:shadow-none"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} className="sm:w-[14px] sm:h-[14px]" />
                </Link>
                <button
                  onClick={closeCart}
                  className="flex items-center justify-center w-full text-xs sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] font-medium text-[#9a8f8c] hover:text-[#d4a59a] transition-colors py-3 sm:py-2"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}