"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Booking {
  id: number;
  status: string;
  childName: string;
  slotDate: string;
  slotStartTime: string;
  programName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string | null;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    apiFetch<Booking[]>("/api/bookings")
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const handleCancel = async (id: number) => {
    if (!confirm("Отменить запись?")) return;
    try {
      await apiFetch(`/api/bookings/${id}`, { method: "DELETE" });
      setBookings(bookings.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
    } catch { /* empty */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">📋</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Все записи</h2>
          <p className="text-gray-500">Управление записями клиентов</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "Все" },
            { key: "confirmed", label: "Подтверждённые" },
            { key: "cancelled", label: "Отменённые" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === f.key ? "bg-brand text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">Записей нет</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="card flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-xl shrink-0">📚</div>
              <div className="flex-1 min-w-[200px]">
                <h4 className="font-bold">{b.programName}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(b.slotDate).toLocaleDateString("ru-RU")} · {b.slotStartTime}
                </p>
              </div>
              <div className="min-w-[150px]">
                <p className="text-sm font-semibold">{b.parentName}</p>
                <p className="text-xs text-gray-400">{b.childName}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "cancelled" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                {b.status === "confirmed" ? "Подтверждено" : b.status === "cancelled" ? "Отменено" : "Ожидание"}
              </span>
              {b.status === "confirmed" && (
                <button onClick={() => handleCancel(b.id)} className="text-sm text-accent-red hover:underline font-semibold">
                  Отменить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
