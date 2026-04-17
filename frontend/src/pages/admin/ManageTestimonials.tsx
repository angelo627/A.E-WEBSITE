import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

type TestimonialStatus = "APPROVED" | "REJECTED" | "PENDING";

interface AdminUserSummary {
  id: string;
  username: string;
  email: string;
}

interface AdminTestimonial {
  id: string;
  userId?: string | null;
  name: string;
  title?: string | null;
  company?: string | null;
  content: string;
  rating?: number | null;
  status: TestimonialStatus;
  isFeatured: boolean;
  approvedById?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: AdminUserSummary | null;
  approvedBy?: AdminUserSummary | null;
}

const STATUS_OPTIONS: ReadonlyArray<TestimonialStatus> = ["PENDING", "APPROVED", "REJECTED"];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStatus = (value: unknown): value is TestimonialStatus =>
  value === "APPROVED" || value === "REJECTED" || value === "PENDING";

const isUserSummary = (value: unknown): value is AdminUserSummary =>
  isObject(value) &&
  typeof value.id === "string" &&
  typeof value.username === "string" &&
  typeof value.email === "string";

const isAdminTestimonial = (value: unknown): value is AdminTestimonial => {
  if (!isObject(value) || !isStatus(value.status)) {
    return false;
  }

  const baseValid =
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.content === "string" &&
    typeof value.isFeatured === "boolean" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string";

  if (!baseValid) {
    return false;
  }

  if (value.userId !== undefined && value.userId !== null && typeof value.userId !== "string") {
    return false;
  }
  if (value.title !== undefined && value.title !== null && typeof value.title !== "string") {
    return false;
  }
  if (value.company !== undefined && value.company !== null && typeof value.company !== "string") {
    return false;
  }
  if (value.rating !== undefined && value.rating !== null && typeof value.rating !== "number") {
    return false;
  }
  if (
    value.approvedById !== undefined &&
    value.approvedById !== null &&
    typeof value.approvedById !== "string"
  ) {
    return false;
  }
  if (value.approvedAt !== undefined && value.approvedAt !== null && typeof value.approvedAt !== "string") {
    return false;
  }
  if (value.user !== undefined && value.user !== null && !isUserSummary(value.user)) {
    return false;
  }
  if (value.approvedBy !== undefined && value.approvedBy !== null && !isUserSummary(value.approvedBy)) {
    return false;
  }

  return true;
};

const isTestimonialsResponse = (value: unknown): value is AdminTestimonial[] =>
  Array.isArray(value) && value.every((item) => isAdminTestimonial(item));

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

const getStatusStyle = (status: TestimonialStatus): string => {
  if (status === "APPROVED") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30";
  }
  if (status === "REJECTED") {
    return "bg-rose-500/15 text-rose-300 border border-rose-400/30";
  }
  return "bg-amber-500/15 text-amber-200 border border-amber-400/30";
};

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => {
    const pending = testimonials.filter((item) => item.status === "PENDING").length;
    const approved = testimonials.filter((item) => item.status === "APPROVED").length;
    const rejected = testimonials.filter((item) => item.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [testimonials]);

  const loadTestimonials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/admin/testimonials");
      if (!isTestimonialsResponse(response)) {
        throw new Error("Unexpected testimonials response shape.");
      }
      setTestimonials(response);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTestimonials();
  }, [loadTestimonials]);

  const withLoading = async (testimonialId: string, fn: () => Promise<void>) => {
    setUpdatingIds((prev) => ({ ...prev, [testimonialId]: true }));
    setActionError(null);
    setSuccessMessage(null);
    try {
      await fn();
      await loadTestimonials();
    } catch (actionErr: unknown) {
      setActionError(getErrorMessage(actionErr));
    } finally {
      setUpdatingIds((prev) => {
        const next = { ...prev };
        delete next[testimonialId];
        return next;
      });
    }
  };

  const updateStatus = async (
    testimonial: AdminTestimonial,
    status: TestimonialStatus,
    isFeatured: boolean
  ) => {
    await withLoading(testimonial.id, async () => {
      await apiFetch(`/admin/testimonials/${testimonial.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          isFeatured: status === "APPROVED" ? isFeatured : false
        })
      });
      setSuccessMessage(`Testimonial "${testimonial.name}" updated.`);
    });
  };

  const deleteTestimonial = async (testimonial: AdminTestimonial) => {
    const confirmed = window.confirm(`Delete testimonial from "${testimonial.name}" permanently?`);
    if (!confirmed) {
      return;
    }

    await withLoading(testimonial.id, async () => {
      await apiFetch(`/admin/testimonials/${testimonial.id}`, {
        method: "DELETE"
      });
      setSuccessMessage(`Testimonial "${testimonial.name}" deleted.`);
    });
  };

  return (
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Manage Testimonials</h1>
          <p className="text-gray-300">Review user submissions and control what is publicly visible.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-400">Pending</p>
            <p className="text-2xl font-semibold">{stats.pending}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-400">Approved</p>
            <p className="text-2xl font-semibold">{stats.approved}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-400">Rejected</p>
            <p className="text-2xl font-semibold">{stats.rejected}</p>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {actionError ? (
            <p className="text-sm text-rose-200 bg-rose-500/10 border border-rose-400/30 rounded-lg p-3 mb-3">
              {actionError}
            </p>
          ) : null}
          {successMessage ? (
            <p className="text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3 mb-3">
              {successMessage}
            </p>
          ) : null}

          {isLoading ? <p className="text-gray-300">Loading testimonials...</p> : null}
          {!isLoading && error ? (
            <div className="space-y-3">
              <p className="text-rose-200">{error}</p>
              <button
                type="button"
                onClick={() => void loadTestimonials()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !error && testimonials.length === 0 ? (
            <p className="text-gray-300">No testimonials found.</p>
          ) : null}

          {!isLoading && !error && testimonials.length > 0 ? (
            <div className="space-y-3">
              {testimonials.map((testimonial) => {
                const isBusy = Boolean(updatingIds[testimonial.id]);
                return (
                  <article
                    key={testimonial.id}
                    className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium">{testimonial.name}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusStyle(testimonial.status)}`}>
                            {testimonial.status}
                          </span>
                          {testimonial.isFeatured ? (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                              Featured
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-300">
                          {testimonial.title || "No title"}
                          {testimonial.company ? ` • ${testimonial.company}` : ""}
                        </p>
                        <p className="text-sm text-gray-400">
                          Submitted: {new Date(testimonial.createdAt).toLocaleString()}
                        </p>
                        {typeof testimonial.rating === "number" ? (
                          <p className="text-sm text-amber-200">Rating: {testimonial.rating}/5</p>
                        ) : null}
                        {testimonial.user ? (
                          <p className="text-sm text-gray-400">
                            User: {testimonial.user.username} ({testimonial.user.email})
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((statusOption) => (
                          <button
                            key={statusOption}
                            type="button"
                            disabled={isBusy || statusOption === testimonial.status}
                            onClick={() =>
                              void updateStatus(
                                testimonial,
                                statusOption,
                                statusOption === "APPROVED" ? testimonial.isFeatured : false
                              )
                            }
                            className="px-3 py-2 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 disabled:bg-cyan-900/40 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            Mark {statusOption}
                          </button>
                        ))}

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            void updateStatus(testimonial, testimonial.status, !testimonial.isFeatured)
                          }
                          className="px-3 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-500 disabled:bg-purple-900/40 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {testimonial.isFeatured ? "Unfeature" : "Feature"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void deleteTestimonial(testimonial)}
                          className="px-3 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-500 disabled:bg-rose-900/40 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-100 whitespace-pre-line">{testimonial.content}</p>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
