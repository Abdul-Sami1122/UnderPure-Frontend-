import { useState } from "react";
import { Plus, Trash2, Copy, Tag, Clock, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const INITIAL_CODES = [
  { id: "d1", code: "WELCOME15", type: "percent", value: 15, minOrder: 0, uses: 142, maxUses: null, active: true, expires: null, createdAt: "2025-09-01" },
  { id: "d2", code: "SPRING26", type: "percent", value: 20, minOrder: 100, uses: 89, maxUses: 200, active: true, expires: "2026-06-30", createdAt: "2026-03-01" },
  { id: "d3", code: "VIP50", type: "fixed", value: 50, minOrder: 200, uses: 23, maxUses: 50, active: true, expires: "2026-12-31", createdAt: "2026-01-15" },
  { id: "d4", code: "SUMMER25", type: "percent", value: 25, minOrder: 150, uses: 312, maxUses: 300, active: false, expires: "2025-09-01", createdAt: "2025-06-01" },
];

const EMPTY_FORM = {
  code: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  maxUses: null,
  active: true,
  expires: null,
};

const INPUT_CLS =
  "w-full bg-[#1a1a1a] md:bg-[#0a0a0a] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-sm md:text-xs font-['Montserrat'] px-4 py-3.5 md:px-3 md:py-2.5 outline-none transition-colors placeholder-[#9a8f8c]/50 rounded-sm md:rounded-none";
const LABEL_CLS =
  "block text-[11px] md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c] mb-2";

function Field({ label, children }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  );
}

export function AdminPromotions() {
  const [codes, setCodes] = useState(INITIAL_CODES);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState(null);

  const setField = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = () => {
    if (!form.code.trim()) {
      toast.error("Please enter a code");
      return;
    }
    if (codes.find((c) => c.code.toUpperCase() === form.code.toUpperCase())) {
      toast.error("Code already exists");
      return;
    }
    const newCode = {
      id: `d${Date.now()}`,
      ...form,
      code: form.code.toUpperCase().replace(/\s+/g, ""),
      uses: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCodes((prev) => [newCode, ...prev]);
    setModalOpen(false);
    setForm({ ...EMPTY_FORM });
    toast.success(`Discount code ${newCode.code} created`);
  };

  const handleToggle = (id) => {
    setCodes((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
    toast.success("Code status updated");
  };

  const handleDelete = (id) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
    toast.success("Code deleted");
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => { });
    toast.success(`Copied: ${code}`);
  };

  const activeCodes = codes.filter((c) => c.active);
  const totalUses = codes.reduce((s, c) => s + c.uses, 0);

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-0">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-3xl font-medium md:font-light text-[#f5f0ee]">Promotions</h1>
          <p className="text-[#9a8f8c] text-sm md:text-xs font-['Montserrat'] mt-2 md:mt-1">
            {codes.length} discount codes · {activeCodes.length} active
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#d4a59a] text-[#0a0a0a] px-6 py-4 md:px-5 md:py-2.5 text-xs md:text-xs tracking-[0.2em] md:tracking-[0.15em] uppercase font-['Montserrat'] font-bold md:font-semibold hover:bg-[#f2c6b4] transition-colors rounded-sm md:rounded-none w-full md:w-auto shadow-md md:shadow-none"
        >
          <Plus size={18} md:size={14} strokeWidth={2} />
          New Code
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 md:mb-8">
        {[
          { label: "Active Codes", value: activeCodes.length, icon: CheckCircle, color: "text-green-400" },
          { label: "Total Uses", value: totalUses, icon: Tag, color: "text-[#d4a59a]" },
          { label: "Expiring Soon", value: codes.filter((c) => c.expires && new Date(c.expires) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length, icon: Clock, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="border border-[#d4a59a]/15 md:border-[#d4a59a]/10 bg-[#0d0d0d] p-5 md:p-4 rounded-sm md:rounded-none shadow-sm md:shadow-none">
            <s.icon size={20} md:size={14} strokeWidth={1.5} className={`${s.color} mb-3 md:mb-2`} />
            <p className="font-['Cormorant_Garamond'] text-4xl md:text-2xl font-medium md:font-light text-[#f5f0ee] mb-1">{s.value}</p>
            <p className="text-[10px] md:text-[8px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ====== MOBILE VIEW (Cards View) ====== */}
      <div className="md:hidden space-y-4">
        {codes.map((code) => {
          const isExpired = code.expires && new Date(code.expires) < new Date();
          const isMaxed = code.maxUses !== null && code.uses >= code.maxUses;
          
          return (
            <div key={code.id} className="bg-[#0d0d0d] border border-[#d4a59a]/15 p-5 rounded-sm shadow-sm relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono font-bold text-[#d4a59a] bg-[#d4a59a]/10 px-3 py-1 rounded-sm border border-[#d4a59a]/20">
                    {code.code}
                  </code>
                  <button onClick={() => handleCopy(code.code)} className="text-[#9a8f8c] hover:text-[#d4a59a] bg-[#111] p-1.5 rounded-sm border border-[#d4a59a]/20 transition-colors">
                    <Copy size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <button
                  onClick={() => handleToggle(code.id)}
                  className={`text-[9px] tracking-[0.15em] uppercase font-['Montserrat'] font-bold px-3 py-1.5 rounded-sm transition-colors ${
                    code.active && !isExpired && !isMaxed
                      ? "text-green-400 bg-green-400/10 border border-green-400/20"
                      : "text-[#9a8f8c] bg-[#9a8f8c]/10 border border-[#9a8f8c]/20"
                  }`}
                >
                  {code.active && !isExpired && !isMaxed ? "Active" : "Inactive"}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 bg-[#111] p-3 rounded-sm border border-[#d4a59a]/5">
                <div>
                  <p className="text-[10px] uppercase font-['Montserrat'] text-[#9a8f8c] mb-1">Discount</p>
                  <p className="text-sm font-['Montserrat'] text-[#f5f0ee] font-semibold">{code.type === "percent" ? `${code.value}%` : `£${code.value}`} OFF</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-['Montserrat'] text-[#9a8f8c] mb-1">Uses</p>
                  <p className="text-sm font-['Montserrat'] text-[#f5f0ee] font-semibold">
                    {code.uses}{code.maxUses !== null ? ` / ${code.maxUses}` : ""}
                    {isMaxed && <span className="ml-1 text-[9px] text-red-400">MAX</span>}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-[#d4a59a]/10">
                <p className="text-[10px] font-['Montserrat'] text-[#9a8f8c]">
                  {code.expires ? <span className={isExpired ? "text-red-400 font-semibold" : ""}>Expires: {new Date(code.expires).toLocaleDateString("en-GB")}</span> : "No Expiry"}
                </p>
                <button onClick={() => setDeleteId(code.id)} className="text-[#9a8f8c] hover:text-red-400 transition-colors p-2 bg-[#111] rounded-sm border border-red-500/20">
                  <Trash2 size={16} strokeWidth={1.5} className="text-red-400/70" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====== DESKTOP VIEW (Table View) ====== */}
      <div className="hidden md:block border border-[#d4a59a]/10 overflow-hidden bg-[#0d0d0d]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d4a59a]/10 bg-[#0a0a0a]">
              {["Code", "Discount", "Min. Order", "Uses", "Expires", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4a59a]/10">
            {codes.map((code) => {
              const isExpired = code.expires && new Date(code.expires) < new Date();
              const isMaxed = code.maxUses !== null && code.uses >= code.maxUses;
              return (
                <tr key={code.id} className="hover:bg-[#d4a59a]/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-[#d4a59a] bg-[#d4a59a]/10 px-2 py-0.5 font-semibold">
                        {code.code}
                      </code>
                      <button onClick={() => handleCopy(code.code)} className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors">
                        <Copy size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#f5f0ee]">
                    {code.type === "percent" ? `${code.value}%` : `£${code.value}`} off
                  </td>
                  <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#9a8f8c]">
                    {code.minOrder > 0 ? `£${code.minOrder}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#f5f0ee]">
                    {code.uses}{code.maxUses !== null ? ` / ${code.maxUses}` : ""}
                    {isMaxed && <span className="ml-2 text-[8px] text-red-400 font-['Montserrat'] font-bold">MAXED</span>}
                  </td>
                  <td className="px-4 py-3 text-[10px] font-['Montserrat'] text-[#9a8f8c]">
                    {code.expires
                      ? <span className={isExpired ? "text-red-400 font-medium" : ""}>{new Date(code.expires).toLocaleDateString("en-GB")}{isExpired && " (expired)"}</span>
                      : "Never"
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(code.id)}
                      className={`text-[8px] tracking-[0.12em] uppercase font-['Montserrat'] font-semibold px-2 py-1 transition-colors rounded-sm ${code.active && !isExpired && !isMaxed
                          ? "text-green-400 bg-green-400/10 hover:bg-green-400/20 border border-green-400/20"
                          : "text-[#9a8f8c] bg-[#9a8f8c]/10 hover:bg-[#9a8f8c]/20 border border-[#9a8f8c]/20"
                        }`}
                    >
                      {code.active && !isExpired && !isMaxed ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteId(code.id)} className="text-[#9a8f8c] hover:text-red-400 transition-colors p-1.5 bg-[#111] hover:bg-red-400/10 rounded-sm border border-[#d4a59a]/10">
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ====== Create Modal (Responsive) ====== */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-md bg-[#111] border-t md:border border-[#d4a59a]/15 z-50 rounded-t-xl md:rounded-none max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-5 md:py-4 border-b border-[#d4a59a]/10 sticky top-0 bg-[#111] z-10">
                <p className="text-sm md:text-xs tracking-[0.2em] uppercase font-['Montserrat'] font-bold md:font-semibold text-[#f5f0ee]">New Discount Code</p>
                <button onClick={() => setModalOpen(false)} className="text-[#9a8f8c] hover:text-[#f5f0ee] bg-[#1a1a1a] p-1.5 rounded-sm">
                  <X size={18} md:size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="px-6 py-6 md:py-5 space-y-5 md:space-y-4 pb-24 md:pb-5">
                <Field label="Code *">
                  <input type="text" value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())} placeholder="SUMMER25" className={INPUT_CLS} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Discount Type">
                    <select value={form.type} onChange={(e) => setField("type", e.target.value)} className={INPUT_CLS}>
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (£)</option>
                    </select>
                  </Field>
                  <Field label={form.type === "percent" ? "Discount %" : "Amount (£)"}>
                    <input type="number" min={1} max={form.type === "percent" ? 100 : undefined} value={form.value} onChange={(e) => setField("value", Number(e.target.value))} className={INPUT_CLS} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min. Order (£)">
                    <input type="number" min={0} value={form.minOrder} onChange={(e) => setField("minOrder", Number(e.target.value))} className={INPUT_CLS} />
                  </Field>
                  <Field label="Max Uses (blank = unlimited)">
                    <input type="number" min={1} value={form.maxUses ?? ""} onChange={(e) => setField("maxUses", e.target.value ? Number(e.target.value) : null)} className={INPUT_CLS} />
                  </Field>
                </div>
                <Field label="Expiry Date (blank = never)">
                  <input type="date" value={form.expires ?? ""} onChange={(e) => setField("expires", e.target.value || null)} className={INPUT_CLS} />
                </Field>
                
                {/* Desktop Buttons */}
                <div className="hidden md:flex gap-3 pt-2">
                  <button onClick={() => setModalOpen(false)} className="flex-1 bg-[#1a1a1a] border border-[#d4a59a]/20 text-[#f5f0ee] py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] transition-colors rounded-sm">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 bg-[#d4a59a] text-[#0a0a0a] py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors rounded-sm">Create Code</button>
                </div>
              </div>

              {/* Mobile Sticky Buttons */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#111]/95 backdrop-blur-md border-t border-[#d4a59a]/15 flex gap-3 z-20">
                  <button onClick={() => setModalOpen(false)} className="flex-1 bg-[#1a1a1a] border border-[#d4a59a]/20 text-[#f5f0ee] py-3.5 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold rounded-sm">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 bg-[#d4a59a] text-[#0a0a0a] py-3.5 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-bold hover:bg-[#f2c6b4] rounded-sm shadow-lg">Create</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" onClick={() => setDeleteId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-80 bg-[#111] border border-[#d4a59a]/20 z-[60] p-8 text-center rounded-sm shadow-2xl"
            >
              <p className="font-['Cormorant_Garamond'] text-3xl md:text-xl font-medium md:font-light text-[#f5f0ee] mb-2 md:mb-2">Delete Code?</p>
              <p className="text-sm md:text-xs text-[#9a8f8c] font-['Montserrat'] mb-8 md:mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 bg-[#1a1a1a] border border-[#d4a59a]/20 text-[#f5f0ee] py-3.5 md:py-2.5 text-xs md:text-[10px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold md:font-normal hover:text-[#f5f0ee] transition-colors rounded-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500/90 text-white py-3.5 md:py-2.5 text-xs md:text-[10px] tracking-[0.15em] uppercase font-['Montserrat'] font-bold md:font-semibold hover:bg-red-500 transition-colors rounded-sm shadow-md md:shadow-none">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}