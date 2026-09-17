"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Ошибка соединения с сервером");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white text-xl">🚀</div>
          <div>
            <h1 className="font-extrabold text-brand text-xl">Академия Ума</h1>
            <p className="text-xs text-gray-500">Клуб первых открытий</p>
          </div>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => { setIsRegister(false); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${!isRegister ? "bg-brand text-white" : "bg-gray-100 text-gray-500"}`}
            >
              Вход
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${isRegister ? "bg-brand text-white" : "bg-gray-100 text-gray-500"}`}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-xl px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Имя</label>
                  <input
                    type="text" required placeholder="Ваше имя"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Телефон</label>
                  <input
                    type="tel" placeholder="+7 (___) ___-__-__"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email" required placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Пароль</label>
              <input
                type="password" required placeholder="••••••••" minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-lg disabled:opacity-50">
              {loading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl text-xs text-gray-600">
            <p className="font-bold mb-1">Демо-доступ:</p>
            <p>👤 Родитель: anna@example.com / parent123</p>
            <p>🔧 Админ: admin@akademia-uma.ru / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
