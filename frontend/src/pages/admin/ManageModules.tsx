import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Loader2,
  AlertCircle,
  FileVideo,
  Link as LinkIcon,
  FileText,
  StickyNote,
  CheckCircle2,
  ListVideo,
  Upload
} from "lucide-react";

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
      (resource.url === undefined || resource.url === null || typeof resource.url === "string") &&
      (resource.content === undefined || resource.content === null || typeof resource.content === "string")
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

// Animation variants
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

const getResourceIcon = (type: string) => {
  switch(type) {
    case "VIDEO": return <FileVideo className="w-5 h-5 text-blue-400" />;
    case "LINK": return <LinkIcon className="w-5 h-5 text-emerald-400" />;
    case "DOCUMENT": return <FileText className="w-5 h-5 text-indigo-400" />;
    case "NOTE": return <StickyNote className="w-5 h-5 text-amber-400" />;
    default: return <FileText className="w-5 h-5 text-gray-400" />;
  }
};

export default function ManageModules() {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [form, setForm] = useState<ModuleFormState>(createEmptyForm());
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState<number | null>(null);
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

  // Clear messages automatically
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  const handleVideoUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    setUploadingVideoIndex(index);
    setSubmitError(null);
    const file = event.target.files[0];
    const uploadFormData = new FormData();
    uploadFormData.append("video", file);

    try {
      const result = await apiFetch("/admin/modules/upload-video", {
        method: "POST",
        body: uploadFormData,
      });
      handleResourceChange(index, "url", result.url);
      setSuccessMessage("Video uploaded and URL assigned successfully.");
    } catch (uploadError: unknown) {
      setSubmitError(getErrorMessage(uploadError));
    } finally {
      setUploadingVideoIndex(null);
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white overflow-hidden relative font-outfit">
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
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent italic">
              Manage Modules
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Create, update, publish, and structure your learning resources.
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
            {isEditing ? "Edit Tracking Module" : "Create New Module"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="module-title">
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
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. Introduction to React"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="module-slug">
                  Slug (URL-friendly)
                </label>
                <input
                  id="module-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleChange("slug", slugify(event.target.value))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. intro-to-react"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="module-short-description">
                Short Description
              </label>
              <textarea
                id="module-short-description"
                rows={2}
                value={form.shortDescription}
                onChange={(event) => handleChange("shortDescription", event.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 resize-none font-outfit"
                placeholder="Brief summary for list views..."
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="module-description">
                Full Description
              </label>
              <textarea
                id="module-description"
                rows={4}
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 resize-none font-outfit"
                placeholder="Detailed explanation of the module contents..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="module-order">
                  Sort Order
                </label>
                <input
                  id="module-order"
                  type="number"
                  value={form.order}
                  onChange={(event) => handleChange("order", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="module-minutes">
                  Estimated Minutes
                </label>
                <input
                  id="module-minutes"
                  type="number"
                  value={form.estimatedMinutes}
                  onChange={(event) => handleChange("estimatedMinutes", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. 120"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) => handleChange("isPublished", event.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Publish Directly</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ListVideo className="w-5 h-5 text-indigo-400" />
                  Module Resources
                </h3>
                <button
                  type="button"
                  onClick={addResource}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all font-medium text-sm border border-blue-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Resource
                </button>
              </div>

              <AnimatePresence>
                {form.resources.map((resource, index) => (
                  <motion.article 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={resource.key} 
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2">
                        {getResourceIcon(resource.type)} Resource #{index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeResource(index)}
                        disabled={form.resources.length === 1}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Resource Title"
                        value={resource.title}
                        onChange={(event) => handleResourceChange(index, "title", event.target.value)}
                        className="rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-4 py-2.5 transition-colors placeholder:text-gray-600"
                      />
                      <select
                        value={resource.type}
                        onChange={(event) => handleResourceChange(index, "type", event.target.value)}
                        className="rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-4 py-2.5 transition-all appearance-none cursor-pointer text-white"
                        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%239CA3AF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
                      >
                        {RESOURCE_TYPES.map((type) => (
                          <option key={type} value={type} className="text-gray-900 bg-white">
                            {type}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Sort Order"
                        value={resource.sortOrder}
                        onChange={(event) => handleResourceChange(index, "sortOrder", event.target.value)}
                        className="rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-4 py-2.5 transition-colors placeholder:text-gray-600"
                      />
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={resource.type === "VIDEO" ? "Video URL (YouTube or Upload)" : "URL / Destination"}
                        value={resource.url}
                        onChange={(event) => handleResourceChange(index, "url", event.target.value)}
                        className="flex-1 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-4 py-2.5 transition-colors placeholder:text-gray-600"
                      />
                      {resource.type === "VIDEO" && (
                        <label className={`flex items-center justify-center px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all ${uploadingVideoIndex === index ? "opacity-50 pointer-events-none" : ""}`}>
                          {uploadingVideoIndex === index ? (
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                          ) : (
                            <Upload className="w-5 h-5 text-blue-400" />
                          )}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleVideoUpload(index, e)}
                          />
                        </label>
                      )}
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Content / Notes (optional, required for NOTE)"
                      value={resource.content}
                      onChange={(event) => handleResourceChange(index, "content", event.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-4 py-2.5 transition-colors placeholder:text-gray-600 resize-none font-outfit"
                    />
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-none transition-all font-bold text-white shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-5 h-5" /> {isEditing ? "Update Module" : "Create Module"}</>
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

        <motion.section variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              Existing Modules
            </h2>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
               {modules.length} Total
            </span>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-indigo-200">Loading modules array...</p>
             </div>
          ) : null}
          
          {!isLoading && error ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
              <p className="text-rose-200 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => void loadModules()}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 rounded-xl font-medium shadow-lg shadow-rose-500/20"
              >
                Retry Request
              </button>
            </div>
          ) : null}
          
          {!isLoading && !error && modules.length === 0 ? (
            <div className="text-center py-12">
               <BookOpen className="w-12 h-12 mx-auto text-gray-500 mb-4 opacity-50" />
               <p className="text-gray-400">No modules found. Create one above.</p>
            </div>
          ) : null}

          {!isLoading && !error && modules.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {modules.map((moduleItem) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={moduleItem.id}
                    className={`group bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center justify-between ${editingModuleId === moduleItem.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#050020]' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex-1 z-10 w-full min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${moduleItem.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {moduleItem.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                           Order: {moduleItem.order}
                        </span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                           {moduleItem.resources.length} Resources
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors truncate italic">
                        {moduleItem.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 truncate font-mono">
                        /{moduleItem.slug}
                      </p>
                    </div>

                    <div className="flex gap-3 z-10 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(moduleItem)}
                        className="flex items-center justify-center p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:shadow-blue-500/30 group/btn"
                        title="Edit Module"
                      >
                        <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(moduleItem.id)}
                        className="flex items-center justify-center p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/30 group/btn"
                        title="Delete Module"
                      >
                        <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
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
