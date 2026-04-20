import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Star,
  Quote,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert
} from "lucide-react";

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
    return "bg-emerald-500/15 text-emerald-400 border border-emerald-400/30";
  }
  if (status === "REJECTED") {
    return "bg-rose-500/15 text-rose-400 border border-rose-400/30";
  }
  return "bg-amber-500/15 text-amber-400 border border-amber-400/30";
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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Manage Testimonials
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Review user feedback, moderate submissions, and highlight the best stories.
            </p>
          </div>
        </motion.section>

        <motion.section variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/30 transition-colors rounded-3xl p-6 shadow-xl flex items-center gap-4">
             <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <Clock className="w-8 h-8 text-amber-400" />
             </div>
             <div>
                <p className="text-xs uppercase font-medium tracking-wide text-gray-400">Needs Review</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
             </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/30 transition-colors rounded-3xl p-6 shadow-xl flex items-center gap-4">
             <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <ThumbsUp className="w-8 h-8 text-emerald-400" />
             </div>
             <div>
                <p className="text-xs uppercase font-medium tracking-wide text-gray-400">Approved</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.approved}</p>
             </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-rose-500/30 transition-colors rounded-3xl p-6 shadow-xl flex items-center gap-4">
             <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <ThumbsDown className="w-8 h-8 text-rose-400" />
             </div>
             <div>
                <p className="text-xs uppercase font-medium tracking-wide text-gray-400">Rejected</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.rejected}</p>
             </div>
          </motion.div>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] shadow-2xl rounded-3xl p-6 md:p-8 relative">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Quote className="w-6 h-6 text-indigo-400" />
              Submission Queue
            </h2>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
               {testimonials.length} Total
            </span>
          </div>

          <AnimatePresence>
            {actionError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 shadow-lg shadow-rose-500/5"
              >
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <p className="text-sm font-medium text-rose-200">{actionError}</p>
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

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-indigo-200">Loading submissions...</p>
             </div>
          ) : null}
          
          {!isLoading && error ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
              <p className="text-rose-200 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => void loadTestimonials()}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 rounded-xl font-medium shadow-lg shadow-rose-500/20"
              >
                Retry Request
              </button>
            </div>
          ) : null}
          
          {!isLoading && !error && testimonials.length === 0 ? (
            <div className="text-center py-12">
               <ShieldAlert className="w-12 h-12 mx-auto text-gray-500 mb-4 opacity-50" />
               <p className="text-gray-400">No testimonials submitted yet.</p>
            </div>
          ) : null}

          {!isLoading && !error && testimonials.length > 0 ? (
            <div className="space-y-6">
              <AnimatePresence>
                {testimonials.map((testimonial) => {
                  const isBusy = Boolean(updatingIds[testimonial.id]);
                  return (
                    <motion.article
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      key={testimonial.id}
                      className={`group bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      {isBusy && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                         </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 z-10">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{testimonial.name}</h3>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${getStatusStyle(testimonial.status)}`}>
                              {testimonial.status}
                            </span>
                            {testimonial.isFeatured ? (
                              <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-purple-400 text-purple-400" /> Featured
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-400 mb-1">
                            {testimonial.title || "No Title"}
                            {testimonial.company ? ` @ ${testimonial.company}` : ""}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(testimonial.createdAt).toLocaleDateString()}</span>
                             {testimonial.user && (
                                <span className="bg-white/5 px-2 py-1 rounded-md text-gray-400">Account: @{testimonial.user.username}</span>
                             )}
                          </div>
                        </div>

                        {typeof testimonial.rating === "number" ? (
                           <div className="flex gap-1 items-center shrink-0 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= (testimonial.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
                                />
                              ))}
                           </div>
                        ) : null}
                      </div>

                      <div className="relative p-6 bg-black/20 rounded-xl border border-white/5 mt-2 z-10 italic text-gray-300 leading-relaxed font-serif">
                         <Quote className="w-8 h-8 text-indigo-500/20 absolute top-2 left-2 rotate-180" />
                         <p className="relative z-10 pt-2 pl-4 text-lg">"{testimonial.content}"</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10 z-10">
                        {testimonial.status !== "APPROVED" && (
                           <button
                             type="button"
                             disabled={isBusy}
                             onClick={() => void updateStatus(testimonial, "APPROVED", false)}
                             className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all font-medium text-sm group/btn border border-emerald-500/20"
                           >
                             <Check className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Approve
                           </button>
                        )}
                        
                        {testimonial.status !== "REJECTED" && (
                           <button
                             type="button"
                             disabled={isBusy}
                             onClick={() => void updateStatus(testimonial, "REJECTED", false)}
                             className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-medium text-sm group/btn border border-rose-500/20"
                           >
                             <X className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Reject
                           </button>
                        )}

                        {testimonial.status === "APPROVED" && (
                           <button
                             type="button"
                             disabled={isBusy}
                             onClick={() => void updateStatus(testimonial, testimonial.status, !testimonial.isFeatured)}
                             className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all font-medium text-sm group/btn border border-purple-500/20"
                           >
                             <Star className={`w-4 h-4 group-hover/btn:scale-110 transition-transform ${testimonial.isFeatured ? 'fill-current' : ''}`} /> 
                             {testimonial.isFeatured ? "Remove Featured" : "Make Featured"}
                           </button>
                        )}

                        <div className="flex-1" />

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void deleteTestimonial(testimonial)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-medium text-sm group/btn border border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Delete
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : null}
        </motion.section>
      </motion.div>
    </div>
  );
}
