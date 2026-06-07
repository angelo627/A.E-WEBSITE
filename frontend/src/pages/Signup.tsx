import { useState, type ChangeEvent, type ReactElement } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiArrowRight } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5050/api";

type SignupData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
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

const InputField = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  extra,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  extra?: React.ReactNode;
}) => (
  <div>
    <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--label-text)" }}>
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={id}
        className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#33418f]/20 transition-all"
        style={{
          background: "var(--input-bg)",
          border: "1.5px solid var(--input-border)",
          color: "var(--input-text)",
          paddingRight: extra ? "3rem" : undefined,
        }}
      />
      {extra}
    </div>
  </div>
);

const Signup = (): ReactElement => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [data, setData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange =
    (field: keyof SignupData) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setError(null);
      setData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const createAccount = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (
      !data.firstName.trim() ||
      !data.lastName.trim() ||
      !data.username.trim() ||
      !data.email.trim() ||
      !data.password.trim() ||
      !data.confirmPassword.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!data.email.includes("@") || !data.email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (data.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const ToggleBtn = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-[#33418f] transition-colors"
      style={{ color: "var(--muted-text)" }}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen w-full flex overflow-hidden">

      {/* ── Left: Decorative Brand Panel (always dark gradient) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[38%] xl:w-[42%] shrink-0 relative overflow-hidden p-12"
        style={{ background: "linear-gradient(160deg, #1e1735 0%, #251d3f 45%, #33418f 100%)" }}
      >
        {/* Blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[350px] h-[350px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #9aa8e7, transparent)" }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #e3b5ee, transparent)" }} />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white font-black text-xl tracking-tight">A.E Platform</span>
        </div>

        {/* Features list */}
        <div className="relative z-10 my-auto">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-semibold mb-6">Why join us?</p>
          <div className="space-y-5">
            {[
              { icon: "🚀", title: "Accelerated Learning", desc: "Structured AI/ML cohorts built by industry experts." },
              { icon: "🏆", title: "Earn Credentials", desc: "Blockchain-verified certificates upon completion." },
              { icon: "🌐", title: "Global Network", desc: "Connect with 2,400+ engineers worldwide." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-0.5">{title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-10 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[{ n: "2.4k+", l: "Members" }, { n: "50+", l: "Modules" }, { n: "100%", l: "Free" }].map(({ n, l }) => (
              <div key={l}>
                <p className="text-white font-black text-xl">{n}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/25 text-xs tracking-widest uppercase">
          Join the next generation of algorithmic thinkers
        </p>
      </div>

      {/* ── Right: Form Panel (theme-aware) ── */}
      <div
        className="flex-1 overflow-y-auto flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20"
        style={{ background: "var(--auth-form-bg)" }}
      >
        <div className="w-full max-w-lg mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#33418f" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-black text-lg tracking-tight uppercase" style={{ color: "var(--text-color)" }}>A.E Platform</span>
          </div>

          {/* ── Success State ── */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce" style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}>
                <FiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ color: "var(--text-color)" }}>Account Created! 🎉</h2>
              <p className="text-sm mb-1" style={{ color: "var(--muted-text)" }}>Your journey begins shortly.</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#33418f]">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-6">
                <h1 className="text-3xl font-black leading-tight tracking-tight mb-1" style={{ color: "var(--text-color)" }}>
                  Create your account ✨
                </h1>
                <p className="text-sm font-medium" style={{ color: "var(--muted-text)" }}>
                  Join thousands of engineers on their AI journey
                </p>
              </div>

              {/* Social Buttons - icon only */}
              <div className="flex items-center gap-3 mb-5">
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
                  onClick={() => setError("Facebook coming soon!")}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                  style={{ background: "var(--social-btn-bg)", border: "1.5px solid var(--input-border)" }}
                >
                  <FaFacebook className="text-[#0866FF]" size={18} />
                </button>
                <button
                  type="button"
                  title="Continue with Microsoft"
                  onClick={() => setError("Microsoft coming soon!")}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                  style={{ background: "var(--social-btn-bg)", border: "1.5px solid var(--input-border)" }}
                >
                  <FaMicrosoft className="text-[#00A4EF]" size={18} />
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: "var(--divider-color)" }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--muted-text)" }}>or register with email</span>
                <div className="flex-1 h-px" style={{ background: "var(--divider-color)" }} />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 border-l-4 border-red-500" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm font-semibold text-red-500">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={createAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InputField id="firstName" label="First Name" type="text" placeholder="David" value={data.firstName} onChange={handleInputChange("firstName")} />
                  <InputField id="lastName" label="Last Name" type="text" placeholder="Smith" value={data.lastName} onChange={handleInputChange("lastName")} />
                </div>

                <InputField id="username" label="Username" type="text" placeholder="Choose a username" value={data.username} onChange={handleInputChange("username")} />

                <InputField id="email" label="Email Address" type="email" placeholder="Enter email address" value={data.email} onChange={handleInputChange("email")} />

                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 chars"
                    value={data.password}
                    onChange={handleInputChange("password")}
                    extra={<ToggleBtn show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                  />
                  <InputField
                    id="confirmPassword"
                    label="Confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    value={data.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    extra={<ToggleBtn show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-black text-white text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #33418f, #251d3f)", boxShadow: "0 4px 20px rgba(51,65,143,0.35)" }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-text)" }}>
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-[#33418f] hover:text-[var(--ae-plum-deep)] transition-colors underline underline-offset-2">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
