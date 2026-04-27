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
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#d4a59a]/10 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <ShoppingBag size={18} strokeWidth={1.5} className="text-[#d4a59a]" />
                <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#f5f0ee]">
                  Your Bag
                </span>
                {items.length > 0 && (
                  <span className="text-[10px] sm:text-xs text-[#9a8f8c] font-['Montserrat']">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="text-[#9a8f8c] hover:text-[#f5f0ee] transition-colors p-2 -mr-2"
                aria-label="Close cart"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                  <ShoppingBag size={40} strokeWidth={1} className="text-[#d4a59a]/30 mb-5" />
                  <p className="font-['Cormorant_Garamond'] text-xl font-light text-[#f5f0ee]/60 mb-2">
                    Your bag is empty
                  </p>
                  <p className="text-xs text-[#9a8f8c] font-['Montserrat'] mb-8">
                    Discover our curated collections
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#d4a59a] border border-[#d4a59a]/30 px-6 py-3 hover:bg-[#d4a59a]/10 transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5 py-2">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-[#d4a59a]/10 last:border-0"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-20 sm:w-20 sm:h-24 object-cover bg-[#1a1a1a] flex-shrink-0 rounded-sm sm:rounded-none"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              to={`/product/${item.product.slug}`}
                              onClick={closeCart}
                              className="font-['Cormorant_Garamond'] text-sm sm:text-base font-medium text-[#f5f0ee] hover:text-[#d4a59a] transition-colors leading-tight line-clamp-2 pr-2"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.product.id, item.size, item.color)}
                              className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors flex-shrink-0 p-1 -mr-1 -mt-1"
                              aria-label="Remove item"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-[10px] sm:text-xs text-[#9a8f8c] font-['Montserrat'] mt-1 sm:mt-1.5 truncate">
                            {item.color} · {item.size}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <div className="flex items-center border border-[#d4a59a]/20 h-7 sm:h-8">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                              className="w-7 sm:w-8 h-full flex items-center justify-center text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 sm:w-8 text-center text-[10px] sm:text-xs text-[#f5f0ee] font-['Montserrat'] border-x border-[#d4a59a]/20 flex items-center justify-center h-full">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                              className="w-7 sm:w-8 h-full flex items-center justify-center text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm font-['Montserrat'] text-[#f5f0ee]">
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
              <div className="border-t border-[#d4a59a]/10 px-4 sm:px-6 py-4 sm:py-6 space-y-3 shrink-0 bg-[#111111]">
                <div className="flex justify-between text-xs font-['Montserrat'] text-[#9a8f8c]">
                  <span>Subtotal</span>
                  <span>£{sub.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-['Montserrat'] text-[#9a8f8c]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Complimentary" : `£${shipping.toFixed(2)}`}</span>
                </div>
                {sub < 150 && (
                  <p className="text-[10px] sm:text-xs text-[#d4a59a]/80 font-['Montserrat']">
                    Add £{(150 - sub).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between font-['Montserrat'] text-[#f5f0ee] pt-3 sm:pt-4 mt-2 sm:mt-0 border-t border-[#d4a59a]/10">
                  <span className="text-[10px] sm:text-xs tracking-[0.1em] uppercase font-semibold">Total</span>
                  <span className="text-sm sm:text-base font-medium">£{total.toFixed(2)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 sm:gap-3 w-full bg-[#d4a59a] text-[#0a0a0a] py-3 sm:py-4 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] font-bold hover:bg-[#f2c6b4] transition-colors mt-3 sm:mt-4 shadow-md"
                >
                  Proceed to Checkout
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={closeCart}
                  className="flex items-center justify-center w-full text-[10px] sm:text-xs tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors py-2"
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