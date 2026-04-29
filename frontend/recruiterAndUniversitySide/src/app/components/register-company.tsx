import { useState } from "react";
import { useTheme } from "./theme-context";
import { Building2, Briefcase, ChevronRight, Loader2, ArrowLeft, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Navbar } from "./navbar";

export function RegisterCompany() {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill out all fields.");
      return;
    }
    setLoading(true);
    try {
      // 1. Create Recruiter Account
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "RECRUITER" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // 2. Auto Login to get token for next step
      const loginRes = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem("token", loginData.token);
        localStorage.setItem("userRole", loginData.user.role);
        setStep(2);
      } else {
        throw new Error("Login failed after registration");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      toast.error("Company name is required.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/companies/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyName, industry }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register company");

      toast.success("Company registered successfully!");
      navigate("/recruiter-dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to link company.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${
    dk 
      ? "bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-gray-500" 
      : "bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-100 text-gray-900 placeholder-gray-400"
  }`;

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <Navbar />
      <div className="pt-32 pb-24 px-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
            dk ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-blue-600" : dk ? "bg-white/10" : "bg-gray-200"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-blue-600" : dk ? "bg-white/10" : "bg-gray-200"}`} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-8">
                  <h2 className={`text-2xl font-bold tracking-tight mb-2 ${dk ? "text-white" : "text-gray-900"}`}>Create Recruiter Account</h2>
                  <p className={`text-sm ${dk ? "text-gray-400" : "text-gray-500"}`}>First, let's set up your personal login.</p>
                </div>

                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="relative">
                    <User className={`absolute left-3.5 top-3.5 w-5 h-5 ${dk ? "text-gray-500" : "text-gray-400"}`} />
                    <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-3.5 w-5 h-5 ${dk ? "text-gray-500" : "text-gray-400"}`} />
                    <input type="email" placeholder="Work Email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-3.5 w-5 h-5 ${dk ? "text-gray-500" : "text-gray-400"}`} />
                    <input type="password" placeholder="Password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
                  </div>
                  
                  <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ChevronRight className="w-5 h-5" /></>}
                  </button>
                </form>
                
                <div className="mt-6 text-center">
                  <button onClick={() => navigate("/login")} className={`text-sm hover:underline ${dk ? "text-gray-400" : "text-gray-500"}`}>Already have an account? Log in</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-8">
                  <h2 className={`text-2xl font-bold tracking-tight mb-2 flex items-center gap-2 ${dk ? "text-white" : "text-gray-900"}`}>
                    <Building2 className="w-6 h-6 text-blue-500" /> Company Details
                  </h2>
                  <p className={`text-sm ${dk ? "text-gray-400" : "text-gray-500"}`}>Register your company to start hiring.</p>
                </div>

                <form onSubmit={handleLinkCompany} className="space-y-4">
                  <div className="relative">
                    <Briefcase className={`absolute left-3.5 top-3.5 w-5 h-5 ${dk ? "text-gray-500" : "text-gray-400"}`} />
                    <input type="text" placeholder="Company Name (e.g. Google, Stripe)" required value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="relative">
                    <select 
                      required 
                      value={industry} 
                      onChange={e => setIndustry(e.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="" disabled>Select Industry</option>
                      <option value="Software/IT">Software / IT</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronRight className={`absolute right-4 top-3.5 w-5 h-5 rotate-90 pointer-events-none ${dk ? "text-gray-500" : "text-gray-400"}`} />
                  </div>
                  
                  <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Setup <CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
