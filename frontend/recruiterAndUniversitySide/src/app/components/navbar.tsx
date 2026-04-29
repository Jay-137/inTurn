import {
  Menu, X, Sun, Moon, GraduationCap, Briefcase, ChevronDown,
  CreditCard, Building2, FileText, Info, HelpCircle,
} from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "./theme-context";
import { useNavigate } from "react-router";

/* ── hover helper ── */
function useHover() {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => { if (t.current) clearTimeout(t.current); setOpen(true); };
  const leave = () => { t.current = setTimeout(() => setOpen(false), 120); };
  return { open, enter, leave, setOpen };
}

/* ── mega-dropdown column item ── */
function MegaItem({
  icon: Icon,
  title,
  dk,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  dk: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href="#"
      onClick={(e) => { if (onClick) { e.preventDefault(); onClick(); } }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${dk ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${dk ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}
      >
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <span className={`text-sm ${dk ? "text-white" : "text-gray-900"}`}>{title}</span>
    </a>
  );
}

/* ── column heading inside mega dropdown ── */
function ColHeading({ children, dk }: { children: string; dk: boolean }) {
  return (
    <p className={`text-[11px] uppercase tracking-wider mb-2 px-3 ${dk ? "text-gray-500" : "text-gray-400"}`}>
      {children}
    </p>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAcc, setMobileAcc] = useState<string | null>(null);
  const { theme, toggle } = useTheme();
  const dk = theme === "dark";
  const navigate = useNavigate();

  const solutions = useHover();
  const pricing = useHover();
  const resources = useHover();

  const activeMenu = solutions.open ? "solutions" : pricing.open ? "pricing" : resources.open ? "resources" : null;

  const closeAll = () => {
    solutions.setOpen(false);
    pricing.setOpen(false);
    resources.setOpen(false);
  };

  const goInstitutions = () => { closeAll(); setMobileOpen(false); navigate("/institutions"); };

  const navItemCls = (isOpen: boolean) =>
    `flex items-center gap-1 px-4 py-2 text-sm transition-all cursor-pointer hover:scale-105 origin-center ${
      isOpen
        ? dk ? "text-white font-semibold scale-105" : "text-gray-900 font-semibold scale-105"
        : dk ? "text-gray-300 font-medium hover:text-white" : "text-gray-900 font-medium hover:text-black"
    }`;

  /* Mega dropdown panel – full width, anchored below entire nav */
  const megaCls = `absolute left-0 right-0 top-full border-b transition-all ${
    dk
      ? "bg-[#111116] border-white/10 shadow-xl shadow-black/30"
      : "bg-white border-gray-200 shadow-lg shadow-gray-200/40"
  }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ${
        dk ? "bg-[#0a0a0f]/80 border-white/5" : "bg-white/80 border-gray-200"
      }`}
      onMouseLeave={closeAll}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm tracking-tight">in</span>
          </div>
          <span className={`text-lg tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>Inturn</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0">
          <div
            onMouseEnter={() => { closeAll(); solutions.enter(); }}
            className={navItemCls(solutions.open)}
          >
            Solutions
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${solutions.open ? "rotate-180" : ""}`} />
          </div>

          <a
            href="#how-it-works"
            onMouseEnter={closeAll}
            className={`px-4 py-2 text-sm font-medium transition-all hover:scale-105 origin-center ${dk ? "text-gray-300 hover:text-white" : "text-gray-900 hover:text-black"}`}
          >
            How it Works
          </a>

          <div
            onMouseEnter={() => { closeAll(); pricing.enter(); }}
            className={navItemCls(pricing.open)}
          >
            Pricing
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${pricing.open ? "rotate-180" : ""}`} />
          </div>

          <div
            onMouseEnter={() => { closeAll(); resources.enter(); }}
            className={navItemCls(resources.open)}
          >
            Resources
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${resources.open ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              dk ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
            aria-label="Toggle theme"
          >
            {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className={`text-sm font-medium px-4 py-2 transition-colors ${dk ? "text-gray-300 hover:text-white" : "text-gray-900 hover:text-black"}`} onClick={() => navigate("/login")}>
            Log in
          </button>
          <button className="text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors" onClick={() => navigate("/get-started")}>
            Get Started
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggle} className={dk ? "text-gray-400" : "text-gray-500"}>
            {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className={dk ? "text-gray-400" : "text-gray-500"} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── MEGA DROPDOWNS (full-width) ── */}

      {/* Solutions mega */}
      {solutions.open && (
        <div className={megaCls} onMouseEnter={solutions.enter} onMouseLeave={solutions.leave}>
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 gap-8">
            <div>
              <ColHeading dk={dk}>Platform</ColHeading>
              <MegaItem icon={GraduationCap} title="For Universities" dk={dk} onClick={goInstitutions} />
              <MegaItem icon={Briefcase} title="For Recruiters" dk={dk} />
            </div>
            <div className={`rounded-xl p-6 ${dk ? "bg-white/[0.02] border border-white/5" : "bg-gray-50 border border-gray-100"}`}>
              <p className={`text-sm mb-2 ${dk ? "text-white" : "text-gray-900"}`}>Why Inturn?</p>
              <p className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`} style={{ lineHeight: 1.7 }}>
                Inturn replaces spreadsheets and email chaos with a structured, data-driven hiring pipeline that saves placement cells and recruiters hundreds of hours each season.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing mega */}
      {pricing.open && (
        <div className={megaCls} onMouseEnter={pricing.enter} onMouseLeave={pricing.leave}>
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 gap-8">
            <div>
              <ColHeading dk={dk}>Plans</ColHeading>
              <MegaItem icon={CreditCard} title="Recruiter Plans" dk={dk} />
              <MegaItem icon={Building2} title="Institution Demo" dk={dk} onClick={goInstitutions} />
            </div>
            <div className={`rounded-xl p-6 ${dk ? "bg-white/[0.02] border border-white/5" : "bg-gray-50 border border-gray-100"}`}>
              <p className={`text-sm mb-2 ${dk ? "text-white" : "text-gray-900"}`}>Custom plans</p>
              <p className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`} style={{ lineHeight: 1.7 }}>
                Need something tailored? We work with large institutions and enterprise recruiters to build custom packages. Get in touch with our team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resources mega */}
      {resources.open && (
        <div className={megaCls} onMouseEnter={resources.enter} onMouseLeave={resources.leave}>
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-8">
            <div>
              <ColHeading dk={dk}>Learn</ColHeading>
              <MegaItem icon={FileText} title="Docs" dk={dk} />
            </div>
            <div>
              <ColHeading dk={dk}>Company</ColHeading>
              <MegaItem icon={Info} title="About" dk={dk} />
            </div>
            <div>
              <ColHeading dk={dk}>Support</ColHeading>
              <MegaItem icon={HelpCircle} title="FAQ" dk={dk} />
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className={`md:hidden border-t px-6 py-4 space-y-1 ${dk ? "border-white/5 bg-[#0a0a0f]" : "border-gray-200 bg-white"}`}>
          {(
            [
              {
                key: "solutions",
                label: "Solutions",
                items: [
                  { icon: GraduationCap, title: "For Universities", desc: "Manage placements", onClick: goInstitutions },
                  { icon: Briefcase, title: "For Recruiters", desc: "Access verified talent" },
                ],
              },
              {
                key: "pricing",
                label: "Pricing",
                items: [
                  { icon: CreditCard, title: "Recruiter Plans", desc: "Flexible plans" },
                  { icon: Building2, title: "Institution Demo", desc: "Free walkthrough", onClick: goInstitutions },
                ],
              },
              {
                key: "resources",
                label: "Resources",
                items: [
                  { icon: FileText, title: "Docs", desc: "Guides & docs" },
                  { icon: Info, title: "About", desc: "Our mission" },
                  { icon: HelpCircle, title: "FAQ", desc: "Common questions" },
                ],
              },
            ] as const
          ).map((section) => (
            <div key={section.key}>
              <button
                onClick={() => setMobileAcc(mobileAcc === section.key ? null : section.key)}
                className={`w-full flex items-center justify-between py-2.5 text-sm ${dk ? "text-gray-300" : "text-gray-900"}`}
              >
                {section.label}
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileAcc === section.key ? "rotate-180" : ""}`} />
              </button>
              {mobileAcc === section.key && (
                <div className="pl-2 pb-2 space-y-1">
                  {section.items.map((item) => (
                    <MegaItem key={item.title} icon={item.icon} title={item.title} dk={dk} onClick={'onClick' in item ? (item as any).onClick : undefined} />
                  ))}
                </div>
              )}
            </div>
          ))}
          <a href="#how-it-works" className={`block py-2.5 text-sm ${dk ? "text-gray-300" : "text-gray-900"}`}>
            How it Works
          </a>
          <div className="pt-3 border-t mt-2 space-y-3" style={{ borderColor: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)" }}>
            <button className={`w-full text-sm py-2.5 ${dk ? "text-gray-300" : "text-gray-900"}`} onClick={() => { setMobileOpen(false); navigate("/login"); }}>Log in</button>
            <button className="w-full text-sm bg-blue-600 text-white px-5 py-2.5 rounded-full" onClick={() => { setMobileOpen(false); navigate("/get-started"); }}>Get Started</button>
          </div>
        </div>
      )}
    </nav>
  );
}