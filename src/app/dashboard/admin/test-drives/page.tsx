"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface TestDrive {
  id: number;
  parentName: string;
  phone: string;
  email: string | null;
  childAge: string | null;
  message: string | null;
  isProcessed: boolean;
  createdAt: string;
}

export default function TestDrivesPage() {
  const [requests, setRequests] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<TestDrive[]>("/api/test-drive")
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">🎯</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Заявки на тест-драйв</h2>
          <p className="text-gray-500">Заявки от потенциальных клиентов</p>
        </div>
        <div className="text-sm bg-accent-yellow/20 text-amber-700 px-4 py-2 rounded-full font-semibold">
          Всего: {requests.length}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">Заявок пока нет</h3>
          <p className="text-gray-500">Ожидайте заявки с лендинга</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${r.isProcessed ? "bg-green-100" : "bg-accent-yellow/20"}`}>
                  {r.isProcessed ? "✅" : "🎯"}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{r.parentName}</h4>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                    <span>📱 {r.phone}</span>
                    {r.email && <span>📧 {r.email}</span>}
                    {r.childAge && <span>👶 {r.childAge}</span>}
                  </div>
                  {r.message && <p className="text-sm text-gray-600 mt-2 bg-bg-warm p-2 rounded-lg">{r.message}</p>}
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${r.isProcessed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.isProcessed ? "Обработано" : "Новая"}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
