import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Manage Products</h1>
          <p className="text-gray-300">Create and manage products shown on the public pages.</p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Product" : "Create Product"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="product-name">
                  Name
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
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="product-slug">
                  Slug
                </label>
                <input
                  id="product-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleField("slug", slugify(event.target.value))}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="product-description">
                Description
              </label>
              <textarea
                id="product-description"
                rows={4}
                value={form.description}
                onChange={(event) => handleField("description", event.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="product-link">
                  Product Link
                </label>
                <input
                  id="product-link"
                  type="url"
                  value={form.link}
                  onChange={(event) => handleField("link", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="product-image-url">
                  Image URL (Optional)
                </label>
                <input
                  id="product-image-url"
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => handleField("imageUrl", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => handleField("isPublished", event.target.checked)}
                className="accent-purple-500"
              />
              Published
            </label>

            {submitError ? (
              <p className="text-sm text-rose-200 bg-rose-500/10 border border-rose-400/30 rounded-lg p-3">
                {submitError}
              </p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
                {successMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 font-medium"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Products</h2>

          {isLoading ? <p className="text-gray-300">Loading products...</p> : null}
          {!isLoading && error ? (
            <div className="space-y-3">
              <p className="text-rose-200">{error}</p>
              <button
                type="button"
                onClick={() => void loadProducts()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !error && products.length === 0 ? (
            <p className="text-gray-300">No products found.</p>
          ) : null}

          {!isLoading && !error && products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-300">/{product.slug}</p>
                    <p className="text-sm text-gray-300">{product.isPublished ? "Published" : "Draft"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="px-3 py-2 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(product.id)}
                      className="px-3 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
