// Central API service — all calls to the backend go through here
// Base URL: update this to your backend's address
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem("token");
export const setToken = (t: string) => localStorage.setItem("token", t);
export const removeToken = () => localStorage.removeItem("token");
export const getStoredUser = () => {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};
export const setStoredUser = (u: object) =>
  localStorage.setItem("user", JSON.stringify(u));
export const removeStoredUser = () => localStorage.removeItem("user");

// ─── Fetch wrapper ────────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  name: string;
  role: "STUDENT" | "UNIVERSITY" | "RECRUITER";
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "UNIVERSITY" | "RECRUITER";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface StudentProfilePayload {
  universityId: number;
  academicUnitId: number;
  cgpa: number;
  backlogCount: number;
}

export interface StudentProfile {
  id: number;
  userId: number;
  universityId: number;
  academicUnitId: number;
  registrationStatus: string;
  cgpa: number;
  backlogCount: number;
  placementStatus: string;
  user: { name: string; email: string };
  university: { name: string };
  academicUnit: { name: string; type: string };
  skills: Array<{
    id: number;
    score: number;
    skill: { id: number; name: string; type: string };
  }>;
  externalProfiles: Array<{
    id: number;
    platform: string;
    url: string;
  }>;
}

export interface Job {
  id: number;
  title: string;
  minCgpa: number;
  maxBacklogs: number;
  deadline: string;
}

export interface Application {
  id: number;
  jobId: number;
  studentId: number;
  matchScore: number | null;
  status: string;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<{ message: string; userId: number }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ─── Student endpoints ────────────────────────────────────────────────────────

export const studentApi = {
  createProfile: (payload: StudentProfilePayload) =>
    request<{ message: string; student: StudentProfile }>("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getProfile: (userId: number) =>
    request<StudentProfile>(`/students/${userId}`),
};

// ─── Job endpoints ────────────────────────────────────────────────────────────

export const jobApi = {
  getJobs: () => request<Job[]>("/jobs"),

  applyForJob: (jobId: number) =>
    request<{ message: string; application: Application }>(
      `/jobs/${jobId}/apply`,
      { method: "POST" }
    ),
};

// ─── Health check ─────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => request<{ status: string; message: string }>("/health"),
};