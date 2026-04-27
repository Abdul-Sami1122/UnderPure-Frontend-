import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { login, register } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login: storeLogin } = useAuthStore();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || "/account";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const setField = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (mode === "register" && !form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { user, token } = await login(form.email, form.password);
        storeLogin(user, token);
        toast.success(`Welcome back, ${user.name} ✦`);
        const from = location.state?.from || "/account";
        navigate(from, { replace: true });
      } else {
        const { user, token } = await register(form.email, form.password, form.name);
        storeLogin(user, token);
        toast.success(`Welcome to Velour, ${user.name} ✦`);
        navigate("/account", { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen flex">
      {/* Left — decorative */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1770294759013-a5784266a817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=80"
          alt="Velour collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/20 to-[#0a0a0a]/60" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee] italic leading-snug">
            "Beauty is the first test: there is no permanent place in the world for ugly mathematics."
          </p>
          <p className="text-[#d4a59a] text-xs tracking-[0.2em] uppercase font-['Montserrat'] mt-4">
            G. H. Hardy
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="font-['Cormorant_Garamond'] text-3xl font-light tracking-[0.3em] uppercase text-[#f5f0ee] block text-center mb-12 hover:text-[#d4a59a] transition-colors"
          >
            Velour
          </Link>

          {/* Mode toggle */}
          <div className="flex border-b border-[#d4a59a]/15 mb-10">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 pb-3 text-xs tracking-[0.2em] uppercase font-['Montserrat'] transition-colors ${
                  mode === m
                    ? "text-[#d4a59a] border-b-2 border-[#d4a59a] -mb-px"
                    : "text-[#9a8f8c] hover:text-[#f5f0ee]"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {mode === "register" && (
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-sm font-['Montserrat'] px-4 py-3.5 outline-none placeholder-[#9a8f8c]/50 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-sm font-['Montserrat'] px-4 py-3.5 outline-none placeholder-[#9a8f8c]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/60 text-[#f5f0ee] text-sm font-['Montserrat'] px-4 py-3.5 pr-12 outline-none placeholder-[#9a8f8c]/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
                  >
                    {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-[10px] tracking-[0.1em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#d4a59a] text-[#0a0a0a] py-4 text-xs tracking-[0.25em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] disabled:opacity-60 transition-colors mt-2"
              >
                {loading ? (
                  <span>Please wait…</span>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              {mode === "register" && (
                <p className="text-[9px] text-[#9a8f8c]/60 font-['Montserrat'] text-center leading-relaxed">
                  By creating an account you agree to our{" "}
                  <a href="#" className="underline hover:text-[#d4a59a] transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline hover:text-[#d4a59a] transition-colors">
                    Privacy Policy
                  </a>
                  .
                </p>
              )}
            </motion.form>
          </AnimatePresence>

          <div className="mt-10 text-center">
            <p className="text-xs text-[#9a8f8c] font-['Montserrat']">
              {mode === "login" ? "New to Velour?" : "Already a member?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-[#d4a59a] hover:text-[#f2c6b4] transition-colors"
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}