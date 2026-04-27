import { motion, AnimatePresence } from "motion/react";
import { X, Ruler } from "lucide-react";

export function SizeGuideModal({ isOpen, onClose, category }) {
  const isBra = category === "bras" || category === "sets";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[92%] max-w-2xl max-h-[85vh] bg-[#0d0d0d] border border-[#d4a59a]/20 flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#d4a59a]/10 shrink-0">
              <div className="flex items-center gap-3">
                <Ruler size={16} className="text-[#d4a59a]" />
                <p className="text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#f5f0ee]">Size Guide (CM)</p>
              </div>
              <button onClick={onClose} className="text-[#9a8f8c] hover:text-[#f5f0ee] p-1"><X size={20} /></button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <h3 className="font-['Cormorant_Garamond'] text-xl font-light text-[#f5f0ee]">Measurement Chart</h3>
                <div className="overflow-x-auto border border-[#d4a59a]/10 rounded-sm">
                  <table className="w-full text-left text-[10px] sm:text-xs">
                    <thead className="bg-[#111] text-[#d4a59a]">
                      <tr>
                        <th className="p-3 border-b border-[#d4a59a]/10">Size</th>
                        <th className="p-3 border-b border-[#d4a59a]/10">Bust</th>
                        <th className="p-3 border-b border-[#d4a59a]/10">Waist</th>
                        <th className="p-3 border-b border-[#d4a59a]/10">Hips</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#9a8f8c] divide-y divide-[#d4a59a]/5">
                      <tr><td className="p-3">S</td><td className="p-3">83-85cm</td><td className="p-3">64-66cm</td><td className="p-3">89-91cm</td></tr>
                      <tr><td className="p-3">M</td><td className="p-3">87-89cm</td><td className="p-3">68-70cm</td><td className="p-3">93-95cm</td></tr>
                      <tr><td className="p-3">L</td><td className="p-3">91-93cm</td><td className="p-3">72-74cm</td><td className="p-3">97-99cm</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-[#111] p-4 border border-[#d4a59a]/10">
                <p className="text-[10px] text-[#d4a59a] font-['Montserrat'] uppercase tracking-widest mb-2">Pro Tip</p>
                <p className="text-xs text-[#9a8f8c] leading-relaxed font-['Montserrat']">If you are between sizes, we recommend choosing the larger size for a more comfortable fit.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}