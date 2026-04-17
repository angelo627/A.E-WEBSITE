import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

type ResourceType = "VIDEO" | "LINK" | "DOCUMENT" | "NOTE";

interface ModuleResource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  sortOrder: number;
}

interface AdminModule {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  order: number;
  estimatedMinutes?: number | null;
  isPublished: boolean;
  resources: ModuleResource[];
  createdAt: string;
  updatedAt: string;
}

interface ResourceFormState {
  key: string;
  title: string;
  type: ResourceType;
  url: string;
  content: string;
  sortOrder: string;
}

interface ModuleFormState {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  order: string;
  estimatedMinutes: string;
  isPublished: boolean;
  resources: ResourceFormState[];
}

const RESOURCE_TYPES: ReadonlyArray<ResourceType> = ["VIDEO", "LINK", "DOCUMENT", "NOTE"];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isResourceType = (value: unknown): value is ResourceType =>
  typeof value === "string" && RESOURCE_TYPES.includes(value as ResourceType);

const isAdminModule = (value: unknown): value is AdminModule => {
  if (!isObject(value) || !Array.isArray(value.resources)) {
    return false;
  }

  const baseValid =
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.slug === "string" &&
    typeof value.shortDescription === "string" &&
    typeof value.description === "string" &&
    typeof value.order === "number" &&
    typeof value.isPublished === "boolean" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string";

  if (!baseValid) {
    return false;
  }

  if (
    value.estimatedMinutes !== undefined &&
    value.estimatedMinutes !== null &&
    typeof value.estimatedMinutes !== "number"
  ) {
    return false;
  }

  return value.resources.every((resource) => {
    if (!isObject(resource) || !isResourceType(resource.type)) {
      return false;
    }
    return (
      typeof resource.id === "string" &&
      typeof resource.title === "string" &&
      typeof resource.sortOrder === "number" &&
      (resource.url === undefined || typeof resource.url === "string") &&
      (resource.content === undefined || typeof resource.content === "string")
    );
  });
};

const isAdminModulesResponse = (value: unknown): value is AdminModule[] =>
  Array.isArray(value) && value.every((moduleItem) => isAdminModule(moduleItem));

const createResourceRow = (index = 0): ResourceFormState => ({
  key: `${Date.now()}-${Math.random()}`,
  title: "",
  type: "VIDEO",
  url: "",
  content: "",
  sortOrder: String(index)
});

const createEmptyForm = (): ModuleFormState => ({
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  order: "0",
  estimatedMinutes: "",
  isPublished: false,
  resources: [createResourceRow(0)]
});

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toFormState = (moduleItem: AdminModule): ModuleFormState => ({
  title: moduleItem.title,
  slug: moduleItem.slug,
  shortDescription: moduleItem.shortDescription,
  description: moduleItem.description,
  order: String(moduleItem.order),
  estimatedMinutes:
    typeof moduleItem.estimatedMinutes === "number" ? String(moduleItem.estimatedMinutes) : "",
  isPublished: moduleItem.isPublished,
  resources:
    moduleItem.resources.length > 0
      ? moduleItem.resources.map((resource) => ({
          key: resource.id,
          title: resource.title,
          type: resource.type,
          url: resource.url ?? "",
          content: resource.content ?? "",
          sortOrder: String(resource.sortOrder)
        }))
      : [createResourceRow(0)]
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

export default function ManageModules() {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [form, setForm] = useState<ModuleFormState>(createEmptyForm());
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditing = useMemo(() => editingModuleId !== null, [editingModuleId]);

  const loadModules = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/admin/modules");
      if (!isAdminModulesResponse(response)) {
        throw new Error("Unexpected admin modules response shape.");
      }
      setModules(response);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadModules();
  }, [loadModules]);

  const handleChange = (field: keyof Omit<ModuleFormState, "resources">, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResourceChange = (
    index: number,
    field: keyof Omit<ResourceFormState, "key">,
    value: string
  ) => {
    setForm((prev) => {
      const nextResources = [...prev.resources];
      nextResources[index] = {
        ...nextResources[index],
        [field]: value
      };
      return {
        ...prev,
        resources: nextResources
      };
    });
  };

  const addResource = () => {
    setForm((prev) => ({
      ...prev,
      resources: [...prev.resources, createResourceRow(prev.resources.length)]
    }));
  };

  const removeResource = (index: number) => {
    setForm((prev) => {
      if (prev.resources.length === 1) {
        return prev;
      }
      const nextResources = prev.resources.filter((_, resourceIndex) => resourceIndex !== index);
      return {
        ...prev,
        resources: nextResources
      };
    });
  };

  const startEdit = (moduleItem: AdminModule) => {
    setEditingModuleId(moduleItem.id);
    setForm(toFormState(moduleItem));
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const resetForm = () => {
    setEditingModuleId(null);
    setForm(createEmptyForm());
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) {
      return "Title is required.";
    }
    if (!form.slug.trim()) {
      return "Slug is required.";
    }
    if (!form.shortDescription.trim()) {
      return "Short description is required.";
    }
    if (!form.description.trim()) {
      return "Description is required.";
    }
    if (form.order.trim() && Number.isNaN(Number(form.order))) {
      return "Order must be a valid number.";
    }
    if (form.estimatedMinutes.trim() && Number.isNaN(Number(form.estimatedMinutes))) {
      return "Estimated minutes must be a valid number.";
    }

    for (let i = 0; i < form.resources.length; i += 1) {
      const resource = form.resources[i];
      if (!resource.title.trim()) {
        return `Resource ${i + 1}: title is required.`;
      }
      if (!RESOURCE_TYPES.includes(resource.type)) {
        return `Resource ${i + 1}: invalid resource type.`;
      }
      if (resource.sortOrder.trim() && Number.isNaN(Number(resource.sortOrder))) {
        return `Resource ${i + 1}: sort order must be a valid number.`;
      }
      const hasUrl = resource.url.trim().length > 0;
      const hasContent = resource.content.trim().length > 0;
      if (resource.type === "NOTE" && !hasContent) {
        return `Resource ${i + 1}: NOTE requires content.`;
      }
      if (resource.type !== "NOTE" && !hasUrl && !hasContent) {
        return `Resource ${i + 1}: provide URL or content.`;
      }
    }

    return null;
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    slug: form.slug.trim().toLowerCase(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    order: form.order.trim() ? Number(form.order) : 0,
    estimatedMinutes: form.estimatedMinutes.trim() ? Number(form.estimatedMinutes) : undefined,
    isPublished: form.isPublished,
    resources: form.resources.map((resource, index) => ({
      title: resource.title.trim(),
      type: resource.type,
      url: resource.url.trim() || undefined,
      content: resource.content.trim() || undefined,
      sortOrder: resource.sortOrder.trim() ? Number(resource.sortOrder) : index
    }))
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
      if (isEditing && editingModuleId) {
        await apiFetch(`/admin/modules/${editingModuleId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        setSuccessMessage("Module updated successfully.");
      } else {
        await apiFetch("/admin/modules", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setSuccessMessage("Module created successfully.");
      }

      await loadModules();
      resetForm();
    } catch (submissionError: unknown) {
      setSubmitError(getErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    const confirmed = window.confirm("Delete this module permanently?");
    if (!confirmed) {
      return;
    }

    setSubmitError(null);
    setSuccessMessage(null);
    try {
      await apiFetch(`/admin/modules/${moduleId}`, {
        method: "DELETE"
      });
      if (editingModuleId === moduleId) {
        resetForm();
      }
      setSuccessMessage("Module deleted successfully.");
      await loadModules();
    } catch (deleteError: unknown) {
      setSubmitError(getErrorMessage(deleteError));
    }
  };

  return (
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Manage Modules</h1>
          <p className="text-gray-300">Create, update, publish, and organize learning modules.</p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Module" : "Create Module"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="module-title">
                  Title
                </label>
                <input
                  id="module-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                  onBlur={() => {
                    if (!form.slug.trim() && form.title.trim()) {
                      handleChange("slug", slugify(form.title));
                    }
                  }}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="module-slug">
                  Slug
                </label>
                <input
                  id="module-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleChange("slug", slugify(event.target.value))}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="module-short-description">
                Short Description
              </label>
              <textarea
                id="module-short-description"
                rows={2}
                value={form.shortDescription}
                onChange={(event) => handleChange("shortDescription", event.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="module-description">
                Description
              </label>
              <textarea
                id="module-description"
                rows={4}
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="module-order">
                  Order
                </label>
                <input
                  id="module-order"
                  type="number"
                  value={form.order}
                  onChange={(event) => handleChange("order", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="module-minutes">
                  Estimated Minutes
                </label>
                <input
                  id="module-minutes"
                  type="number"
                  value={form.estimatedMinutes}
                  onChange={(event) => handleChange("estimatedMinutes", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) => handleChange("isPublished", event.target.checked)}
                    className="accent-purple-500"
                  />
                  Published
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Resources</h3>
                <button
                  type="button"
                  onClick={addResource}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium"
                >
                  Add Resource
                </button>
              </div>

              {form.resources.map((resource, index) => (
                <article key={resource.key} className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">Resource #{index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      disabled={form.resources.length === 1}
                      className="px-2.5 py-1 rounded bg-rose-600/70 hover:bg-rose-500 disabled:bg-rose-900/40 disabled:cursor-not-allowed text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={resource.title}
                      onChange={(event) => handleResourceChange(index, "title", event.target.value)}
                      className="rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                    />
                    <select
                      value={resource.type}
                      onChange={(event) => handleResourceChange(index, "type", event.target.value)}
                      className="rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                    >
                      {RESOURCE_TYPES.map((type) => (
                        <option key={type} value={type} className="text-black">
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Sort Order"
                      value={resource.sortOrder}
                      onChange={(event) => handleResourceChange(index, "sortOrder", event.target.value)}
                      className="rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="URL (optional)"
                    value={resource.url}
                    onChange={(event) => handleResourceChange(index, "url", event.target.value)}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                  />

                  <textarea
                    rows={3}
                    placeholder="Content / Notes (optional, required for NOTE)"
                    value={resource.content}
                    onChange={(event) => handleResourceChange(index, "content", event.target.value)}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                  />
                </article>
              ))}
            </div>

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
                {isSubmitting ? "Saving..." : isEditing ? "Update Module" : "Create Module"}
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
          <h2 className="text-xl font-semibold mb-4">Existing Modules</h2>

          {isLoading ? <p className="text-gray-300">Loading modules...</p> : null}
          {!isLoading && error ? (
            <div className="space-y-3">
              <p className="text-rose-200">{error}</p>
              <button
                type="button"
                onClick={() => void loadModules()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !error && modules.length === 0 ? (
            <p className="text-gray-300">No modules found.</p>
          ) : null}

          {!isLoading && !error && modules.length > 0 ? (
            <div className="space-y-3">
              {modules.map((moduleItem) => (
                <article
                  key={moduleItem.id}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <h3 className="text-lg font-medium">{moduleItem.title}</h3>
                    <p className="text-sm text-gray-300">
                      /{moduleItem.slug} • Order {moduleItem.order} • {moduleItem.resources.length} resources
                    </p>
                    <p className="text-sm text-gray-300">
                      {moduleItem.isPublished ? "Published" : "Draft"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(moduleItem)}
                      className="px-3 py-2 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(moduleItem.id)}
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
