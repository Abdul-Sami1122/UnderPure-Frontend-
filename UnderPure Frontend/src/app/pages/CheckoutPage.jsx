import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { createOrder } from "../lib/api";
import { toast } from "sonner";

const STEPS = ["Shipping", "Payment", "Review"];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const { isAuthenticated, token, user } = useAuthStore();
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
  });

  const [paymentMethod] = useState("card");
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  const setAddr = (k, v) => setAddress((a) => ({ ...a, [k]: v }));
  const setCard = (k, v) => setCardForm((c) => ({ ...c, [k]: v }));

  if (!isAuthenticated) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="text-center w-full max-w-sm">
          <p className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#f5f0ee]/60 mb-4 sm:mb-6">
            Please sign in to checkout
          </p>
          <Link
            to="/auth"
            state={{ from: "/checkout" }}
            className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#d4a59a] border border-[#d4a59a]/30 px-6 sm:px-8 py-3 hover:bg-[#d4a59a]/10 transition-colors inline-block w-full sm:w-auto"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="text-center w-full max-w-sm">
          <p className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#f5f0ee]/60 mb-4 sm:mb-6">
            Your bag is empty
          </p>
          <Link
            to="/shop"
            className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#d4a59a] border border-[#d4a59a]/30 px-6 sm:px-8 py-3 hover:bg-[#d4a59a]/10 transition-colors inline-block w-full sm:w-auto"
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
          <CheckCircle size={48} strokeWidth={1} className="text-[#d4a59a] mx-auto mb-5 sm:mb-6 sm:w-[52px] sm:h-[52px]" />
          <p className="text-[#d4a59a] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-['Montserrat'] mb-2 sm:mb-3">
            Order Confirmed
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-light text-[#f5f0ee] mb-4 sm:mb-5 leading-tight">
            Thank You, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-[#9a8f8c] text-xs sm:text-sm font-['Montserrat'] leading-relaxed sm:leading-loose mb-3 px-2">
            Your order has been placed and is being prepared with care.
          </p>
          <p className="text-[#9a8f8c] text-[10px] sm:text-xs font-['Montserrat'] mb-8 sm:mb-10">
            Order reference: <span className="text-[#d4a59a]">#{orderId.slice(-8).toUpperCase()}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
            <Link
              to="/account/orders"
              className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#0a0a0a] bg-[#d4a59a] px-6 py-3.5 sm:px-8 sm:py-4 hover:bg-[#f2c6b4] transition-colors font-semibold w-full sm:w-auto"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] border border-[#d4a59a]/30 px-6 py-3.5 sm:px-8 sm:py-4 hover:text-[#d4a59a] hover:border-[#d4a59a] transition-colors w-full sm:w-auto"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!token) return;
    if (!address.firstName || !address.street || !address.city || !address.zip) {
      toast.error("Please complete your shipping address");
      setStep(0);
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id, productName: i.product.name, productImage: i.product.image,
        size: i.size, color: i.color, quantity: i.quantity, price: i.product.price,
      }));

      const order = await createOrder(token, {
        items: orderItems, subtotal: sub, shipping, total, shippingAddress: address, paymentMethod,
      });

      clearCart();
      setOrderId(order.id);
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
            className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
          >
            <ArrowLeft size={12} className="sm:w-[13px] sm:h-[13px]" />
            <span className="hidden sm:inline">Back to Shop</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <p className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee]">
            Checkout
          </p>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[#9a8f8c]">
            <Lock size={10} strokeWidth={1.5} className="sm:w-[12px] sm:h-[12px]" />
            <span className="text-[8px] sm:text-[9px] tracking-[0.15em] uppercase font-['Montserrat']">Secure</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8 sm:mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer ${i <= step ? "text-[#d4a59a]" : "text-[#9a8f8c]/40"}`}
                onClick={() => i < step && setStep(i)}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[8px] sm:text-[9px] font-['Montserrat'] font-semibold border ${i < step ? "border-[#d4a59a] bg-[#d4a59a] text-[#0a0a0a]" : i === step ? "border-[#d4a59a] text-[#d4a59a]" : "border-[#9a8f8c]/20 text-[#9a8f8c]/40"
                    }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-[8px] sm:text-[9px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-['Montserrat'] hidden sm:block">
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-12 md:w-20 h-px mx-2 sm:mx-3 ${i < step ? "bg-[#d4a59a]/40" : "bg-[#9a8f8c]/15"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-8 sm:gap-10 lg:gap-14">

          {/* Order Summary for Mobile (Shows above form on small screens) */}
          <div className="block lg:hidden order-first">
            <div className="border border-[#d4a59a]/10 p-4 sm:p-6 bg-[#111]">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#f5f0ee]">Order Summary</p>
                <p className="text-xs font-['Montserrat'] text-[#d4a59a]">£{total.toFixed(2)}</p>
              </div>
              <div className="space-y-3 mb-4">
                {items.slice(0, 2).map((item, i) => (
                  <div key={i} className="flex justify-between text-[10px] sm:text-xs font-['Montserrat']">
                    <span className="text-[#9a8f8c] max-w-[200px] truncate">{item.product.name} × {item.quantity}</span>
                    <span className="text-[#f5f0ee]">£{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {items.length > 2 && <p className="text-[10px] text-[#9a8f8c] font-['Montserrat'] italic">+ {items.length - 2} more items</p>}
              </div>
            </div>
          </div>

          {/* Left — form */}
          <div className="order-last lg:order-first">
            {/* STEP 0: Shipping */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee] mb-5 sm:mb-7">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      <label className="block text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-1.5 sm:mb-2">{field.label}</label>
                      <input
                        type="text" value={address[field.key]} onChange={(e) => setAddr(field.key, e.target.value)}
                        className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-xs sm:text-sm font-['Montserrat'] px-3 py-3 sm:px-4 sm:py-3.5 outline-none transition-colors rounded-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="mt-6 sm:mt-8 w-full bg-[#d4a59a] text-[#0a0a0a] py-3.5 sm:py-4 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee] mb-5 sm:mb-7">Payment Details</h2>
                <div className="border border-[#d4a59a]/10 p-4 sm:p-5 mb-4 sm:mb-5 bg-[#111]">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <Lock size={10} strokeWidth={1.5} className="text-[#d4a59a] sm:w-[12px] sm:h-[12px]" />
                    <span className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">Secure Card Payment</span>
                  </div>
                  <p className="text-[8px] sm:text-[9px] font-['Montserrat'] text-[#9a8f8c]/60">This is a prototype — no real payment is processed.</p>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-1.5 sm:mb-2">Card Number</label>
                    <input
                      type="text" value={cardForm.number} onChange={(e) => setCard("number", e.target.value)}
                      placeholder="4242 4242 4242 4242" maxLength={19}
                      className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-xs sm:text-sm font-['Montserrat'] px-3 py-3 sm:px-4 sm:py-3.5 outline-none placeholder-[#9a8f8c]/40 transition-colors rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-1.5 sm:mb-2">Name on Card</label>
                    <input
                      type="text" value={cardForm.name} onChange={(e) => setCard("name", e.target.value)}
                      placeholder="As it appears on your card"
                      className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-xs sm:text-sm font-['Montserrat'] px-3 py-3 sm:px-4 sm:py-3.5 outline-none placeholder-[#9a8f8c]/40 transition-colors rounded-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-1.5 sm:mb-2">Expiry</label>
                      <input
                        type="text" value={cardForm.expiry} onChange={(e) => setCard("expiry", e.target.value)}
                        placeholder="MM / YY" maxLength={7}
                        className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-xs sm:text-sm font-['Montserrat'] px-3 py-3 sm:px-4 sm:py-3.5 outline-none placeholder-[#9a8f8c]/40 transition-colors rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-1.5 sm:mb-2">CVC</label>
                      <input
                        type="text" value={cardForm.cvc} onChange={(e) => setCard("cvc", e.target.value)}
                        placeholder="•••" maxLength={4}
                        className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-xs sm:text-sm font-['Montserrat'] px-3 py-3 sm:px-4 sm:py-3.5 outline-none placeholder-[#9a8f8c]/40 transition-colors rounded-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    onClick={() => setStep(0)}
                    className="w-full sm:w-auto px-6 py-3.5 sm:py-4 border border-[#d4a59a]/20 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#f5f0ee] hover:border-[#d4a59a]/50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-[#d4a59a] text-[#0a0a0a] py-3.5 sm:py-4 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors w-full"
                  >
                    Review Order
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light text-[#f5f0ee] mb-5 sm:mb-7">Review Your Order</h2>

                {/* Shipping summary */}
                <div className="border border-[#d4a59a]/10 p-4 sm:p-5 mb-4 sm:mb-5">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <p className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">Shipping To</p>
                    <button onClick={() => setStep(0)} className="text-[8px] sm:text-[9px] tracking-[0.1em] uppercase font-['Montserrat'] text-[#d4a59a] hover:text-[#f2c6b4] transition-colors">Edit</button>
                  </div>
                  <p className="text-xs sm:text-sm font-['Montserrat'] text-[#f5f0ee]">{address.firstName} {address.lastName}</p>
                  <p className="text-[10px] sm:text-xs font-['Montserrat'] text-[#9a8f8c]">{address.street}, {address.city}, {address.zip}, {address.country}</p>
                </div>

                {/* Items summary */}
                <div className="border border-[#d4a59a]/10 p-4 sm:p-5 mb-5 sm:mb-7">
                  <p className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-3 sm:mb-4">Items ({items.length})</p>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <img src={item.product.image} alt={item.product.name} className="w-12 h-14 sm:w-14 sm:h-17 object-cover bg-[#141414] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-['Cormorant_Garamond'] text-xs sm:text-sm font-medium text-[#f5f0ee] truncate">{item.product.name}</p>
                          <p className="text-[9px] sm:text-[10px] text-[#9a8f8c] font-['Montserrat'] truncate">{item.color} · {item.size} · Qty {item.quantity}</p>
                        </div>
                        <p className="text-xs sm:text-sm font-['Montserrat'] text-[#f5f0ee] whitespace-nowrap">£{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-6 py-3.5 sm:py-4 border border-[#d4a59a]/20 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#f5f0ee] hover:border-[#d4a59a]/50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-[#d4a59a] text-[#0a0a0a] py-3.5 sm:py-4 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] disabled:opacity-60 transition-colors w-full"
                  >
                    {loading ? "Placing Order…" : `Place Order · £${total.toFixed(2)}`}
                    {!loading && <Lock size={10} className="sm:w-[12px] sm:h-[12px]" />}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right — order summary (Desktop Only - hidden on mobile as it's shown above) */}
          <div className="hidden lg:block">
            <div className="border border-[#d4a59a]/10 p-6 sticky top-24">
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
                  <span className="text-xs tracking-[0.1em] uppercase">Total</span>
                  <span className="text-base">£{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}