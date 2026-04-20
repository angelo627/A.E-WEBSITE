import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PackageSearch
} from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  link: string;
  imageUrl?: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductFormState {
  name: string;
  slug: string;
  description: string;
  link: string;
  imageUrl: string;
  isPublished: boolean;
}

const emptyForm = (): ProductFormState => ({
  name: "",
  slug: "",
  description: "",
  link: "",
  imageUrl: "",
  isPublished: false
});

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isProductItem = (value: unknown): value is ProductItem =>
  isObject(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  typeof value.slug === "string" &&
  typeof value.description === "string" &&
  typeof value.link === "string" &&
  (value.imageUrl === undefined || value.imageUrl === null || typeof value.imageUrl === "string") &&
  typeof value.isPublished === "boolean";

const isProductListResponse = (value: unknown): value is ProductItem[] =>
  Array.isArray(value) && value.every((item) => isProductItem(item));

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

const isValidUrl = (value: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const toFormState = (product: ProductItem): ProductFormState => ({
  name: product.name,
  slug: product.slug,
  description: product.description,
  link: product.link,
  imageUrl: product.imageUrl ?? "",
  isPublished: product.isPublished
});

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
} as const;

export default function ManageProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditing = useMemo(() => editingProductId !== null, [editingProductId]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/admin/products");
      if (!isProductListResponse(response)) {
        throw new Error("Unexpected products response shape.");
      }
      setProducts(response);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleField = (field: keyof ProductFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingProductId(null);
    setForm(emptyForm());
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return "Name is required.";
    }
    if (!form.slug.trim()) {
      return "Slug is required.";
    }
    if (!form.description.trim()) {
      return "Description is required.";
    }
    if (!form.link.trim()) {
      return "Product link is required.";
    }
    if (!isValidUrl(form.link.trim())) {
      return "Product link must be a valid URL.";
    }
    if (form.imageUrl.trim() && !isValidUrl(form.imageUrl.trim())) {
      return "Image URL must be a valid URL.";
    }
    return null;
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim().toLowerCase(),
    description: form.description.trim(),
    link: form.link.trim(),
    imageUrl: form.imageUrl.trim() || undefined,
    isPublished: form.isPublished
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (editingProductId) {
        await apiFetch(`/admin/products/${editingProductId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        setSuccessMessage("Product updated successfully.");
      } else {
        await apiFetch("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setSuccessMessage("Product created successfully.");
      }

      await loadProducts();
      resetForm();
    } catch (submissionError: unknown) {
      setSubmitError(getErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: ProductItem) => {
    setEditingProductId(product.id);
    setForm(toFormState(product));
    setSubmitError(null);
    setSuccessMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm("Delete this product permanently?");
    if (!confirmed) {
      return;
    }

    setSubmitError(null);
    setSuccessMessage(null);
    try {
      await apiFetch(`/admin/products/${productId}`, { method: "DELETE" });
      if (editingProductId === productId) {
        resetForm();
      }
      setSuccessMessage("Product deleted successfully.");
      await loadProducts();
    } catch (deleteError: unknown) {
      setSubmitError(getErrorMessage(deleteError));
    }
  };

  return (
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="max-w-7xl mx-auto relative z-10 pb-20 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={itemVariants} className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-500/30">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Manage Products
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Create and organize digital entries displayed on public pages.
            </p>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl p-6 md:p-8 relative">
          <AnimatePresence>
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 shadow-lg shadow-rose-500/5"
              >
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <p className="text-sm font-medium text-rose-200">{submitError}</p>
              </motion.div>
            )}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 shadow-lg shadow-emerald-500/5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-200">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {isEditing ? <Edit3 className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
            {isEditing ? "Edit Product" : "Create New Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="product-name">
                  Product Name
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={form.name}
                  onChange={(event) => handleField("name", event.target.value)}
                  onBlur={() => {
                    if (!form.slug.trim() && form.name.trim()) {
                      handleField("slug", slugify(form.name));
                    }
                  }}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. Master React Course"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="product-slug">
                  Slug (URL-friendly)
                </label>
                <input
                  id="product-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleField("slug", slugify(event.target.value))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. master-react"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="product-description">
                Description
              </label>
              <textarea
                id="product-description"
                rows={4}
                value={form.description}
                onChange={(event) => handleField("description", event.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 resize-none"
                placeholder="Product description visible to users..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="product-link">
                  Checkout / Product Link
                </label>
                <input
                  id="product-link"
                  type="url"
                  value={form.link}
                  onChange={(event) => handleField("link", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="product-image-url">
                  Banner Image URL (Optional)
                </label>
                <input
                  id="product-image-url"
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => handleField("imageUrl", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center pt-2">
               <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => handleField("isPublished", event.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Publish Publicly</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-none transition-all font-bold text-white"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-5 h-5" /> {isEditing ? "Update Product" : "Create Product"}</>
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all font-medium text-white"
                >
                  <X className="w-5 h-5" /> Cancel Edit
                </button>
              )}
            </div>
          </form>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 md:p-8 shadow-2xl mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PackageSearch className="w-6 h-6 text-indigo-400" />
              Existing Products
            </h2>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
               {products.length} Total
            </span>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-indigo-200">Loading products...</p>
             </div>
          ) : null}
          {!isLoading && error ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
              <p className="text-rose-200 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => void loadProducts()}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 rounded-xl font-medium shadow-lg shadow-rose-500/20"
              >
                Retry Request
              </button>
            </div>
          ) : null}
          {!isLoading && !error && products.length === 0 ? (
            <div className="text-center py-12">
               <PackageSearch className="w-12 h-12 mx-auto text-gray-500 mb-4 opacity-50" />
               <p className="text-gray-400">No products found. Add one above.</p>
            </div>
          ) : null}

          {!isLoading && !error && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {products.map((product) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={product.id}
                    className={`group bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full ${editingProductId === product.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#050020]' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex-1 z-10 w-full mb-4">
                      {product.imageUrl && (
                         <div className="w-full h-32 mb-4 bg-black/40 rounded-xl overflow-hidden relative">
                             <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                         </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${product.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {product.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 mb-2">/{product.slug}</p>
                      <p className="text-sm text-gray-400 line-clamp-3">
                         {product.description}
                      </p>
                    </div>

                    <div className="flex gap-3 z-10 shrink-0 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all group/btn font-medium text-sm"
                      >
                        <Edit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all group/btn font-medium text-sm"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Delete
                      </button>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          ) : null}
        </motion.section>
      </motion.div>
    </div>
  );
}
