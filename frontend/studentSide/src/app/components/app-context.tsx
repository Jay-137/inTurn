import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getToken,
  getStoredUser,
  setToken,
  setStoredUser,
  removeToken,
  removeStoredUser,
  type AuthUser,
  type StudentProfile,
} from "../../lib/api";

export type UserRole = "student" | null;

export type PlatformKey =
  | "github"
  | "leetcode"
  | "codeforces"
  | "kaggle"
  | "figma"
  | "gitlab"
  | "codechef"
  | "hackerrank";

interface AppContextType {
  // Auth
  role: UserRole;
  setRole: (role: UserRole) => void;
  authUser: AuthUser | null;
  setAuthUser: (u: AuthUser | null) => void;
  token: string | null;
  setTokenAndUser: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;

  // Profile
  studentProfile: StudentProfile | null;
  setStudentProfile: (p: StudentProfile | null) => void;

  // UI / local state
  userName: string;
  setUserName: (name: string) => void;
  linkedPlatforms: Record<PlatformKey, boolean>;
  setLinkedPlatforms: (p: Record<PlatformKey, boolean>) => void;
  appliedJobs: string[];
  addAppliedJob: (id: string) => void;
  preferredRoles: string[];
  setPreferredRoles: (roles: string[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const defaultPlatforms: Record<PlatformKey, boolean> = {
  github: false,
  leetcode: false,
  codeforces: false,
  kaggle: false,
  figma: false,
  gitlab: false,
  codechef: false,
  hackerrank: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Restore auth state from localStorage on mount
  const [authUser, setAuthUserState] = useState<AuthUser | null>(
    getStoredUser
  );
  const [token, setTokenState] = useState<string | null>(getToken);
  const [role, setRole] = useState<UserRole>(
    getStoredUser()?.role === "STUDENT" ? "student" : null
  );

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );
  const [userName, setUserName] = useState(
    getStoredUser()?.name || "Student"
  );
  const [linkedPlatforms, setLinkedPlatforms] =
    useState<Record<PlatformKey, boolean>>(defaultPlatforms);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);

  // Keep userName in sync with authUser
  useEffect(() => {
    if (authUser?.name) setUserName(authUser.name);
  }, [authUser]);

  // Keep linkedPlatforms and appliedJobs in sync with studentProfile
  useEffect(() => {
    if (studentProfile) {
      // Sync linked platforms
      if (studentProfile.externalProfiles) {
        const updated = { ...defaultPlatforms };
        studentProfile.externalProfiles.forEach((p) => {
          const key = p.platform.toLowerCase() as PlatformKey;
          if (updated.hasOwnProperty(key) && p.isVerified !== false) {
            updated[key] = true;
          }
        });
        setLinkedPlatforms(updated);
      }
      
      // Sync applied jobs
      if (studentProfile.applications) {
        const ids = studentProfile.applications.map((app: any) => String(app.jobId));
        setAppliedJobs(ids);
      }
    }
  }, [studentProfile]);

  const setAuthUser = (u: AuthUser | null) => {
    setAuthUserState(u);
    if (u) {
      setStoredUser(u);
      setUserName(u.name);
    } else {
      removeStoredUser();
    }
  };

  const setTokenAndUser = (t: string, u: AuthUser) => {
    setToken(t);
    setTokenState(t);
    setAuthUser(u);
    if (u.role === "STUDENT") setRole("student");
  };

  const logout = () => {
    removeToken();
    removeStoredUser();
    setTokenState(null);
    setAuthUserState(null);
    setRole(null);
    setStudentProfile(null);
    setAppliedJobs([]);
    setPreferredRoles([]);
    setLinkedPlatforms(defaultPlatforms);
  };

  const addAppliedJob = (id: string) => {
    setAppliedJobs((prev) => [...prev, id]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        authUser,
        setAuthUser,
        token,
        setTokenAndUser,
        logout,
        isAuthenticated: !!token && !!authUser,
        studentProfile,
        setStudentProfile,
        userName,
        setUserName,
        linkedPlatforms,
        setLinkedPlatforms,
        appliedJobs,
        addAppliedJob,
        preferredRoles,
        setPreferredRoles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
