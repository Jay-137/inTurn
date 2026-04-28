import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Briefcase, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { useNavigate } from "react-router";

export function LoginPage() {
  const { theme, toggle } = useTheme();
  const dk = theme === "dark";
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<"recruiter" | "institution">("recruiter");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError("Please fill in all fields.");
      return;
    }
    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if user role matches the selected role
      if (role === "institution" && data.user.role !== "UNIVERSITY") {
        throw new Error("Invalid role. Please log in as a university.");
      }
      if (role === "recruiter" && data.user.role !== "RECRUITER") {
        throw new Error("Invalid role. Please log in as a recruiter.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "UNIVERSITY") {
        navigate("/institution-dashboard");
      } else {
        navigate("/recruiter-dashboard");
      }
    } catch (err: any) {
      setLoginError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 ${
        dk ? "bg-[#0a0a0f]" : "bg-gray-50"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md rounded-2xl p-8 md:p-10 border ${
          dk
            ? "bg-[#111116] border-white/10"
            : "bg-white border-gray-300"
        }`}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm tracking-tight">in</span>
          </div>
          <span
            className={`text-lg tracking-tight ${
              dk ? "text-white" : "text-gray-900"
            }`}
          >
            Inturn
          </span>
        </div>

        <h1
          className={`text-2xl tracking-tight mb-1 ${
            dk ? "text-white" : "text-gray-900"
          }`}
        >
          Welcome back
        </h1>
        <p
          className={`text-sm mb-8 ${
            dk ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Sign in to your recruiter or institution account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role toggle */}
          <div className={`flex gap-1 p-1 rounded-lg ${dk ? "bg-white/[0.04]" : "bg-gray-100"}`}>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md transition-all ${
                role === "recruiter"
                  ? dk ? "bg-white/10 text-white" : "bg-white text-gray-900 shadow-sm"
                  : dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Briefcase className="w-3 h-3" />
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => setRole("institution")}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md transition-all ${
                role === "institution"
                  ? dk ? "bg-white/10 text-white" : "bg-white text-gray-900 shadow-sm"
                  : dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              Institution
            </button>
          </div>

          {/* Email */}
          <div>
            <label
              className={`block text-sm mb-1.5 ${
                dk ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={`w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors border ${
                dk
                  ? "bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
              }`}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className={`block text-sm mb-1.5 ${
                dk ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors border pr-10 ${
                  dk
                    ? "bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {loginError && (
            <p className="text-sm text-red-500">{loginError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className={`flex-1 h-px ${dk ? "bg-white/10" : "bg-gray-200"}`} />
          <span className={`text-xs ${dk ? "text-gray-600" : "text-gray-400"}`}>
            or
          </span>
          <div className={`flex-1 h-px ${dk ? "bg-white/10" : "bg-gray-200"}`} />
        </div>

        {/* Sign up link */}
        <p
          className={`text-sm text-center ${
            dk ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/get-started")}
            className="text-blue-600 hover:text-blue-500 transition-colors"
          >
            Get started
          </button>
        </p>
      </motion.div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className={`mt-6 text-xs px-3 py-1.5 rounded-full border transition-colors ${
          dk
            ? "border-white/10 text-gray-500 hover:text-gray-300"
            : "border-gray-200 text-gray-400 hover:text-gray-600"
        }`}
      >
        {dk ? "Light mode" : "Dark mode"}
      </button>
    </div>
  );
}
