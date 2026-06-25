import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { FiAlertCircle, FiCheckCircle, FiMail } from "react-icons/fi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Please enter your email address."); return; }

    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() })
      });
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full ae-brand-page flex items-center justify-center px-4 py-20 font-outfit">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl ae-brand-button flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            <span className="text-[var(--text-color)] font-black text-lg tracking-tight uppercase">A.E Platform</span>
          </div>
        </div>

        <div className="ae-brand-card border border-transparent rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ae-blue)]/5 rounded-bl-[4rem] -mr-16 -mt-16 pointer-events-none" />

          {!sent ? (
            <>
              {/* Header */}
              <div className="mb-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--ae-blue)]/10 border border-[var(--ae-blue)]/20 flex items-center justify-center mx-auto mb-6">
                  <FiMail className="w-8 h-8 text-[var(--ae-blue)]" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-color)] italic tracking-tighter uppercase mb-3">Forgot <span className="text-[var(--ae-blue)]">Key?</span></h1>
                <p className="text-[var(--text-color)]/60 text-sm font-medium italic leading-relaxed">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-4 bg-red-500/5 border-l-4 border-red-500 rounded-xl px-5 py-4 mb-8">
                  <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm font-bold text-red-500 italic uppercase tracking-tight">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label htmlFor="fp-email" className="block text-[10px] font-black text-[var(--text-color)]/40 uppercase tracking-[0.15em] ml-1">
                    Your Email Address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setError(null); setEmail(e.target.value); }}
                    className="w-full rounded-2xl bg-[var(--bg-color)]/50 border-0 focus:bg-[var(--bg-color)] focus:ring-4 focus:ring-[var(--ae-blue)]/5 outline-none px-6 py-4.5 text-[var(--text-color)] placeholder:text-[var(--text-color)]/10 transition-all font-semibold text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl ae-brand-button text-white shadow-xl hover:shadow-2xl font-black py-5 transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0 uppercase tracking-[0.2em] italic"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link →"
                  )}
                </button>
              </form>

              <p className="mt-10 text-center text-xs font-black text-[var(--text-color)]/30 uppercase tracking-widest italic">
                Remembered it?{" "}
                <Link to="/login" className="text-[var(--ae-blue)] hover:text-[var(--ae-plum-deep)] transition-colors underline decoration-[var(--ae-blue)]/20 underline-offset-4 ml-1">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-color)] mb-3 uppercase italic tracking-tight underline decoration-emerald-500/20 underline-offset-8">Check Inbox! 📬</h2>
              <p className="text-[var(--text-color)]/60 text-base leading-relaxed mb-8 font-medium italic">
                If an account exists for <span className="text-[var(--ae-blue)] font-bold">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-[var(--bg-color)]/50 border border-transparent hover:border-[var(--ae-blue)]/10 text-[var(--ae-blue)] text-sm font-black uppercase tracking-widest transition-all italic underline decoration-[var(--ae-blue)]/20 underline-offset-4"
              >
                ← Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
