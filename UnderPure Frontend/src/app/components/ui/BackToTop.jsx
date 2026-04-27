import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-[#1a1a1a] border border-[#d4a59a]/30 text-[#d4a59a] hover:bg-[#d4a59a] hover:text-[#0a0a0a] hover:border-[#d4a59a] transition-all duration-300 flex items-center justify-center shadow-lg shadow-black/40"
          aria-label="Back to top"
        >
          <ArrowUp size={16} strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}