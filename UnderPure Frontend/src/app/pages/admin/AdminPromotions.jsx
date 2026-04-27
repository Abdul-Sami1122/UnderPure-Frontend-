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
  "w-full bg-[#0a0a0a] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-xs font-['Montserrat'] px-3 py-2.5 outline-none transition-colors placeholder-[#9a8f8c]/50";
const LABEL_CLS =
  "block text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-2";

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
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee]">Promotions</h1>
          <p className="text-[#9a8f8c] text-xs font-['Montserrat'] mt-1">{codes.length} discount codes · {activeCodes.length} active</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#d4a59a] text-[#0a0a0a] px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          New Code
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Active Codes", value: activeCodes.length, icon: CheckCircle, color: "text-green-400" },
          { label: "Total Uses", value: totalUses, icon: Tag, color: "text-[#d4a59a]" },
          { label: "Expiring Soon", value: codes.filter((c) => c.expires && new Date(c.expires) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length, icon: Clock, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="border border-[#d4a59a]/10 bg-[#0d0d0d] p-4">
            <s.icon size={14} strokeWidth={1.5} className={`${s.color} mb-2`} />
            <p className="font-['Cormorant_Garamond'] text-2xl font-light text-[#f5f0ee] mb-1">{s.value}</p>
            <p className="text-[8px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Codes Table */}
      <div className="border border-[#d4a59a]/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d4a59a]/10 bg-[#0d0d0d]">
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
                <tr key={code.id} className="hover:bg-[#d4a59a]/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-[#d4a59a] bg-[#d4a59a]/10 px-2 py-0.5">
                        {code.code}
                      </code>
                      <button
                        onClick={() => handleCopy(code.code)}
                        className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
                      >
                        <Copy size={11} strokeWidth={1.5} />
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
                    {isMaxed && <span className="ml-1 text-[8px] text-red-400 font-['Montserrat']">MAXED</span>}
                  </td>
                  <td className="px-4 py-3 text-[10px] font-['Montserrat'] text-[#9a8f8c]">
                    {code.expires
                      ? <span className={isExpired ? "text-red-400" : ""}>{new Date(code.expires).toLocaleDateString("en-GB")}{isExpired && " (expired)"}</span>
                      : "Never"
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(code.id)}
                      className={`text-[8px] tracking-[0.12em] uppercase font-['Montserrat'] font-semibold px-2 py-1 transition-colors ${code.active && !isExpired && !isMaxed
                          ? "text-green-400 bg-green-400/10 hover:bg-green-400/20"
                          : "text-[#9a8f8c] bg-[#9a8f8c]/10 hover:bg-[#9a8f8c]/20"
                        }`}
                    >
                      {code.active && !isExpired && !isMaxed ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(code.id)}
                      className="text-[#9a8f8c] hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#111] border border-[#d4a59a]/15 z-50"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4a59a]/10">
                <p className="text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#f5f0ee]">New Discount Code</p>
                <button onClick={() => setModalOpen(false)} className="text-[#9a8f8c] hover:text-[#f5f0ee]">
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <Field label="Code *">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setField("code", e.target.value.toUpperCase())}
                    placeholder="SUMMER25"
                    className={INPUT_CLS}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Discount Type">
                    <select
                      value={form.type}
                      onChange={(e) => setField("type", e.target.value)}
                      className={INPUT_CLS}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (£)</option>
                    </select>
                  </Field>
                  <Field label={form.type === "percent" ? "Discount %" : "Amount (£)"}>
                    <input
                      type="number"
                      min={1}
                      max={form.type === "percent" ? 100 : undefined}
                      value={form.value}
                      onChange={(e) => setField("value", Number(e.target.value))}
                      className={INPUT_CLS}
                    />
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
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModalOpen(false)} className="flex-1 border border-[#d4a59a]/20 text-[#9a8f8c] hover:text-[#f5f0ee] py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleCreate} className="flex-1 bg-[#d4a59a] text-[#0a0a0a] py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors">
                    Create Code
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50" onClick={() => setDeleteId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#111] border border-[#d4a59a]/15 z-50 p-8 text-center"
            >
              <p className="font-['Cormorant_Garamond'] text-xl font-light text-[#f5f0ee] mb-2">Delete Code?</p>
              <p className="text-xs text-[#9a8f8c] font-['Montserrat'] mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-[#d4a59a]/20 text-[#9a8f8c] py-2.5 text-xs tracking-[0.15em] uppercase font-['Montserrat'] hover:text-[#f5f0ee] transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500/80 text-white py-2.5 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold hover:bg-red-500 transition-colors">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}