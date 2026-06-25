import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { FiAlertCircle, FiCheckCircle, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    if (password !== confirm) {
      setError("Passwords do not match."); return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password })
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired reset link.";
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

          {!done ? (
            <>
              {/* Header */}
              <div className="mb-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--ae-blue)]/10 border border-[var(--ae-blue)]/20 flex items-center justify-center mx-auto mb-6">
                  <FiLock className="w-8 h-8 text-[var(--ae-blue)]" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-color)] italic tracking-tighter uppercase mb-3">Reset <span className="text-[var(--ae-blue)]">Access</span></h1>
                <p className="text-[var(--text-color)]/60 text-sm font-medium italic leading-relaxed">Choose something strong that you'll remember.</p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-4 bg-red-500/5 border-l-4 border-red-500 rounded-xl px-5 py-4 mb-8">
                  <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm font-bold text-red-500 italic uppercase tracking-tight">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="rp-password" className="block text-[10px] font-black text-[var(--text-color)]/40 uppercase tracking-[0.15em] ml-1">
                    New Security Key
                  </label>
                  <div className="relative group">
                    <input
                      id="rp-password"
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => { setError(null); setPassword(e.target.value); }}
                      className="w-full rounded-2xl bg-[var(--bg-color)]/50 border-0 focus:bg-[var(--bg-color)] focus:ring-4 focus:ring-[var(--ae-blue)]/5 outline-none px-6 py-4.5 pr-14 text-[var(--text-color)] placeholder:text-[var(--text-color)]/10 transition-all font-semibold text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] group-hover:bg-[var(--bg-color)]"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-color)]/20 hover:text-[var(--ae-blue)] transition-colors">
                      {showPw ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="rp-confirm" className="block text-[10px] font-black text-[var(--text-color)]/40 uppercase tracking-[0.15em] ml-1">
                    Confirm Key
                  </label>
                  <div className="relative group">
                    <input
                      id="rp-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your key"
                      value={confirm}
                      onChange={(e) => { setError(null); setConfirm(e.target.value); }}
                      className="w-full rounded-2xl bg-[var(--bg-color)]/50 border-0 focus:bg-[var(--bg-color)] focus:ring-4 focus:ring-[var(--ae-blue)]/5 outline-none px-6 py-4.5 pr-14 text-[var(--text-color)] placeholder:text-[var(--text-color)]/10 transition-all font-semibold text-[15px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] group-hover:bg-[var(--bg-color)]"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-color)]/20 hover:text-[var(--ae-blue)] transition-colors">
                      {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl ae-brand-button text-white shadow-xl hover:shadow-2xl font-black py-5 transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0 uppercase tracking-[0.2em] italic"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating Access…
                    </>
                  ) : (
                    "Reset My Password →"
                  )}
                </button>
              </form>

              <p className="mt-10 text-center text-xs font-black text-[var(--text-color)]/30 uppercase tracking-widest italic">
                <Link to="/login" className="text-[var(--ae-blue)] hover:text-[var(--ae-plum-deep)] transition-colors underline decoration-[var(--ae-blue)]/20 underline-offset-4 ml-1">
                  ← Back to Sign In
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-color)] mb-3 uppercase italic underline decoration-emerald-500/20 underline-offset-8 tracking-tight">Access Restored! 🎉</h2>
              <p className="text-[var(--text-color)]/60 text-sm font-medium italic">Redirecting you to sign in…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
