"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  childrenCount: number;
  bookingsCount: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<Client[]>("/api/admin/clients")
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">👥</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">CRM — Клиенты</h2>
          <p className="text-gray-500">Список всех зарегистрированных родителей</p>
        </div>
        <div className="text-sm bg-brand/10 text-brand px-4 py-2 rounded-full font-semibold">
          Всего: {clients.length}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text" placeholder="Поиск по имени, email или телефону..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold mb-2">{search ? "Ничего не найдено" : "Клиентов пока нет"}</h3>
          <p className="text-gray-500">
            {search ? "Попробуйте изменить запрос" : "Ожидайте регистрации новых клиентов"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500">Клиент</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500">Контакты</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-500">Дети</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-500">Записи</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500">Регистрация</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-bg-warm transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-lg">👤</div>
                        <p className="font-semibold">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{c.email}</p>
                      <p className="text-xs text-gray-400">{c.phone || "Нет телефона"}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {Number(c.childrenCount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {Number(c.bookingsCount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
