import { useState, useEffect } from "react";
import { api, ApiUser, ApiResult } from "@/lib/api";

interface DashboardPageProps {
  user: ApiUser | null;
  onStartQuiz: () => void;
  onScoreboard: () => void;
  onAdmin: () => void;
  onLogout: () => void;
}

export default function DashboardPage({ user, onStartQuiz, onScoreboard, onAdmin, onLogout }: DashboardPageProps) {
  const [myResults, setMyResults] = useState<ApiResult[]>([]);

  useEffect(() => {
    api.getScoreboard()
      .then(all => setMyResults(all.filter(r => r.userId === user?.id)))
      .catch(() => {});
  }, [user?.id]);

  const bestScore = myResults.length > 0 ? Math.max(...myResults.map(r => r.percentage)) : null;
  const lastResult = myResults.length > 0
    ? [...myResults].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">IT Квиз</span>
          </div>
          <button
            onClick={onLogout}
            className="text-blue-300 hover:text-white text-sm transition px-3 py-1.5 hover:bg-white/10 rounded-lg"
          >
            Одјава
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Добродошли, {user?.displayName}!
          </h1>
          <p className="text-blue-300">Системска администрација · Питања 52–101</p>
        </div>

        {myResults.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">{myResults.length}</p>
              <p className="text-blue-300 text-xs mt-1">Покушаја</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">{bestScore}%</p>
              <p className="text-blue-300 text-xs mt-1">Најбољи</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/10">
              <p className={`text-2xl font-bold ${lastResult && lastResult.percentage >= 60 ? 'text-green-400' : 'text-red-400'}`}>
                {lastResult ? `${lastResult.percentage}%` : '-'}
              </p>
              <p className="text-blue-300 text-xs mt-1">Последnji</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={onStartQuiz}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-2xl p-6 text-left transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xl mb-1">Започни квиз</p>
                <p className="text-blue-200 text-sm">50 питања · Системска администрација</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={onScoreboard}
            className="w-full bg-white/10 hover:bg-white/15 backdrop-blur text-white rounded-2xl p-5 text-left transition-all duration-200 border border-white/10 hover:border-white/20 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg mb-1">Scoreboard</p>
                <p className="text-blue-300 text-sm">Погледај све резултате</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </button>

          {user?.role === "admin" && (
            <button
              onClick={onAdmin}
              className="w-full bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur text-white rounded-2xl p-5 text-left transition-all duration-200 border border-purple-400/20 hover:border-purple-400/30 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-lg">Администрација</p>
                    <span className="bg-purple-400/30 text-purple-200 text-xs px-2 py-0.5 rounded-full">Admin</span>
                  </div>
                  <p className="text-blue-300 text-sm">Управљај корисницима и резултатима</p>
                </div>
                <div className="w-10 h-10 bg-purple-400/20 rounded-xl flex items-center justify-center group-hover:bg-purple-400/30 transition">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-blue-300 text-xs text-center">
            За приступ квизу потребна је лозинка · Контактирајте администратора за нови налог
          </p>
        </div>
      </div>
    </div>
  );
}
