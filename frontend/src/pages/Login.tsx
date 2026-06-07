import { useState, type ReactElement } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/useAuth";
import type { AuthUser } from "../context/AuthContext";
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5050/api";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

const Login = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your email/username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: identifier, password }),
      }) as { user: AuthUser; accessToken: string };

      login(response.user, response.accessToken);
      
      // Determine dashboard path based on role if available in response, otherwise default to dashboard
      const role = response.user.role;
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      const targetPath = from ?? (role === "ADMIN" || role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
      
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid credentials. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">

      {/* ── Left: Decorative Brand Panel (always dark) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[50%] shrink-0 relative overflow-hidden p-12"
        style={{ background: "linear-gradient(135deg, #1e1735 0%, #251d3f 40%, #33418f 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #9aa8e7, transparent)" }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #e3b5ee, transparent)" }} />

        {/* Brand mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-white font-black text-xl tracking-tight">A.E Platform</span>
          </div>
        </div>

        {/* Center quote */}
        <div className="relative z-10 my-auto">
          <div className="text-6xl text-white/20 font-serif leading-none mb-4">"</div>
          <p className="text-white/80 text-xl font-medium leading-relaxed mb-8">
            The best way to predict the future is to build it ourselves.
          </p>
          <p className="text-[#9aa8e7] text-sm font-semibold tracking-widest uppercase">
            — Accelerated Engineers
          </p>
          <div className="flex gap-8 mt-12">
            {[
              { n: "2.4k+", l: "Members" },
              { n: "120k+", l: "Learners" },
              { n: "50+", l: "Modules" },
            ].map(({ n, l }) => (
              <div key={l}>
                <p className="text-white font-black text-2xl">{n}</p>
                <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/30 text-xs tracking-widest uppercase">
            Join the next generation of algorithmic thinkers
          </p>
        </div>
      </div>

      {/* ── Right: Form Panel (theme-aware) ── */}
      <div
        className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 overflow-y-auto"
        style={{ background: "var(--auth-form-bg)" }}
      >
        <div className="w-full max-w-md mx-auto">

          {/* Mobile brand header */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow" style={{ background: "#33418f" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-black text-[var(--text-color)] text-lg tracking-tight uppercase">A.E Platform</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-2" style={{ color: "var(--text-color)" }}>
              Welcome back 👋
            </h1>
            <p className="text-sm font-medium" style={{ color: "var(--muted-text)" }}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Social Login - icon only */}
          <div className="flex items-center gap-3 mb-6">
            <a
              href={`${API_BASE}/auth/google`}
              title="Continue with Google"
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              style={{ background: "var(--social-btn-bg)", border: "1.5px solid var(--input-border)" }}
            >
              <FaGoogle className="text-[#EA4335]" size={18} />
            </a>
            <button
              type="button"
              title="Continue with Facebook"
              onClick={() => setError("Facebook login coming soon!")}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              style={{ background: "var(--social-btn-bg)", border: "1.5px solid var(--input-border)" }}
            >
              <FaFacebook className="text-[#0866FF]" size={18} />
            </button>
            <button
              type="button"
              title="Continue with Microsoft"
              onClick={() => setError("Microsoft login coming soon!")}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              style={{ background: "var(--social-btn-bg)", border: "1.5px solid var(--input-border)" }}
            >
              <FaMicrosoft className="text-[#00A4EF]" size={18} />
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--divider-color)" }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--muted-text)" }}>or continue manually</span>
            <div className="flex-1 h-px" style={{ background: "var(--divider-color)" }} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 border-l-4 border-red-500" style={{ background: "rgba(239,68,68,0.08)" }}>
              <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-500">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--label-text)" }}>
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="you@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl px-4 py-3.5 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-[#33418f]/20"
                style={{
                  background: "var(--input-bg)",
                  border: "1.5px solid var(--input-border)",
                  color: "var(--input-text)",
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--label-text)" }}>
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#33418f] hover:text-[var(--ae-plum-deep)] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3.5 pr-12 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-[#33418f]/20"
                  style={{
                    background: "var(--input-bg)",
                    border: "1.5px solid var(--input-border)",
                    color: "var(--input-text)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-[#33418f] transition-colors"
                  style={{ color: "var(--muted-text)" }}
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: "linear-gradient(135deg, #33418f, #251d3f)", boxShadow: "0 4px 20px rgba(51,65,143,0.35)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: "var(--muted-text)" }}>
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-bold text-[#33418f] hover:text-[var(--ae-plum-deep)] transition-colors underline underline-offset-2">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
