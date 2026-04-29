import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "./app-context";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Briefcase,
  LogOut,
  ChevronRight,
  Bell,
  Cpu,
  Shield,
  FileText,
  X,
  UserRound,
} from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { studentApi, type Notification } from "../../lib/api";

const studentNav = [
  { label: "Dashboard", path: "/student", icon: LayoutDashboard },
  { label: "Placement Drives", path: "/student/placements", icon: Briefcase },
  { label: "Skill Proof", path: "/student/link", icon: Shield },
  { label: "Skill Profile", path: "/student/profile", icon: BarChart3 },
  { label: "Manage Profile", path: "/student/manage-profile", icon: UserRound },
  { label: "Extra Data", path: "/student/data", icon: FileText },
];

export function Layout() {
  const { logout, userName, isAuthenticated, authUser, setStudentProfile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Sync Student Profile on mount
  useEffect(() => {
    if (isAuthenticated && authUser) {
      studentApi.getProfile(authUser.id)
        .then(setStudentProfile)
        .catch(err => {
          console.error("Failed to sync profile:", err);
          // If 404, it just means they haven't set up academic data yet, which is fine
        });
    }
  }, [isAuthenticated, authUser, setStudentProfile]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      studentApi.getNotifications().then(setNotifications).catch(console.error);
    }
  }, [isAuthenticated]);


  const handleDelete = async (id: number) => {
    try {
      await studentApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      await studentApi.clearAllNotifications();
      setNotifications([]);
      setShowNotif(false);
    } catch (e) {
      console.error(e);
    }
  };

  const markRead = async (id: number) => {
    try {
      await studentApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-background font-[Inter,system-ui,sans-serif]">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-[260px] bg-white border-r border-border flex flex-col fixed h-full z-20"
      >
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg text-gray-900">in-turn</span>
              <span className="text-[10px] text-muted-foreground block -mt-1">
                Campus Placement Portal
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {studentNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer relative ${
                  active
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">Student</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 ml-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-11 bg-white/80 backdrop-blur-md border-b border-border px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg text-gray-900">
              {studentNav.find((n) => n.path === location.pathname)?.label ||
                "in-turn"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </button>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-72 max-h-[400px] overflow-y-auto bg-white rounded-xl shadow-xl border border-border p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-2"><p className="text-sm text-gray-700 font-medium">Notifications</p>{notifications.length > 0 && <button onClick={handleClearAll} className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer">Clear all</button>}</div>
                  <div className="space-y-2">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.isRead && markRead(n.id)}
                        className={`relative group p-2 pr-6 rounded-lg text-xs cursor-pointer transition-colors ${
                          n.isRead 
                            ? "bg-gray-50 text-gray-500" 
                            : n.type === "success" 
                              ? "bg-emerald-50 text-emerald-700 font-medium" 
                              : n.type === "warning"
                                ? "bg-amber-50 text-amber-700 font-medium"
                                : "bg-indigo-50 text-indigo-700 font-medium"
                        }`}
                      >
                        {n.message}<button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                      </div>
                    )) : (
                      <div className="text-xs text-gray-400 text-center py-4">No notifications</div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
