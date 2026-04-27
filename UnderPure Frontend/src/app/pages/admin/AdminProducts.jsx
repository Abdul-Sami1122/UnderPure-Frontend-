import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Search } from "lucide-react";
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee]">
            Products
          </h1>
          <p className="text-[#9a8f8c] text-xs font-['Montserrat'] mt-1">
            {products.length} pieces in the collection
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#d4a59a] text-[#0a0a0a] px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8f8c]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-[#111] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-xs font-['Montserrat'] pl-9 pr-4 py-2.5 outline-none placeholder-[#9a8f8c]/50 transition-colors"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-[#141414] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="border border-[#d4a59a]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d4a59a]/10 bg-[#0d0d0d]">
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
                    className="hover:bg-[#d4a59a]/3 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-12 object-cover bg-[#1a1a1a] flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-['Montserrat'] text-[#f5f0ee] font-medium">
                            {p.name}
                          </p>
                          {p.badge && (
                            <span className="text-[8px] tracking-[0.15em] uppercase text-[#d4a59a] font-['Montserrat']">
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
                    <td className="px-4 py-3 text-xs font-['Montserrat'] text-[#9a8f8c]">
                      {p.featured ? "✦" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-[#9a8f8c] hover:text-[#d4a59a] transition-colors p-1.5"
                        >
                          <Edit2 size={13} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="text-[#9a8f8c] hover:text-red-400 transition-colors p-1.5"
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
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-4 right-4 left-4 md:left-auto md:w-[520px] bg-[#111] border border-[#d4a59a]/15 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#d4a59a]/10 sticky top-0 bg-[#111] z-10">
                <p className="text-xs tracking-[0.2em] uppercase font-['Montserrat'] text-[#f5f0ee]">
                  {editProduct ? "Edit Product" : "New Product"}
                </p>
                <button
                  onClick={closeModal}
                  className="text-[#9a8f8c] hover:text-[#f5f0ee] transition-colors"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-5">
                {/* Name */}
                <Field label="Product Name *">
                  <input
                    type="text"
                    value={form.name || ""}
                    onChange={(e) => setField("name", e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>

                {/* Category */}
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

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
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

                {/* Description */}
                <Field label="Short Description">
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => setField("description", e.target.value)}
                    rows={2}
                    className={INPUT_CLS}
                  />
                </Field>

                {/* Long Description */}
                <Field label="Long Description (optional)">
                  <textarea
                    value={form.longDescription || ""}
                    onChange={(e) => setField("longDescription", e.target.value)}
                    rows={3}
                    className={INPUT_CLS}
                  />
                </Field>

                {/* Image URL */}
                <Field label="Main Image URL">
                  <input
                    type="url"
                    value={form.image || ""}
                    onChange={(e) => setField("image", e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>

                {/* Additional Images */}
                <Field label="Additional Image URLs (one per line)">
                  <textarea
                    value={Array.isArray(form.images) ? form.images.slice(1).join("\n") : ""}
                    onChange={(e) => {
                      const extras = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
                      setField("images", form.image ? [form.image, ...extras] : extras);
                    }}
                    rows={3}
                    placeholder="https://…&#10;https://…"
                    className={INPUT_CLS}
                  />
                </Field>

                {/* Sizes */}
                <Field label="Sizes (comma-separated)">
                  <input
                    type="text"
                    value={Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes || ""}
                    onChange={(e) => setField("sizes", e.target.value)}
                    placeholder="XS, S, M, L, XL"
                    className={INPUT_CLS}
                  />
                </Field>

                {/* Colors */}
                <Field label="Colours (comma-separated)">
                  <input
                    type="text"
                    value={Array.isArray(form.colors) ? form.colors.join(", ") : form.colors || ""}
                    onChange={(e) => setField("colors", e.target.value)}
                    placeholder="Noir, Ivory, Blush"
                    className={INPUT_CLS}
                  />
                </Field>

                {/* Badge */}
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

                {/* Stock count */}
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

                {/* Toggles */}
                <div className="flex gap-8">
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

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 border border-[#d4a59a]/20 text-[#9a8f8c] hover:text-[#f5f0ee] py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-[#d4a59a] text-[#0a0a0a] py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold hover:bg-[#f2c6b4] disabled:opacity-60 transition-colors"
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
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#111] border border-[#d4a59a]/15 z-50 p-8 text-center"
            >
              <p className="font-['Cormorant_Garamond'] text-xl font-light text-[#f5f0ee] mb-2">
                Delete Product?
              </p>
              <p className="text-xs text-[#9a8f8c] font-['Montserrat'] mb-7">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border border-[#d4a59a]/20 text-[#9a8f8c] hover:text-[#f5f0ee] py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-500/80 text-white py-3 text-xs tracking-[0.15em] uppercase font-['Montserrat'] font-semibold hover:bg-red-500 transition-colors"
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
  "w-full bg-[#0d0d0d] border border-[#d4a59a]/20 focus:border-[#d4a59a]/50 text-[#f5f0ee] text-xs font-['Montserrat'] px-3 py-2.5 outline-none transition-colors";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[9px] tracking-[0.2em] uppercase font-['Montserrat'] text-[#9a8f8c] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full relative transition-colors ${value ? "bg-[#d4a59a]" : "bg-[#333]"
          }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-4" : "left-0.5"
            }`}
        />
      </div>
      <span className="text-[10px] tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c]">
        {label}
      </span>
    </label>
  );
}