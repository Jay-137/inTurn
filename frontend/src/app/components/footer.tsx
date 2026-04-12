import { useTheme } from "./theme-context";

export function Footer() {
  const { theme } = useTheme();
  const dk = theme === "dark";

  return (
    <footer className={`border-t py-12 ${dk ? "border-white/5" : "border-gray-200"}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs tracking-tight">in</span>
          </div>
          <span className={`tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>Inturn</span>
        </div>
        <div className={`flex items-center gap-8 text-sm ${dk ? "text-gray-600" : "text-gray-400"}`}>
          <a href="#" className={`hover:${dk ? "text-gray-300" : "text-gray-900"} transition-colors`}>Privacy</a>
          <a href="#" className={`hover:${dk ? "text-gray-300" : "text-gray-900"} transition-colors`}>Terms</a>
          <a href="#" className={`hover:${dk ? "text-gray-300" : "text-gray-900"} transition-colors`}>Contact</a>
        </div>
        <p className={`text-sm ${dk ? "text-gray-600" : "text-gray-400"}`}>&copy; 2026 Inturn. All rights reserved.</p>
      </div>
    </footer>
  );
}
