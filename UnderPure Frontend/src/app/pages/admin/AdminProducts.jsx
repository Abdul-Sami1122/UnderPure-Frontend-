import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Search, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";
import { MOCK_PRODUCTS } from "../../lib/mockData";

const EMPTY_FORM = {
  name: "",
  slug: "",
  category: "bras",
  price: 0,
  originalPrice: undefined,
  description: "",
  longDescription: "",
  image: "",
  images: [],
  sizes: [],
  colors: [],
  inStock: true,
  badge: "",
  featured: false,
};

export function AdminProducts() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => {
        // Fallback to mock data when API fails
        setProducts(MOCK_PRODUCTS);
      })
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditProduct(null);
    setForm(EMPTY_FORM);
  };

  const setField = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!token) return;
    if (!form.name?.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }

    setSaving(true);
    try {
      const slug =
        form.slug?.trim() ||
        form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const data = {
        ...form,
        slug,
        images: form.image ? [form.image, ...(form.images?.slice(1) || [])] : [],
        sizes: typeof form.sizes === "string"
          ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
          : form.sizes || [],
        colors: typeof form.colors === "string"
          ? form.colors.split(",").map((s) => s.trim()).filter(Boolean)
          : form.colors || [],
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      };

      if (editProduct) {
        await updateProduct(token, editProduct.id, data);
        toast.success("Product updated");
      } else {
        await createProduct(token, data);
        toast.success("Product created");
      }

      closeModal();
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    try {
      await deleteProduct(token, id);
      setProducts((p) => p.filter((prod) => prod.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-0">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-3xl font-medium md:font-light text-[#f5f0ee]">
            Products
          </h1>
          <p className="text-[#9a8f8c] text-sm md:text-xs font-['Montserrat'] mt-2 md:mt-1">
            {products.length} pieces in the collection
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-[#d4a59a] text-[#0a0a0a] px-6 py-4 md:px-5 md:py-2.5 text-xs md:text-xs tracking-[0.2em] md:tracking-[0.15em] uppercase font-['Montserrat'] font-bold md:font-semibold hover:bg-[#f2c6b4] transition-colors rounded-sm md:rounded-none w-full md:w-auto shadow-md md:shadow-none"
        >
          <Plus size={18} md:size={14} strokeWidth={2} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 md:mb-6 max-w-sm">
        <Search
          size={18} md:size={14}
          className="absolute left-4 md:left-3.5 top-1/2 -translate-y-1/2 text-[#9a8f8c]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-sm md:text-xs font-['Montserrat'] pl-12 md:pl-9 pr-4 py-3.5 md:py-2.5 outline-none placeholder-[#9a8f8c]/50 transition-colors rounded-sm md:rounded-none"
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-4 md:space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 md:h-16 bg-[#141414] animate-pulse rounded-sm md:rounded-none" />
          ))}
        </div>
      ) : (
        <>
          {/* ====== MOBILE VIEW (Cards View) ====== */}
          <div className="md:hidden space-y-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-[#0d0d0d] border border-[#d4a59a]/15 p-4 rounded-sm relative shadow-sm">
                <div className="flex gap-4">
                  <img src={p.image} alt={p.name} className="w-20 h-24 object-cover bg-[#1a1a1a] rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-['Montserrat'] text-[#f5f0ee] font-semibold mb-1 truncate">{p.name}</p>
                    <p className="text-[10px] tracking-[0.1em] uppercase font-['Montserrat'] text-[#d4a59a] font-bold mb-2">{p.category}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-['Montserrat'] font-semibold text-[#f5f0ee]">£{p.price}</span>
                      <span className={`text-[9px] tracking-[0.1em] uppercase font-['Montserrat'] font-bold px-2 py-1 rounded-sm ${p.inStock ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#d4a59a]/10">
                  {p.featured && <span className="text-[#d4a59a] text-[10px] font-bold uppercase tracking-widest mr-auto flex items-center gap-1"><Star size={10} className="fill-[#d4a59a]" /> Featured</span>}
                  <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 text-xs text-[#9a8f8c] font-['Montserrat'] font-semibold hover:text-[#d4a59a] border border-[#d4a59a]/20 px-4 py-2 rounded-sm bg-[#111]">
                    <Edit2 size={12} strokeWidth={2} /> Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(p.id)} className="flex items-center gap-1.5 text-xs text-red-400 font-['Montserrat'] font-semibold hover:bg-red-400/10 border border-red-400/20 px-4 py-2 rounded-sm bg-[#111]">
                    <Trash2 size={12} strokeWidth={2} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="p-8 text-center text-[#9a8f8c] text-sm font-['Montserrat'] border border-[#d4a59a]/15 bg-[#0d0d0d] rounded-sm">No products found</div>}
          </div>

          {/* ====== DESKTOP VIEW (Table View) ====== */}
          <div className="hidden md:block border border-[#d4a59a]/10 overflow-hidden bg-[#0d0d0d]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d4a59a]/10 bg-[#0a0a0a]">
                    {["Product", "Category", "Price", "Stock", "Featured", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4a59a]/10">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#d4a59a]/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-12 object-cover bg-[#1a1a1a] flex-shrink-0 border border-[#d4a59a]/10"
                          />
                          <div>
                            <p className="text-xs font-['Montserrat'] text-[#f5f0ee] font-medium">
                              {p.name}
                            </p>
                            {p.badge && (
                              <span className="text-[8px] tracking-[0.15em] uppercase text-[#d4a59a] font-['Montserrat'] font-bold">
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#9a8f8c] capitalize">
                        {p.category}
                      </td>
                      <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#f5f0ee]">
                        £{p.price}
                        {p.originalPrice && (
                          <span className="text-[#9a8f8c] line-through ml-2">
                            £{p.originalPrice}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[9px] tracking-[0.1em] uppercase font-['Montserrat'] font-semibold px-2 py-1 ${p.inStock
                            ? "text-green-400 bg-green-400/10"
                            : "text-red-400 bg-red-400/10"
                            }`}
                        >
                          {p.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#d4a59a]">
                        {p.featured ? "✦" : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors p-1.5 bg-[#111] hover:bg-[#d4a59a]/10 rounded-sm border border-[#d4a59a]/10"
                          >
                            <Edit2 size={13} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="text-[#9a8f8c] hover:text-red-400 transition-colors p-1.5 bg-[#111] hover:bg-red-400/10 rounded-sm border border-[#d4a59a]/10"
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-[#9a8f8c] text-sm font-['Montserrat']"
                      >
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ====== Create/Edit Modal - Mobile Friendly ====== */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-y-0 inset-x-0 md:inset-y-4 md:right-4 md:left-auto md:w-[520px] bg-[#111] border-l md:border border-[#d4a59a]/15 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-5 md:px-6 md:py-5 border-b border-[#d4a59a]/10 sticky top-0 bg-[#111]/95 backdrop-blur-md z-10">
                <p className="text-sm md:text-xs tracking-[0.2em] uppercase font-['Montserrat'] font-bold md:font-semibold text-[#f5f0ee]">
                  {editProduct ? "Edit Product" : "New Product"}
                </p>
                <button
                  onClick={closeModal}
                  className="text-[#9a8f8c] hover:text-[#f5f0ee] hover:rotate-90 transition-all p-2 -mr-2 bg-[#1a1a1a] rounded-sm border border-[#d4a59a]/10"
                >
                  <X size={20} md:size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="px-5 py-6 md:px-6 md:py-6 space-y-6 md:space-y-5 pb-24 md:pb-6">

                <Field label="Product Name *">
                  <input
                    type="text"
                    value={form.name || ""}
                    onChange={(e) => setField("name", e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>

                <Field label="Category *">
                  <select
                    value={form.category || "bras"}
                    onChange={(e) => setField("category", e.target.value)}
                    className={INPUT_CLS}
                  >
                    <option value="bras">Bras</option>
                    <option value="sets">Lingerie Sets</option>
                    <option value="sleepwear">Sleepwear</option>
                    <option value="briefs">Briefs & Thongs</option>
                  </select>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-4">
                  <Field label="Price (£) *">
                    <input
                      type="number"
                      value={form.price || ""}
                      onChange={(e) => setField("price", e.target.value)}
                      className={INPUT_CLS}
                    />
                  </Field>
                  <Field label="Original Price (£)">
                    <input
                      type="number"
                      value={form.originalPrice || ""}
                      onChange={(e) => setField("originalPrice", e.target.value || undefined)}
                      className={INPUT_CLS}
                    />
                  </Field>
                </div>

                <Field label="Short Description">
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => setField("description", e.target.value)}
                    rows={3}
                    className={INPUT_CLS}
                  />
                </Field>

                <Field label="Long Description (optional)">
                  <textarea
                    value={form.longDescription || ""}
                    onChange={(e) => setField("longDescription", e.target.value)}
                    rows={4}
                    className={INPUT_CLS}
                  />
                </Field>

                <Field label="Main Image URL">
                  <input
                    type="url"
                    value={form.image || ""}
                    onChange={(e) => setField("image", e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>

                <Field label="Additional Image URLs (one per line)">
                  <textarea
                    value={Array.isArray(form.images) ? form.images.slice(1).join("\n") : ""}
                    onChange={(e) => {
                      const extras = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
                      setField("images", form.image ? [form.image, ...extras] : extras);
                    }}
                    rows={4}
                    placeholder="https://…&#10;https://…"
                    className={INPUT_CLS}
                  />
                </Field>

                <Field label="Sizes (comma-separated)">
                  <input
                    type="text"
                    value={Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes || ""}
                    onChange={(e) => setField("sizes", e.target.value)}
                    placeholder="XS, S, M, L, XL"
                    className={INPUT_CLS}
                  />
                </Field>

                <Field label="Colours (comma-separated)">
                  <input
                    type="text"
                    value={Array.isArray(form.colors) ? form.colors.join(", ") : form.colors || ""}
                    onChange={(e) => setField("colors", e.target.value)}
                    placeholder="Noir, Ivory, Blush"
                    className={INPUT_CLS}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-4">
                  <Field label="Badge">
                    <select
                      value={form.badge || ""}
                      onChange={(e) => setField("badge", e.target.value || null)}
                      className={INPUT_CLS}
                    >
                      <option value="">None</option>
                      <option value="NEW">New</option>
                      <option value="SALE">Sale</option>
                      <option value="EXCLUSIVE">Exclusive</option>
                      <option value="BESTSELLER">Bestseller</option>
                    </select>
                  </Field>
                  <Field label="Stock Count">
                    <input
                      type="number"
                      min={0}
                      value={form.stockCount ?? ""}
                      onChange={(e) => setField("stockCount", e.target.value ? Number(e.target.value) : undefined)}
                      className={INPUT_CLS}
                      placeholder="Leave blank for unlimited"
                    />
                  </Field>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 md:gap-8 bg-[#1a1a1a] p-4 rounded-sm border border-[#d4a59a]/10">
                  <Toggle
                    label="In Stock"
                    value={form.inStock !== false}
                    onChange={(v) => setField("inStock", v)}
                  />
                  <Toggle
                    label="Featured"
                    value={form.featured === true}
                    onChange={(v) => setField("featured", v)}
                  />
                </div>

                {/* Fixed Footer for Mobile */}
                <div className="fixed bottom-0 left-0 right-0 md:static bg-[#111] border-t border-[#d4a59a]/10 md:border-0 p-4 md:p-0 mt-8 md:mt-2 flex gap-3 z-20">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-[#1a1a1a] border border-[#d4a59a]/20 text-[#f5f0ee] py-4 md:py-3 text-sm md:text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold md:font-normal rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-[#d4a59a] text-[#0a0a0a] py-4 md:py-3 text-sm md:text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-bold md:font-semibold hover:bg-[#f2c6b4] disabled:opacity-60 rounded-sm shadow-md md:shadow-none"
                  >
                    {saving ? "Saving…" : editProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-full max-w-sm bg-[#111] border border-[#d4a59a]/20 z-[60] p-6 md:p-8 text-center rounded-sm shadow-2xl"
            >
              <p className="font-['Cormorant_Garamond'] text-3xl md:text-xl font-medium md:font-light text-[#f5f0ee] mb-3 md:mb-2">
                Delete Product?
              </p>
              <p className="text-sm md:text-xs text-[#9a8f8c] font-['Montserrat'] mb-8 md:mb-7">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 md:gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-[#1a1a1a] border border-[#d4a59a]/20 text-[#f5f0ee] py-4 md:py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold md:font-normal rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-500/90 text-white py-4 md:py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-bold md:font-semibold hover:bg-red-500 rounded-sm shadow-md"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const INPUT_CLS =
  "w-full bg-[#1a1a1a] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-sm md:text-xs font-['Montserrat'] px-4 py-3.5 md:px-3 md:py-2.5 outline-none transition-colors rounded-sm";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] md:text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#9a8f8c] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 md:gap-2.5 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className={`w-11 h-6 md:w-9 md:h-5 rounded-full relative transition-colors ${value ? "bg-[#d4a59a]" : "bg-[#333]"
          }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 md:w-4 md:h-4 rounded-full bg-white transition-all shadow-sm ${value ? "left-5.5 md:left-4" : "left-0.5"
            }`}
        />
      </div>
      <span className="text-xs md:text-[10px] tracking-[0.15em] uppercase font-['Montserrat'] font-semibold md:font-normal text-[#f5f0ee] md:text-[#9a8f8c]">
        {label}
      </span>
    </label>
  );
}