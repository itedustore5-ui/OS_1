export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "student";
  neverExpires: boolean;
  createdAt: string;
  active: boolean;
  displayName: string;
}

export interface QuizResult {
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

const USERS_KEY = "quiz_users";
const RESULTS_KEY = "quiz_results";
const CURRENT_USER_KEY = "quiz_current_user";

const defaultUsers: User[] = [
  {
    id: "admin-001",
    username: "admin",
    password: "Admin2024!",
    role: "admin",
    neverExpires: true,
    createdAt: new Date().toISOString(),
    active: true,
    displayName: "Administrator"
  },
  {
    id: "student-001",
    username: "student1",
    password: "kviz2024",
    role: "student",
    neverExpires: false,
    createdAt: new Date().toISOString(),
    active: true,
    displayName: "Student 1"
  }
];

export function getUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(stored);
  } catch {
    return defaultUsers;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(user: Omit<User, "id" | "createdAt">): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
  }
}

export function deleteUser(id: string): void {
  const users = getUsers().filter(u => u.id !== id);
  saveUsers(users);
}

export function authenticateUser(username: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password && u.active);
  return user || null;
}

export function getCurrentUser(): User | null {
  try {
    const stored = sessionStorage.getItem(CURRENT_USER_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getResults(): QuizResult[] {
  try {
    const stored = localStorage.getItem(RESULTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveResult(result: Omit<QuizResult, "id">): QuizResult {
  const results = getResults();
  const newResult: QuizResult = {
    ...result,
    id: `result-${Date.now()}`
  };
  results.push(newResult);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  return newResult;
}

export function deleteResult(id: string): void {
  const results = getResults().filter(r => r.id !== id);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function clearAllResults(): void {
  localStorage.removeItem(RESULTS_KEY);
}
