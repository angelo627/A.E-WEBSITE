import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

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
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export default function ManageTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<TeamFormState>(emptyForm());
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

  const handleField = (field: keyof TeamFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingMemberId(null);
    setForm(emptyForm());
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

  const buildPayload = () => ({
    fullName: form.fullName.trim(),
    roleTitle: form.roleTitle.trim(),
    bio: form.bio.trim(),
    imageUrl: form.imageUrl.trim() || undefined,
    linkedinUrl: form.linkedinUrl.trim() || undefined,
    twitterUrl: form.twitterUrl.trim() || undefined,
    sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
    isVisible: form.isVisible
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
      if (editingMemberId) {
        await apiFetch(`/admin/team/${editingMemberId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        setSuccessMessage("Team member updated successfully.");
      } else {
        await apiFetch("/admin/team", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setSuccessMessage("Team member created successfully.");
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
    setSubmitError(null);
    setSuccessMessage(null);
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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Manage Team</h1>
          <p className="text-gray-300">Add, update, and reorder team members shown publicly.</p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Team Member" : "Add Team Member"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="team-full-name">
                  Full Name
                </label>
                <input
                  id="team-full-name"
                  type="text"
                  value={form.fullName}
                  onChange={(event) => handleField("fullName", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="team-role-title">
                  Role Title
                </label>
                <input
                  id="team-role-title"
                  type="text"
                  value={form.roleTitle}
                  onChange={(event) => handleField("roleTitle", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="team-bio">
                Bio
              </label>
              <textarea
                id="team-bio"
                rows={4}
                value={form.bio}
                onChange={(event) => handleField("bio", event.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="team-image-url">
                  Image URL
                </label>
                <input
                  id="team-image-url"
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => handleField("imageUrl", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="team-linkedin">
                  LinkedIn URL
                </label>
                <input
                  id="team-linkedin"
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(event) => handleField("linkedinUrl", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="team-twitter">
                  Twitter URL
                </label>
                <input
                  id="team-twitter"
                  type="url"
                  value={form.twitterUrl}
                  onChange={(event) => handleField("twitterUrl", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="team-sort-order">
                  Sort Order
                </label>
                <input
                  id="team-sort-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => handleField("sortOrder", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(event) => handleField("isVisible", event.target.checked)}
                    className="accent-purple-500"
                  />
                  Visible on public page
                </label>
              </div>
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Member" : "Create Member"}
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
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          {isLoading ? <p className="text-gray-300">Loading team members...</p> : null}
          {!isLoading && error ? (
            <div className="space-y-3">
              <p className="text-rose-200">{error}</p>
              <button
                type="button"
                onClick={() => void loadMembers()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !error && members.length === 0 ? (
            <p className="text-gray-300">No team members found.</p>
          ) : null}

          {!isLoading && !error && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <article
                  key={member.id}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <h3 className="text-lg font-medium">{member.fullName}</h3>
                    <p className="text-sm text-gray-300">{member.roleTitle}</p>
                    <p className="text-sm text-gray-400">
                      Order {member.sortOrder} • {member.isVisible ? "Visible" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(member)}
                      className="px-3 py-2 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(member)}
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
