import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  UserPlus,
  Upload
} from "lucide-react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";

interface TeamMember {
  id: string;
  fullName: string;
  roleTitle: string;
  bio: string;
  imageUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamFormState {
  fullName: string;
  roleTitle: string;
  bio: string;
  imageUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  sortOrder: string;
  isVisible: boolean;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isTeamMember = (value: unknown): value is TeamMember =>
  isObject(value) &&
  typeof value.id === "string" &&
  typeof value.fullName === "string" &&
  typeof value.roleTitle === "string" &&
  typeof value.bio === "string" &&
  (value.imageUrl === undefined || value.imageUrl === null || typeof value.imageUrl === "string") &&
  (value.linkedinUrl === undefined ||
    value.linkedinUrl === null ||
    typeof value.linkedinUrl === "string") &&
  (value.twitterUrl === undefined || value.twitterUrl === null || typeof value.twitterUrl === "string") &&
  typeof value.sortOrder === "number" &&
  typeof value.isVisible === "boolean" &&
  typeof value.createdAt === "string" &&
  typeof value.updatedAt === "string";

const isTeamListResponse = (value: unknown): value is TeamMember[] =>
  Array.isArray(value) && value.every((member) => isTeamMember(member));

const emptyForm = (): TeamFormState => ({
  fullName: "",
  roleTitle: "",
  bio: "",
  imageUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  sortOrder: "0",
  isVisible: true
});

const toFormState = (member: TeamMember): TeamFormState => ({
  fullName: member.fullName,
  roleTitle: member.roleTitle,
  bio: member.bio,
  imageUrl: member.imageUrl ?? "",
  linkedinUrl: member.linkedinUrl ?? "",
  twitterUrl: member.twitterUrl ?? "",
  sortOrder: String(member.sortOrder),
  isVisible: member.isVisible
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

const isValidUrl = (value: string): boolean => {
  if (!value) return true; // Allow empty
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
} as const;

export default function ManageTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<TeamFormState>(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditing = useMemo(() => editingMemberId !== null, [editingMemberId]);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/admin/team");
      if (!isTeamListResponse(response)) {
        throw new Error("Unexpected team response shape.");
      }
      setMembers(response);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleField = (field: keyof TeamFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setEditingMemberId(null);
    setForm(emptyForm());
    setFile(null);
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const validateForm = (): string | null => {
    if (!form.fullName.trim()) {
      return "Full name is required.";
    }
    if (!form.roleTitle.trim()) {
      return "Role title is required.";
    }
    if (!form.bio.trim()) {
      return "Bio is required.";
    }
    if (form.sortOrder.trim() && Number.isNaN(Number(form.sortOrder))) {
      return "Sort order must be a valid number.";
    }
    if (form.imageUrl.trim() && !isValidUrl(form.imageUrl.trim())) {
      return "Image URL must be a valid URL.";
    }
    if (form.linkedinUrl.trim() && !isValidUrl(form.linkedinUrl.trim())) {
      return "LinkedIn URL must be a valid URL.";
    }
    if (form.twitterUrl.trim() && !isValidUrl(form.twitterUrl.trim())) {
      return "Twitter URL must be a valid URL.";
    }
    return null;
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("fullName", form.fullName.trim());
    formData.append("roleTitle", form.roleTitle.trim());
    formData.append("bio", form.bio.trim());
    formData.append("imageUrl", form.imageUrl.trim() || "");
    formData.append("linkedinUrl", form.linkedinUrl.trim() || "");
    formData.append("twitterUrl", form.twitterUrl.trim() || "");
    formData.append("sortOrder", form.sortOrder.trim() ? form.sortOrder : "0");
    formData.append("isVisible", String(form.isVisible));
    if (file) {
      formData.append("image", file);
    }
    return formData;
  };

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
      const submitData = buildFormData();
      if (editingMemberId) {
        await apiFetch(`/admin/team/${editingMemberId}`, {
          method: "PATCH",
          body: submitData
        });
        setSuccessMessage("Team member profile updated successfully.");
      } else {
        await apiFetch("/admin/team", {
          method: "POST",
          body: submitData
        });
        setSuccessMessage("Team member added successfully.");
      }

      await loadMembers();
      resetForm();
    } catch (submissionError: unknown) {
      setSubmitError(getErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setForm(toFormState(member));
    setFile(null);
    setSubmitError(null);
    setSuccessMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (member: TeamMember) => {
    const confirmed = window.confirm(`Delete "${member.fullName}" permanently?`);
    if (!confirmed) {
      return;
    }

    setSubmitError(null);
    setSuccessMessage(null);
    try {
      await apiFetch(`/admin/team/${member.id}`, { method: "DELETE" });
      if (editingMemberId === member.id) {
        resetForm();
      }
      setSuccessMessage("Team member deleted successfully.");
      await loadMembers();
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
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent italic">
              Manage Team
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2 font-outfit">
              Curate the public profiles of the core individuals driving our mission.
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
                <p className="text-sm font-medium text-rose-200 font-outfit">{submitError}</p>
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
                <p className="text-sm font-medium text-emerald-200 font-outfit">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 italic">
            {isEditing ? <Edit3 className="w-5 h-5 text-blue-400" /> : <UserPlus className="w-5 h-5 text-emerald-400" />}
            {isEditing ? `Edit ${form.fullName}` : "Add New Team Member"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="team-full-name">
                  Full Name
                </label>
                <input
                  id="team-full-name"
                  type="text"
                  value={form.fullName}
                  onChange={(event) => handleField("fullName", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 font-outfit"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="team-role-title">
                  Role Title
                </label>
                <input
                  id="team-role-title"
                  type="text"
                  value={form.roleTitle}
                  onChange={(event) => handleField("roleTitle", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 font-outfit"
                  placeholder="e.g. Lead Instructor"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="team-bio">
                Biography
              </label>
              <textarea
                id="team-bio"
                rows={4}
                value={form.bio}
                onChange={(event) => handleField("bio", event.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 resize-none font-outfit"
                placeholder="Brief professional background..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2" htmlFor="team-image-url">
                  <ImageIcon className="w-4 h-4 text-gray-400" /> Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    id="team-image-url"
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) => handleField("imageUrl", event.target.value)}
                    className="flex-1 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 font-outfit text-sm"
                    placeholder="https://..."
                  />
                  <label className="flex items-center justify-center px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                     <Upload className="w-4 h-4 text-blue-400" />
                     <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {file && <p className="text-[10px] text-blue-400 mt-1 truncate">Selected: {file.name}</p>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2" htmlFor="team-linkedin">
                  <FaLinkedin className="w-4 h-4 text-gray-400" /> LinkedIn
                </label>
                <input
                  id="team-linkedin"
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(event) => handleField("linkedinUrl", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 font-outfit text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2" htmlFor="team-twitter">
                  <FaTwitter className="w-4 h-4 text-gray-400" /> Twitter / X
                </label>
                <input
                  id="team-twitter"
                  type="url"
                  value={form.twitterUrl}
                  onChange={(event) => handleField("twitterUrl", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 font-outfit text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="team-sort-order">
                  Sort Order
                </label>
                <input
                  id="team-sort-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => handleField("sortOrder", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 font-outfit"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center pt-6">
                 <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(event) => handleField("isVisible", event.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Visible on platform</span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-none transition-all font-bold text-white shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-5 h-5" /> {isEditing ? "Update Profile" : "Create Profile"}</>
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
              <Users className="w-6 h-6 text-blue-400" />
              Core Team Members
            </h2>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
               {members.length} Members
            </span>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-blue-200">Retrieving team directory...</p>
             </div>
          ) : null}

          {!isLoading && error ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
              <p className="text-rose-200 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => void loadMembers()}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 rounded-xl font-medium shadow-lg shadow-rose-500/20"
              >
                Retry Request
              </button>
            </div>
          ) : null}

          {!isLoading && !error && members.length === 0 ? (
            <div className="text-center py-12">
               <Users className="w-12 h-12 mx-auto text-gray-500 mb-4 opacity-50" />
               <p className="text-gray-400">The team is currently empty. Add your first member!</p>
            </div>
          ) : null}

          {!isLoading && !error && members.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {members.map((member) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={member.id}
                    className={`group bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/30 rounded-2xl p-5 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center justify-between ${editingMemberId === member.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#050020]' : ''}`}
                  >
                    <div className="flex items-center gap-6 w-full">
                      <div className="relative shrink-0">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.fullName}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-blue-500/40 transition-all shadow-xl shadow-black/40"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/20 border-2 border-white/10 flex items-center justify-center font-bold text-2xl text-blue-300">
                            {member.fullName.charAt(0)}
                          </div>
                        )}
                        {!member.isVisible && (
                          <div className="absolute -top-1 -right-1 p-1 bg-rose-500 rounded-full border border-[#050020]" title="Hidden Profile">
                            <EyeOff className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate italic">
                          {member.fullName}
                        </h3>
                        <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-0.5">
                          {member.roleTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(member)}
                        className="flex items-center justify-center p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg group/btn"
                        title="Edit Profile"
                      >
                        <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(member)}
                        className="flex items-center justify-center p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg group/btn"
                        title="Remove Member"
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
