import { createContext, useContext, useState, type ReactNode } from "react";

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
  role: UserRole;
  setRole: (role: UserRole) => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState("Alex Johnson");
  const [linkedPlatforms, setLinkedPlatforms] = useState<Record<PlatformKey, boolean>>({
    github: true,
    leetcode: true,
    codeforces: false,
    kaggle: false,
    figma: false,
    gitlab: false,
    codechef: false,
    hackerrank: false,
  });
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);

  const addAppliedJob = (id: string) => {
    setAppliedJobs((prev) => [...prev, id]);
  };

  return (
    <AppContext.Provider
      value={{
        role, setRole, userName, setUserName,
        linkedPlatforms, setLinkedPlatforms,
        appliedJobs, addAppliedJob,
        preferredRoles, setPreferredRoles,
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
