import { Link } from "react-router";
import { Instagram, Facebook, Mail } from "lucide-react";
import { useState } from "react";
import { useSiteSettingsStore } from "../../store/siteSettingsStore";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const {
    storeName,
    storeEmail,
    footerTagline,
    newsletterTitle,
    newsletterSub,
    instagramUrl,
    facebookUrl,
  } = useSiteSettingsStore();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0d0d0d] border-t border-[#d4a59a]/10">
      {/* Newsletter section */}
      <div className="border-b border-[#d4a59a]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#d4a59a] mb-3 sm:mb-4 font-['Montserrat']">
            The {storeName} Circle
          </p>
          <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl md:text-4xl font-light text-[#f5f0ee] mb-3">
            {newsletterTitle}
          </h3>
          <p className="text-[#9a8f8c] text-xs sm:text-sm max-w-md mx-auto mb-6 sm:mb-8 font-['Montserrat'] leading-relaxed px-2">
            {newsletterSub}
          </p>
          {subscribed ? (
            <p className="text-[#d4a59a] text-sm tracking-[0.1em] font-['Montserrat']">
              ✦ Welcome to the circle
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 sm:gap-0 px-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-transparent border border-[#d4a59a]/20 sm:border-r-0 px-5 py-3 text-sm text-[#f5f0ee] placeholder-[#9a8f8c] focus:outline-none focus:border-[#d4a59a]/50 font-['Montserrat'] w-full"
              />
              <button
                type="submit"
                className="bg-[#d4a59a] text-[#0a0a0a] px-6 py-3 text-xs tracking-[0.2em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors w-full sm:w-auto"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light tracking-[0.3em] uppercase text-[#f5f0ee] mb-4">
              {storeName}
            </p>
            <p className="text-[#9a8f8c] text-xs leading-relaxed mb-6 font-['Montserrat'] max-w-sm">
              {footerTagline}
            </p>
            <div className="flex gap-5">
              <a href={instagramUrl} className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors" aria-label="Instagram">
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a href={facebookUrl} className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors" aria-label="Facebook">
                <Facebook size={20} strokeWidth={1.5} />
              </a>
              <a href={`mailto:${storeEmail}`} className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors" aria-label="Email">
                <Mail size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#f5f0ee] mb-4 sm:mb-5 font-['Montserrat'] font-semibold">
              Shop
            </p>
            <ul className="space-y-3">
              {[
                { to: "/shop", label: "All Pieces" },
                { to: "/shop?category=bras", label: "Bras" },
                { to: "/shop?category=sets", label: "Lingerie Sets" },
                { to: "/shop?category=briefs", label: "Briefs & Thongs" },
                { to: "/shop?category=sleepwear", label: "Sleepwear" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-[#9a8f8c] hover:text-[#d4a59a] transition-colors font-['Montserrat'] tracking-wide inline-block py-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#f5f0ee] mb-4 sm:mb-5 font-['Montserrat'] font-semibold">
              Help
            </p>
            <ul className="space-y-3">
              {["Size Guide", "Shipping & Returns", "Care Instructions", "FAQ", "Contact Us"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-[#9a8f8c] hover:text-[#d4a59a] transition-colors font-['Montserrat'] tracking-wide inline-block py-1">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#f5f0ee] mb-4 sm:mb-5 font-['Montserrat'] font-semibold">
              Maison
            </p>
            <ul className="space-y-3">
              {["Our Story", "Craftsmanship", "Sustainability", "Stockists", "Press"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-[#9a8f8c] hover:text-[#d4a59a] transition-colors font-['Montserrat'] tracking-wide inline-block py-1">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#d4a59a]/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[#9a8f8c] text-[10px] sm:text-xs font-['Montserrat'] tracking-wide">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 items-center">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="text-[10px] sm:text-xs text-[#9a8f8c] hover:text-[#d4a59a] transition-colors font-['Montserrat']">
                {item}
              </a>
            ))}
            <Link
              to="/admin"
              className="text-[10px] sm:text-xs text-[#9a8f8c] hover:text-[#d4a59a] transition-colors font-['Montserrat'] border border-[#d4a59a]/20 px-3 py-1 rounded hover:border-[#d4a59a]/50 mt-2 sm:mt-0"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}