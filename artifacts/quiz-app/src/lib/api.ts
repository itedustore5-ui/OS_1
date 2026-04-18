const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("quiz_token");
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem("quiz_token", token);
  } else {
    localStorage.removeItem("quiz_token");
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Greška servera" }));
    throw new Error(body.error || "Greška servera");
  }
  return res.json();
}

export interface ApiUser {
  id: string;
  username: string;
  role: string;
  displayName: string;
  neverExpires: boolean;
  active?: boolean;
  createdAt?: string;
}

export interface ApiResult {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  timeSpent: number;
  answers: { questionId: number; selectedAnswer: number; correct: boolean }[];
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<ApiUser>("/auth/me"),

  getUsers: () => request<ApiUser[]>("/users"),

  createUser: (data: {
    username: string;
    password: string;
    displayName: string;
    role: string;
    neverExpires: boolean;
    active: boolean;
  }) => request<ApiUser>("/users", { method: "POST", body: JSON.stringify(data) }),

  updateUser: (id: string, data: Partial<{
    password: string;
    role: string;
    neverExpires: boolean;
    displayName: string;
    active: boolean;
  }>) => request<{ success: boolean }>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),

  getResults: () => request<ApiResult[]>("/results"),

  getScoreboard: () => request<ApiResult[]>("/results/scoreboard"),

  saveResult: (data: {
    score: number;
    totalQuestions: number;
    percentage: number;
    timeSpent: number;
    answers: { questionId: number; selectedAnswer: number; correct: boolean }[];
    displayName: string;
  }) => request<ApiResult>("/results", { method: "POST", body: JSON.stringify(data) }),

  deleteResult: (id: string) =>
    request<{ success: boolean }>(`/results/${id}`, { method: "DELETE" }),

  clearResults: () =>
    request<{ success: boolean }>("/results", { method: "DELETE" }),
};
