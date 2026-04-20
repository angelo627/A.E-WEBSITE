import { useState, useEffect, type ChangeEvent, type ReactElement } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../lib/api";
import loginImg from "/login_mage.png";
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

type LoginData = {
  username: string;
  password: string;
};

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
  const { login, isLoggedIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoginData>({ username: "", password: "" });

  useEffect(() => {
    if (isLoggedIn) {
      const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
      navigate(isAdmin ? "/admin" : "/dashboard");
    }
  }, [isLoggedIn, navigate, user?.role]);

  const handleLogin = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    setError(null);

    if (data.username.trim() === "" || data.password.trim() === "") {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.username,
          password: data.password,
        }),
      });

      login(result.user, result.accessToken);
      const isAdmin = result?.user?.role === "ADMIN" || result?.user?.role === "SUPER_ADMIN";
      navigate(isAdmin ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid credentials. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof LoginData) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setError(null);
      setData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <div className="min-h-screen w-full bg-[#050020] flex items-stretch overflow-hidden">
      {/* ── Left: Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 xl:px-24 z-10">
        <div className="w-full max-w-md">

          {/* Logo / Brand */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">A.E Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-6 leading-tight">
              Welcome back
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Sign in to continue your learning journey.</p>
          </div>

          {/* ── Social Buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Google */}
            <a
              href="https://accounts.google.com/signin"
              className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm px-4 py-3 transition-all duration-200 group"
            >
              <span className="w-5 h-5 flex items-center justify-center text-lg">
                <FaGoogle className="text-[#EA4335]" />
              </span>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Google</span>
            </a>
            {/* Facebook */}
            <a
              href="https://www.facebook.com/login/"
              className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm px-4 py-3 transition-all duration-200 group"
            >
              <span className="w-5 h-5 flex items-center justify-center text-lg">
                <FaFacebook className="text-[#0866FF]" />
              </span>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Facebook</span>
            </a>
            {/* Microsoft */}
            <a
              href="https://login.microsoftonline.com/"
              className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm px-4 py-3 transition-all duration-200 group"
            >
              <span className="w-5 h-5 flex items-center justify-center text-lg">
                <FaMicrosoft className="text-[#00A4EF]" />
              </span>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Microsoft</span>
            </a>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest whitespace-nowrap">or sign in with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* ── Error Alert ── */}
          {error && (
            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 mb-6">
              <FiAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email or Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your email or username"
                value={data.username}
                onChange={handleInputChange("username")}
                className="w-full rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3.5 text-white placeholder:text-gray-600 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={data.password}
                  onChange={handleInputChange("password")}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3.5 pr-12 text-white placeholder:text-gray-600 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-4 mt-2 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* ── Footer ── */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Image Panel ── */}
      <div className="hidden lg:block relative w-[45%] xl:w-[50%] shrink-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050020] via-[#050020]/30 to-transparent z-10 pointer-events-none" />
        {/* Top & bottom fades */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050020] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050020] to-transparent z-10 pointer-events-none" />

        <img
          src={loginImg}
          alt="Learning platform illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Floating badge */}
        <div className="absolute bottom-12 left-12 z-20 max-w-xs">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {["bg-violet-500","bg-pink-500","bg-cyan-500"].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#050020] flex items-center justify-center text-[10px] font-bold text-white`}>
                    {["A","B","C"][i]}
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-300 font-medium">2,400+ learners enrolled</span>
            </div>
            <p className="text-white font-semibold text-sm leading-snug">
              "The best learning platform I've used — structured, clean, and powerful."
            </p>
            <p className="text-gray-500 text-xs mt-2">— Top-rated by students</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
