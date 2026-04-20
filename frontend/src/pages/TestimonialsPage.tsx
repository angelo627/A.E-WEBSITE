import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Star, MessageSquareQuote, Send, Loader2, AlertCircle, User } from "lucide-react";
import { apiFetch } from "../lib/api";

const bgPath = "/background.jpg";

const FadeInWhenVisible = ({
  children,
  delay = 0,
  y = 30,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
};

interface PublicTestimonial {
  id: string;
  name: string;
  title?: string | null;
  company?: string | null;
  content: string;
  rating?: number | null;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const isPublicTestimonial = (v: unknown): v is PublicTestimonial =>
  isObject(v) &&
  typeof v.id === "string" &&
  typeof v.name === "string" &&
  typeof v.content === "string";

const isTestimonialsResponse = (v: unknown): v is PublicTestimonial[] =>
  Array.isArray(v) && v.every(isPublicTestimonial);

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isObject(err) && typeof err.message === "string") return err.message;
  return fallback;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", role: "", content: "", rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const loadTestimonials = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await apiFetch("/public/testimonials");
      if (!isTestimonialsResponse(response)) {
        throw new Error("Unexpected testimonials response shape.");
      }
      setTestimonials(response);
    } catch (err: unknown) {
      setFetchError(getErrorMessage(err, "Failed to load testimonials."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTestimonials(); }, [loadTestimonials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!formData.name.trim() || !formData.content.trim()) {
      setSubmitError("Name and review are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/public/testimonials", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          title: formData.role.trim() || undefined,
          content: formData.content.trim(),
          rating: formData.rating,
        }),
      });
      setIsSubmitted(true);
      setFormData({ name: "", role: "", content: "", rating: 5 });
      setTimeout(() => setIsSubmitted(false), 4000);
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err, "Failed to submit review. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#050020] min-h-screen">
      <div
        className="w-full relative overflow-hidden min-h-screen"
        style={{
          backgroundImage: `url('${bgPath}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[#050020]/60 pointer-events-none fixed" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-40 pb-24">

          <FadeInWhenVisible>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight drop-shadow-[0_8px_40px_rgba(120,40,255,0.25)] mb-6">
                Community Voices
              </h1>
              <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                Read what thousands of engineers are saying about their journey with Algorithmic Explorers.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Reviews Grid (Left) */}
            <div className="lg:col-span-2">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="w-9 h-9 text-purple-400 animate-spin" />
                  <p className="text-white/50 text-sm">Loading reviews…</p>
                </div>
              )}

              {!isLoading && fetchError && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/20 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-rose-400" />
                  </div>
                  <p className="text-rose-300">{fetchError}</p>
                  <button type="button" onClick={() => void loadTestimonials()} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 rounded-xl font-medium text-white transition-colors">
                    Try Again
                  </button>
                </div>
              )}

              {!isLoading && !fetchError && testimonials.length === 0 && (
                <div className="text-center py-24">
                  <MessageSquareQuote className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                  <p className="text-white/40">No reviews yet. Be the first to share your experience!</p>
                </div>
              )}

              {!isLoading && !fetchError && testimonials.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((t, idx) => (
                    <FadeInWhenVisible delay={0.08 * idx} key={t.id}>
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full flex flex-col group">
                        <MessageSquareQuote size={28} className="text-[#7928FF]/40 mb-4" />

                        <p className="text-white/80 text-base leading-relaxed flex-grow italic mb-6">
                          "{t.content}"
                        </p>

                        <div className="flex items-center gap-3 mt-auto">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-white font-semibold text-sm truncate">{t.name}</h4>
                            {(t.title || t.company) && (
                              <p className="text-white/40 text-xs truncate">
                                {[t.title, t.company].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>
                        </div>

                        {t.rating != null && (
                          <div className="flex gap-1 mt-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={13}
                                className={i < (t.rating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-white/20"}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </FadeInWhenVisible>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Form (Right) */}
            <div className="lg:col-span-1">
              <FadeInWhenVisible delay={0.4}>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 sticky top-32">
                  <h3 className="text-2xl font-semibold text-white mb-1">Share Your Story</h3>
                  <p className="text-white/50 text-sm mb-7">Your feedback gets reviewed and might be featured on our wall of love.</p>

                  {isSubmitted ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Send className="text-emerald-400" size={20} />
                      </div>
                      <h4 className="text-white font-semibold mb-2">Submitted! 🎉</h4>
                      <p className="text-emerald-300/70 text-sm">Thank you — it'll be reviewed and published if approved.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {submitError && (
                        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <p className="text-rose-300 text-sm">{submitError}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => { setSubmitError(null); setFormData({ ...formData, name: e.target.value }); }}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7928FF] focus:ring-1 focus:ring-[#7928FF]/30 transition-colors placeholder:text-gray-600 text-sm"
                          placeholder="Jane Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Role & Company</label>
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7928FF] focus:ring-1 focus:ring-[#7928FF]/30 transition-colors placeholder:text-gray-600 text-sm"
                          placeholder="Software Engineer at ACME"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Your Review *</label>
                        <textarea
                          required
                          rows={4}
                          value={formData.content}
                          onChange={(e) => { setSubmitError(null); setFormData({ ...formData, content: e.target.value }); }}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7928FF] focus:ring-1 focus:ring-[#7928FF]/30 transition-colors resize-none placeholder:text-gray-600 text-sm"
                          placeholder="How did AE help you?"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Rating</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormData({ ...formData, rating: star })}
                              className="focus:outline-none hover:scale-110 transition-transform"
                            >
                              <Star size={22} className={star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 py-3.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#7928FF] to-[#4C00FF] text-white font-semibold shadow-[0_0_20px_rgba(120,40,255,0.3)] hover:shadow-[0_0_30px_rgba(120,40,255,0.5)] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Submit Review
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
