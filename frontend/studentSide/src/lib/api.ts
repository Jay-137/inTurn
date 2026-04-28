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
  passingYear?: number;
}

export interface StudentProfile {
  id: number;
  userId: number;
  universityId: number;
  academicUnitId: number;
  registrationStatus: string;
  cgpa: number;
  backlogCount: number;
  passingYear?: number;
  branch?: string;
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
    stats?: Record<string, any>;
    isVerified?: boolean;
    verificationToken?: string;
  }>;
  experiences?: Array<{
    id: number;
    title: string;
    company: string;
    type: string;
    duration: string;
    description: string;
    skills: string[];
  }>;
  certifications?: Array<{
    id: number;
    name: string;
    platform: string;
    issueDate: string;
    credentialUrl: string;
    verified: boolean;
  }>;
  softSkills?: Array<{
    id: number;
    name: string;
  }>;
  extraData?: Array<{
    id: number;
    requestId: number;
    value: string;
    status: string;
    request: {
      fieldName: string;
      fieldType: string;
      isRequired: boolean;
    };
  }>;
  applications?: Application[];
  videoResumeUrl?: string;
}

export interface Job {
  id: number;
  title: string;
  minCgpa: number;
  maxBacklogs: number;
  deadline: string;
  location?: string;
  salary?: string;
  type?: string;
  tags?: string[];
  eligibilityStatus?: boolean;
  matchScore?: number | null;
  feedback?: string[];
}

export interface Application {
  id: number;
  jobId: number;
  studentId: number;
  matchScore: number | null;
  status: string;
  job?: Job;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
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

  updateProfile: (payload: { videoResumeUrl?: string, resumeUrl?: string }) =>
    request<{ message: string, student: any }>("/students", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateAcademicProfile: (payload: Partial<StudentProfilePayload>) =>
    request<{ message: string, student: StudentProfile }>("/students", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  addExperience: (payload: any) =>
    request<{ message: string, experience: any }>("/students/experience", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  removeExperience: (id: number) =>
    request<{ message: string }>(`/students/experience/${id}`, {
      method: "DELETE",
    }),

  addCertification: (payload: any) =>
    request<{ message: string, cert: any }>("/students/certification", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  removeCertification: (id: number) =>
    request<{ message: string }>(`/students/certification/${id}`, {
      method: "DELETE",
    }),

  updateSoftSkills: (skills: string[]) =>
    request<{ message: string }>("/students/softskills", {
      method: "POST",
      body: JSON.stringify({ skills }),
    }),

  getNotifications: () =>
    request<Notification[]>("/students/notifications"),

  markNotificationRead: (id: number) =>
    request<{ message: string }>(`/students/notifications/${id}/read`, {
      method: "PUT",
    }),

  deleteNotification: (id: number) =>
    request<{ message: string }>(`/students/notifications/${id}`, {
      method: "DELETE",
    }),

  clearAllNotifications: () =>
    request<{ message: string }>(`/students/notifications`, {
      method: "DELETE",
    }),

  getExtraDataRequests: () =>
    request<any[]>("/university/data-requests"),

  getAcademicUnitTree: () =>
    request<{ tree: any[] }>("/university/academic-units/tree"),

  getDashboardStats: () =>
    request<{ shortlistedCount: number; totalApplications: number; shortlistedApplications: Application[] }>("/students/dashboard-stats"),

  submitExtraData: (payload: { requestId: number, value: string, fileUrl?: string }) =>
    request<{ message: string }>("/university/students/extra-data", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  requestPlatformVerification: (payload: { platform: string; handle: string }) =>
    request<{ message: string; token: string; profileId: number }>("/students/platform/request", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  verifyPlatform: (payload: { profileId: number }) =>
    request<{ message: string; profile: any }>("/students/platform/verify", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  generateSkills: () =>
    request<{ message: string; skills: any }>("/students/skills/generate", {
      method: "POST"
    }),

  removePlatform: (platform: string) =>
    request<{ message: string }>(`/students/platform/${platform}`, {
      method: "DELETE"
    }),
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

export async function uploadVideoToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary upload is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("resource_type", "video");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed.");
  }

  return data.secure_url;
}
