import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowRight, Cpu, Loader2 } from "lucide-react";
import { useApp } from "./app-context";
import { authApi } from "../../lib/api";

type FormMode = "login" | "register";

export function StudentAuthPage() {
  const navigate = useNavigate();
  const { setTokenAndUser, setRole } = useApp();

  const [mode, setMode] = useState<FormMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await authApi.register({ name, email, password, role: "STUDENT" });
        setSuccessMsg(
          "Account created! You can now log in."
        );
        setMode("login");
        setName("");
        setPassword("");
      } else {
        const res = await authApi.login({ email, password });
        if (res.user.role !== "STUDENT") {
          setError("This portal is for students only. Please use the correct login.");
          return;
        }
        setTokenAndUser(res.token, res.user);
        setRole("student");
        navigate("/student");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 flex flex-col items-center justify-center px-6 font-[Inter,system-ui,sans-serif]">
      {/* Nav logo */}
      <div
        className="flex items-center gap-2.5 mb-8 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl text-gray-900">in-turn</span>
          <span className="text-[10px] text-gray-400 block -mt-1 tracking-wide">
            Campus Placement Portal
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl shadow-indigo-500/5 p-8"
      >
        {/* Mode toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {(["login", "register"] as FormMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                mode === m
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <h1 className="text-xl text-gray-900 mb-1">
          {mode === "login" ? "Welcome back" : "Join in-turn"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {mode === "login"
            ? "Sign in to your student account"
            : "Create your student placement account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {successMsg && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setSuccessMsg("");
            }}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            {mode === "login" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
      </motion.div>

      <p className="text-xs text-gray-400 mt-6">
        Placement Season 2025–26 · in-turn Campus Portal
      </p>
    </div>
  );
}