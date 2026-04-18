import { useState, useEffect } from "react";
import { api, ApiResult } from "@/lib/api";

interface ScoreboardPageProps {
  onBack: () => void;
  onStartQuiz: () => void;
}

export default function ScoreboardPage({ onBack, onStartQuiz }: ScoreboardPageProps) {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getScoreboard()
      .then(data => setResults(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter(r =>
    r.displayName.toLowerCase().includes(filter.toLowerCase()) ||
    r.username.toLowerCase().includes(filter.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('sr-RS', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  const getRankColor = (idx: number) => {
    if (idx === 0) return "text-yellow-500";
    if (idx === 1) return "text-gray-400";
    if (idx === 2) return "text-amber-600";
    return "text-gray-500";
  };

  const getRankIcon = (idx: number) => {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    if (idx === 2) return "🥉";
    return `${idx + 1}.`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Scoreboard</h1>
              <p className="text-xs text-gray-500">{results.length} резултата</p>
            </div>
          </div>
          <button onClick={onStartQuiz} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition">
            Нови квиз
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-bold text-blue-600">{results.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Укупно покушаја</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-bold text-green-600">{Math.max(...results.map(r => r.percentage))}%</p>
                  <p className="text-xs text-gray-500 mt-1">Највиши резултат</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Просек</p>
                </div>
              </div>
            )}

            <div className="relative">
              <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Претражите по имену..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500 font-medium">Нема резултата</p>
                <p className="text-gray-400 text-sm mt-1">Будите prvi koji ради квиз!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ime</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Датум</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Резултат</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Тачних</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Трајање</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((result, idx) => (
                        <tr key={result.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <span className={`font-bold text-base ${getRankColor(idx)}`}>{getRankIcon(idx)}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{result.displayName}</p>
                              <p className="text-gray-400 text-xs">@{result.username}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">{formatDate(result.completedAt)}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`text-lg font-bold ${result.percentage >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                              {result.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-gray-600 hidden md:table-cell">
                            {result.score}/{result.totalQuestions}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-gray-500 hidden md:table-cell">
                            {formatTime(result.timeSpent)}
                          </td>
                          <td className="px-4 py-4 text-center hidden sm:table-cell">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.percentage >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {result.percentage >= 60 ? 'Положио/ла' : 'Пао/ла'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
