import { motion } from "motion/react";
import type { ReactNode } from "react";

export function GradientButton({
  children,
  onClick,
  className = "",
  size = "md",
  variant = "primary",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: (e?: any) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5",
    lg: "px-8 py-3.5 text-lg",
  };
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40",
    outline: "border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-indigo-600 hover:bg-indigo-50",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Card({
  children,
  className = "",
  hover = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: "0 12px 40px rgba(99, 102, 241, 0.12)" } : undefined}
      className={`bg-white rounded-2xl border border-border p-6 shadow-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = "indigo",
  size = "md",
  animated = true,
}: {
  value: number;
  max?: number;
  color?: "indigo" | "purple" | "emerald" | "amber" | "rose" | "blue";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const colorMap = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-400 to-amber-500",
    rose: "from-rose-500 to-rose-600",
    blue: "from-blue-500 to-blue-600",
  };
  const sizeMap = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeMap[size]}`}>
      <motion.div
        initial={animated ? { width: 0 } : false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]}`}
      />
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "priority" | "info" | "neutral";
  className?: string;
}) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    priority: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    neutral: "bg-gray-100 text-gray-600 border border-gray-300",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function MatchScoreCircle({ score, size = 64 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={4} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-sm" style={{ color }}>{score}%</span>
    </div>
  );
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl text-gray-900">{children}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl mt-1 text-gray-900">{value}</p>
          {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}
