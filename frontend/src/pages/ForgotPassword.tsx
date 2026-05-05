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
    <div className="min-h-screen w-full bg-[#050020] flex items-center justify-center px-4 py-20 font-outfit">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">A.E Platform</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl">
          {!sent ? (
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-7 h-7 text-violet-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-white">Forgot your password?</h1>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 mb-6">
                  <FiAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <p className="text-sm text-rose-300">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="fp-email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Your Email Address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setError(null); setEmail(e.target.value); }}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3.5 text-white placeholder:text-gray-600 transition-all text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-4 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link →"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Remembered it?{" "}
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox!</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                If an account exists for <span className="text-violet-400 font-medium">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <p className="text-gray-600 text-xs mb-6">Didn't get it? Check your spam folder.</p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors"
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
