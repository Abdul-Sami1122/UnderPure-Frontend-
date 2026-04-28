import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Lock, CheckCircle, Truck } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { createOrder } from "../lib/api";
import { toast } from "sonner";

// Ab sirf 2 steps bache hain
const STEPS = ["Shipping", "Review"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const { token, user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const sub = subtotal();
  const shipping = sub >= 150 ? 0 : 9.95;
  const total = sub + shipping;

  const [address, setAddress] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United Kingdom",
    email: user?.email || "",
  });

  const setAddr = (k, v) => setAddress((a) => ({ ...a, [k]: v }));

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="text-center w-full max-w-sm">
          <p className="font-['Cormorant_Garamond'] text-3xl sm:text-3xl font-medium sm:font-light text-[#f5f0ee]/60 mb-4 sm:mb-6">
            Your bag is empty
          </p>
          <Link
            to="/shop"
            className="text-xs sm:text-[10px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold sm:font-normal text-[#d4a59a] border border-[#d4a59a]/40 sm:border-[#d4a59a]/30 px-8 sm:px-8 py-4 sm:py-3 hover:bg-[#d4a59a]/10 transition-colors inline-block w-full sm:w-auto rounded-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ===== ORDER CONFIRMED =====
  if (orderPlaced) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
          className="text-center max-w-lg w-full"
        >
          <CheckCircle size={56} strokeWidth={1} className="text-[#d4a59a] mx-auto mb-6 sm:mb-6 sm:w-[52px] sm:h-[52px]" />
          <p className="text-[#d4a59a] text-[11px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-['Montserrat'] font-semibold md:font-normal mb-3 sm:mb-3">
            Order Confirmed
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-4xl md:text-5xl font-medium sm:font-light text-[#f5f0ee] mb-4 sm:mb-5 leading-tight">
            Thank You, {address.firstName || "Guest"}
          </h1>
          <p className="text-[#9a8f8c] text-sm sm:text-sm font-['Montserrat'] leading-relaxed sm:leading-loose mb-4 sm:mb-3 px-2">
            Your order has been placed successfully via Cash on Delivery. We'll send an email confirmation shortly.
          </p>
          <p className="text-[#9a8f8c] text-xs sm:text-[10px] font-['Montserrat'] font-medium sm:font-normal mb-8 sm:mb-10">
            Order reference: <span className="text-[#d4a59a]">#{orderId.slice(-8).toUpperCase()}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
            <Link
              to="/shop"
              className="text-xs sm:text-[10px] tracking-[0.2em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#0a0a0a] bg-[#d4a59a] px-8 py-4 sm:px-8 sm:py-3 hover:bg-[#f2c6b4] transition-colors font-bold w-full sm:w-auto rounded-sm shadow-md"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.firstName || !address.street || !address.city || !address.zip || !address.email) {
      toast.error("Please complete your shipping address and email");
      setStep(0);
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id, productName: i.product.name, productImage: i.product.image,
        size: i.size, color: i.color, quantity: i.quantity, price: i.product.price,
      }));

      // Payment method permanently COD
      const order = await createOrder(token || "guest", {
        items: orderItems, subtotal: sub, shipping, total, shippingAddress: address, paymentMethod: "COD",
      });

      clearCart();
      setOrderId(order.id || "GUEST-" + Math.floor(Math.random() * 1000000));
      setOrderPlaced(true);
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10 md:mb-14 border-b border-[#d4a59a]/10 pb-4 sm:border-none sm:pb-0">
          <Link
            to="/shop"
            className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[10px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold sm:font-normal text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            <ArrowLeft size={16} className="sm:w-[13px] sm:h-[13px]" />
            <span className="hidden sm:inline">Back to Shop</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <p className="font-['Cormorant_Garamond'] text-3xl sm:text-2xl font-medium sm:font-light text-[#f5f0ee]">
            Checkout
          </p>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[#9a8f8c]">
            <Lock size={14} strokeWidth={1.5} className="sm:w-[12px] sm:h-[12px]" />
            <span className="text-[10px] sm:text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold sm:font-normal">Secure</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10 sm:mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer ${i <= step ? "text-[#d4a59a]" : "text-[#9a8f8c]/40"}`}
                onClick={() => i < step && setStep(i)}
              >
                <div
                  className={`w-6 h-6 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-[9px] font-['Montserrat'] font-bold border rounded-sm sm:rounded-none ${
                    i < step ? "border-[#d4a59a] bg-[#d4a59a] text-[#0a0a0a]" : i === step ? "border-[#d4a59a] text-[#d4a59a]" : "border-[#9a8f8c]/20 text-[#9a8f8c]/40"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-[10px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.15em] uppercase font-['Montserrat'] font-semibold sm:font-normal hidden sm:block">
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 sm:w-12 md:w-20 h-px mx-3 sm:mx-3 ${i < step ? "bg-[#d4a59a]/40" : "bg-[#9a8f8c]/15"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-8 sm:gap-10 lg:gap-14">
          
          {/* Order Summary for Mobile */}
          <div className="block lg:hidden order-first">
            <div className="border border-[#d4a59a]/20 sm:border-[#d4a59a]/10 p-5 sm:p-6 bg-[#111] rounded-sm">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[11px] sm:text-[10px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold text-[#f5f0ee]">Order Summary</p>
                <p className="text-sm font-['Montserrat'] font-semibold text-[#d4a59a]">£{total.toFixed(2)}</p>
              </div>
              <div className="space-y-3 mb-4">
                {items.slice(0, 2).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs sm:text-xs font-['Montserrat'] font-medium">
                    <span className="text-[#9a8f8c] max-w-[200px] truncate">{item.product.name} × {item.quantity}</span>
                    <span className="text-[#f5f0ee]">£{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {items.length > 2 && <p className="text-[10px] text-[#9a8f8c] font-['Montserrat'] italic mt-2">+ {items.length - 2} more items</p>}
              </div>
            </div>
          </div>

          {/* Left — form */}
          <div className="order-last lg:order-first">
            <AnimatePresence mode="wait">
              {/* STEP 0: Shipping */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                  <div className="flex justify-between items-end mb-6 sm:mb-7">
                    <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-2xl font-medium sm:font-light text-[#f5f0ee]">Shipping Address</h2>
                    {!user && (
                      <Link to="/auth" state={{ from: "/checkout" }} className="text-[10px] sm:text-[10px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold sm:font-normal text-[#d4a59a] hover:underline">
                        Login for faster checkout
                      </Link>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                    <div className="col-span-1 sm:col-span-2 mb-2 sm:mb-2">
                      <label className="block text-[11px] md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c] mb-2">Email Address</label>
                      <input
                        type="email" value={address.email} onChange={(e) => setAddr("email", e.target.value)}
                        className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-sm md:text-xs font-['Montserrat'] px-4 py-4 md:px-3 md:py-3.5 outline-none transition-colors rounded-sm sm:rounded-none"
                      />
                    </div>

                    {[
                      { key: "firstName", label: "First Name", col: 1 },
                      { key: "lastName", label: "Last Name", col: 1 },
                      { key: "street", label: "Street Address", col: 2 },
                      { key: "city", label: "City", col: 1 },
                      { key: "state", label: "County / State", col: 1 },
                      { key: "zip", label: "Postcode / ZIP", col: 1 },
                      { key: "country", label: "Country", col: 1 },
                    ].map((field) => (
                      <div key={field.key} className={field.col === 2 ? "sm:col-span-2 col-span-1" : "col-span-1"}>
                        <label className="block text-[11px] md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c] mb-2">{field.label}</label>
                        <input
                          type="text" value={address[field.key]} onChange={(e) => setAddr(field.key, e.target.value)}
                          className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-sm md:text-xs font-['Montserrat'] px-4 py-4 md:px-3 md:py-3.5 outline-none transition-colors rounded-sm sm:rounded-none"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (!address.firstName || !address.street || !address.city || !address.zip || !address.email) {
                        toast.error("Please complete your shipping address and email");
                        return;
                      }
                      setStep(1);
                    }}
                    className="mt-8 sm:mt-8 w-full bg-[#d4a59a] text-[#0a0a0a] py-4 sm:py-4 text-xs sm:text-[11px] tracking-[0.25em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-bold sm:font-semibold hover:bg-[#f2c6b4] transition-colors rounded-sm sm:rounded-none shadow-md sm:shadow-none"
                  >
                    Continue to Review
                  </button>
                </motion.div>
              )}

              {/* STEP 1: Review */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-2xl font-medium sm:font-light text-[#f5f0ee] mb-6 sm:mb-7">Review Your Order</h2>

                  {/* COD Info Box */}
                  <div className="border border-[#d4a59a]/30 sm:border-[#d4a59a]/20 bg-[#d4a59a]/10 sm:bg-[#d4a59a]/5 p-5 sm:p-5 mb-5 sm:mb-5 flex items-start gap-4 rounded-sm sm:rounded-none">
                    <Truck size={28} className="text-[#d4a59a] shrink-0 mt-1 sm:w-[24px] sm:h-[24px]" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs sm:text-[11px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#d4a59a] font-bold sm:font-semibold mb-1.5">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-[#9a8f8c] text-xs sm:text-xs font-['Montserrat'] font-medium sm:font-normal leading-relaxed">
                        You have selected Cash on Delivery. Please pay the rider in cash when your order arrives at your doorstep. No advance payment is required.
                      </p>
                    </div>
                  </div>

                  {/* Shipping summary */}
                  <div className="border border-[#d4a59a]/15 sm:border-[#d4a59a]/10 p-5 sm:p-5 mb-5 sm:mb-5 bg-[#0d0d0d] sm:bg-transparent rounded-sm sm:rounded-none">
                    <div className="flex justify-between items-start mb-3 sm:mb-3">
                      <p className="text-[10px] sm:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold sm:font-normal text-[#9a8f8c]">Shipping To</p>
                      <button onClick={() => setStep(0)} className="text-[10px] sm:text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] font-bold sm:font-normal text-[#d4a59a] hover:text-[#f2c6b4] transition-colors">Edit</button>
                    </div>
                    <p className="text-sm sm:text-sm font-['Montserrat'] font-semibold sm:font-normal text-[#f5f0ee] mb-1">{address.firstName} {address.lastName}</p>
                    <p className="text-xs sm:text-xs font-['Montserrat'] text-[#9a8f8c] mb-1">{address.email}</p>
                    <p className="text-xs sm:text-xs font-['Montserrat'] text-[#9a8f8c]">{address.street}, {address.city}, {address.zip}, {address.country}</p>
                  </div>

                  {/* Items summary */}
                  <div className="border border-[#d4a59a]/15 sm:border-[#d4a59a]/10 p-5 sm:p-5 mb-6 sm:mb-7 bg-[#0d0d0d] sm:bg-transparent rounded-sm sm:rounded-none">
                    <p className="text-[10px] sm:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold sm:font-normal text-[#9a8f8c] mb-4 sm:mb-4">Items ({items.length})</p>
                    <div className="space-y-4">
                      {items.map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <img src={item.product.image} alt={item.product.name} className="w-16 h-20 sm:w-14 sm:h-17 object-cover bg-[#141414] flex-shrink-0 rounded-sm sm:rounded-none border border-[#d4a59a]/10" />
                          <div className="flex-1 min-w-0">
                            <p className="font-['Cormorant_Garamond'] text-lg sm:text-sm font-medium text-[#f5f0ee] truncate mb-1">{item.product.name}</p>
                            <p className="text-[10px] sm:text-[10px] text-[#9a8f8c] font-['Montserrat'] font-semibold sm:font-normal truncate">{item.color} · {item.size} · Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm sm:text-sm font-['Montserrat'] font-semibold sm:font-normal text-[#f5f0ee] whitespace-nowrap">£{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-4 mt-6">
                    <button
                      onClick={() => setStep(0)}
                      className="w-full sm:w-auto px-6 py-4 sm:py-4 border border-[#d4a59a]/30 sm:border-[#d4a59a]/20 text-xs sm:text-[11px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold sm:font-normal text-[#f5f0ee] sm:text-[#9a8f8c] hover:text-[#f5f0ee] hover:border-[#d4a59a]/50 transition-colors rounded-sm sm:rounded-none bg-[#111] sm:bg-transparent"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-3 sm:gap-3 bg-[#d4a59a] text-[#0a0a0a] py-4 sm:py-4 text-xs sm:text-[11px] tracking-[0.25em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-bold hover:bg-[#f2c6b4] disabled:opacity-60 transition-colors w-full rounded-sm sm:rounded-none shadow-md sm:shadow-none"
                    >
                      {loading ? "Processing…" : `Confirm Order · £${total.toFixed(2)}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — order summary (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="border border-[#d4a59a]/10 p-6 sticky top-24 bg-[#0d0d0d]">
              <p className="text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-5">Order Summary</p>
              <div className="space-y-3 mb-5">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs font-['Montserrat']">
                    <span className="text-[#9a8f8c] max-w-[180px] truncate">{item.product.name} × {item.quantity}</span>
                    <span className="text-[#f5f0ee]">£{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#d4a59a]/10 pt-4 space-y-2">
                <div className="flex justify-between text-xs font-['Montserrat'] text-[#9a8f8c]">
                  <span>Subtotal</span>
                  <span>£{sub.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-['Montserrat'] text-[#9a8f8c]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Complimentary" : `£${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-['Montserrat'] text-[#f5f0ee] pt-3 border-t border-[#d4a59a]/10">
                  <span className="text-[10px] tracking-[0.1em] uppercase font-semibold">Total to pay</span>
                  <span className="text-base font-semibold">£{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-[#d4a59a]/10 text-center">
                <p className="text-[8px] font-['Montserrat'] text-[#9a8f8c] uppercase tracking-[0.2em] mb-1">Payment Method</p>
                <p className="text-[11px] font-['Montserrat'] text-[#d4a59a] font-semibold">Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}