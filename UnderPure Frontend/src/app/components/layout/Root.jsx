import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { BackToTop } from "../ui/BackToTop";
import { Toaster } from "sonner";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export function Root() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0a0a] text-[#f5f0ee] flex flex-col">
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main className="flex-1 w-full max-w-[100vw]">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
      <CartDrawer />
      <BackToTop />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            border: "1px solid rgba(212,165,154,0.2)",
            color: "#f5f0ee",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "12px",
            letterSpacing: "0.05em",
          },
        }}
      />
    </div>
  );
}