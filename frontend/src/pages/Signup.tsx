import { useState, type ChangeEvent, type ReactElement } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import classImg from "/class.png";

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
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
        className="w-full rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3.5 text-white placeholder:text-gray-600 transition-all text-sm pr-12"
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

  const ToggleBtn = ({
    show,
    onToggle,
  }: {
    show: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-[#050020] flex items-stretch overflow-hidden">
      {/* ── Left: Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 xl:px-24 z-10">
        <div className="w-full max-w-lg">

          {/* Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">A.E Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-6 leading-tight">
              Create your account ✨
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Join thousands of learners today. It's free.</p>
          </div>

          {/* ── Success State ── */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account Created! 🎉</h2>
              <p className="text-gray-400 text-sm mb-1">Please check your email to verify your account.</p>
              <p className="text-gray-600 text-xs">Redirecting to login…</p>
            </div>
          ) : (
            <>
              {/* ── Social Buttons ── */}
              <div className="flex flex-col sm:flex-row gap-3 mb-7">
                <a
                  href="https://accounts.google.com/signin"
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm px-4 py-3 transition-all duration-200 group"
                >
                  <FaGoogle className="text-[#EA4335]" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Google</span>
                </a>
                <a
                  href="https://www.facebook.com/login/"
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm px-4 py-3 transition-all duration-200 group"
                >
                  <FaFacebook className="text-[#0866FF]" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Facebook</span>
                </a>
                <a
                  href="https://login.microsoftonline.com/"
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm px-4 py-3 transition-all duration-200 group"
                >
                  <FaMicrosoft className="text-[#00A4EF]" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Microsoft</span>
                </a>
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest whitespace-nowrap">or register with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* ── Error Alert ── */}
              {error && (
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 mb-5">
                  <FiAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <p className="text-sm text-rose-300">{error}</p>
                </div>
              )}

              {/* ── Form ── */}
              <form onSubmit={createAccount} className="space-y-4">
                {/* First + Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    id="firstName"
                    label="First Name"
                    type="text"
                    placeholder="Enter your first name"
                    value={data.firstName}
                    onChange={handleInputChange("firstName")}
                  />
                  <InputField
                    id="lastName"
                    label="Last Name"
                    type="text"
                    placeholder="Enter your last name"
                    value={data.lastName}
                    onChange={handleInputChange("lastName")}
                  />
                </div>

                {/* Username */}
                <InputField
                  id="username"
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={data.username}
                  onChange={handleInputChange("username")}
                />

                {/* Email */}
                <InputField
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email address"
                  value={data.email}
                  onChange={handleInputChange("email")}
                />

                {/* Password + Confirm */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 chars"
                    value={data.password}
                    onChange={handleInputChange("password")}
                    extra={
                      <ToggleBtn show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                    }
                  />
                  <InputField
                    id="confirmPassword"
                    label="Confirm Password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    value={data.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    extra={
                      <ToggleBtn show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
                    }
                  />
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
                      Creating Account…
                    </>
                  ) : (
                    "Create Account →"
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Right: Image Panel ── */}
      <div className="hidden lg:block relative w-[42%] xl:w-[48%] shrink-0">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050020] via-[#050020]/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050020] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050020] to-transparent z-10 pointer-events-none" />

        <img
          src={classImg}
          alt="Students learning"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Floating stats card */}
        <div className="absolute top-12 right-10 z-20">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl min-w-[180px]">
            <p className="text-4xl font-extrabold text-white">2.4k+</p>
            <p className="text-gray-400 text-sm mt-1">Active learners</p>
            <div className="flex items-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="text-gray-400 text-xs ml-1">5.0</span>
            </div>
          </div>
        </div>

        {/* Floating bottom badge */}
        <div className="absolute bottom-12 right-10 z-20 max-w-[220px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-sm">Certified Learning</p>
            <p className="text-gray-500 text-xs mt-1">Earn certificates upon completion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
