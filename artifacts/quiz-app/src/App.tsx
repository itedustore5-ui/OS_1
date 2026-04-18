import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api, setToken, ApiUser } from "@/lib/api";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import QuizPage from "@/pages/QuizPage";
import ScoreboardPage from "@/pages/ScoreboardPage";
import AdminPage from "@/pages/AdminPage";

const queryClient = new QueryClient();

type AppPage = "login" | "dashboard" | "quiz" | "scoreboard" | "admin";

function AppContent() {
  const [page, setPage] = useState<AppPage>("login");
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("quiz_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then((u) => {
        setUser(u);
        setPage("dashboard");
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async () => {
    try {
      const u = await api.me();
      setUser(u);
      setPage("dashboard");
    } catch {
      setToken(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPage("login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
        <svg className="animate-spin w-10 h-10 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (page === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }
  if (page === "dashboard") {
    return (
      <DashboardPage
        user={user}
        onStartQuiz={() => setPage("quiz")}
        onScoreboard={() => setPage("scoreboard")}
        onAdmin={() => setPage("admin")}
        onLogout={handleLogout}
      />
    );
  }
  if (page === "quiz") {
    return (
      <QuizPage
        user={user}
        onFinish={() => setPage("scoreboard")}
        onLogout={handleLogout}
      />
    );
  }
  if (page === "scoreboard") {
    return (
      <ScoreboardPage
        onBack={() => setPage("dashboard")}
        onStartQuiz={() => setPage("quiz")}
      />
    );
  }
  if (page === "admin") {
    return (
      <AdminPage
        onBack={() => setPage("dashboard")}
        onLogout={handleLogout}
      />
    );
  }
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
