import { useState, useEffect } from "react";
import { api, ApiUser, ApiResult } from "@/lib/api";

interface AdminPageProps {
  onBack: () => void;
  onLogout: () => void;
}

type Tab = "users" | "results";

export default function AdminPage({ onBack, onLogout }: AdminPageProps) {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);

  const [form, setForm] = useState({
    username: "", password: "", displayName: "", role: "student" as "student" | "admin",
    neverExpires: false, active: true
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const refreshUsers = () => api.getUsers().then(setUsers).catch(() => {});
  const refreshResults = () => api.getResults().then(data =>
    setResults([...data].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()))
  ).catch(() => {});

  useEffect(() => {
    Promise.all([refreshUsers(), refreshResults()]).finally(() => setLoading(false));
  }, []);

  const handleAddUser = async () => {
    setFormError("");
    if (!form.username.trim() || !form.password.trim() || !form.displayName.trim()) {
      setFormError("Сва поља су обавезна.");
      return;
    }
    setFormLoading(true);
    try {
      await api.createUser({
        username: form.username.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        role: form.role,
        neverExpires: form.neverExpires,
        active: form.active,
      });
      await refreshUsers();
      setShowAddUser(false);
      setForm({ username: "", password: "", displayName: "", role: "student", neverExpires: false, active: true });
    } catch (err: any) {
      setFormError(err.message || "Greška pri dodavanju korisnika.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    setFormLoading(true);
    try {
      const updates: Record<string, unknown> = {
        role: form.role,
        neverExpires: form.neverExpires,
        displayName: form.displayName.trim(),
        active: form.active,
      };
      if (form.password) updates.password = form.password;
      await api.updateUser(editUser.id, updates);
      await refreshUsers();
      setEditUser(null);
    } catch (err: any) {
      setFormError(err.message || "Greška pri izmeni korisnika.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Да ли сте сигурни да желите да обришете овог корисника?")) return;
    await api.deleteUser(id);
    await refreshUsers();
  };

  const handleDeleteResult = async (id: string) => {
    await api.deleteResult(id);
    await refreshResults();
  };

  const handleClearResults = async () => {
    if (!confirm("Да ли сте сигурни да желите да обришете све резултате?")) return;
    await api.clearResults();
    await refreshResults();
  };

  const openEdit = (user: ApiUser) => {
    setEditUser(user);
    setForm({
      username: user.username,
      password: "",
      displayName: user.displayName,
      role: user.role as "student" | "admin",
      neverExpires: user.neverExpires,
      active: user.active ?? true,
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('sr-RS', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  const UserForm = ({ onSubmit, title }: { onSubmit: () => void; title: string }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-900 mb-5">{title}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пуно Ime</label>
            <input
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="нпр. Јован Јовановић"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Корисничко ime</label>
            <input
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="jovan123"
              disabled={!!editUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Лозинка {editUser && <span className="text-gray-400">(ostavite prazno za bez promene)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={editUser ? "Nova lozinka (opciono)" : "Унесите лозинку"}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Улога</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value as "student" | "admin" })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="student">Студент</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div className="space-y-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.neverExpires}
                  onChange={e => setForm({ ...form, neverExpires: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">Не истиче</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">Активан</span>
              </label>
            </div>
          </div>
          {formError && <p className="text-red-500 text-xs">{formError}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setShowAddUser(false); setEditUser(null); setFormError(""); }}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Откажи
          </button>
          <button
            onClick={onSubmit}
            disabled={formLoading}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition"
          >
            {formLoading ? "Сачувавање..." : "Сачувај"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {showAddUser && <UserForm onSubmit={handleAddUser} title="Додај корисника" />}
      {editUser && <UserForm onSubmit={handleUpdateUser} title="Измени корисника" />}

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Администраторски панел</h1>
              <p className="text-xs text-gray-500">IT Квиз управљање</p>
            </div>
          </div>
          <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition">
            Одјава
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {[
            { key: "users", label: "Корисници", count: users.length },
            { key: "results", label: "Резултати", count: results.length }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            {tab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Листа корисника</h2>
                  <button
                    onClick={() => { setShowAddUser(true); setFormError(""); setForm({ username: "", password: "", displayName: "", role: "student", neverExpires: false, active: true }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Додај корисника
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Корисник</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Корисничко ime</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Улога</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Статус</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Не истиче</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Акције</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                {user.displayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{user.displayName}</p>
                                <p className="text-gray-400 text-xs md:hidden">@{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">@{user.username}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {user.role === 'admin' ? 'Admin' : 'Student'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center hidden sm:table-cell">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {user.active ? 'Активан' : 'Неактиван'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center hidden sm:table-cell">
                            {user.neverExpires ? (
                              <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEdit(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "results" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Сви резултати</h2>
                  {results.length > 0 && (
                    <button onClick={handleClearResults} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Обриши све
                    </button>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-500">Нема резултата квиза.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Корисник</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Датум</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">%</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Тачних</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Статус</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Акције</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map(result => (
                          <tr key={result.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{result.displayName}</p>
                                <p className="text-gray-400 text-xs">@{result.username}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">{formatDate(result.completedAt)}</td>
                            <td className="px-4 py-4 text-center">
                              <span className={`font-bold ${result.percentage >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                                {result.percentage}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-600 hidden md:table-cell">
                              {result.score}/{result.totalQuestions}
                            </td>
                            <td className="px-4 py-4 text-center hidden sm:table-cell">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${result.percentage >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {result.percentage >= 60 ? 'Положио/ла' : 'Пао/ла'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button onClick={() => handleDeleteResult(result.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
