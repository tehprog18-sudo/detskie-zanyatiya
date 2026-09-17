"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Booking {
  id: number;
  status: string;
  childName: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  programName: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const data = await apiFetch<Booking[]>("/api/bookings");
      setBookings(data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async (id: number) => {
    if (!confirm("Отменить запись?")) return;
    try {
      await apiFetch(`/api/bookings/${id}`, { method: "DELETE" });
      setBookings(bookings.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
    } catch { /* empty */ }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return { text: "Подтверждено", class: "bg-green-100 text-green-700" };
      case "cancelled": return { text: "Отменено", class: "bg-red-100 text-red-600" };
      case "pending": return { text: "Ожидание", class: "bg-amber-100 text-amber-700" };
      default: return { text: status, class: "bg-gray-100 text-gray-600" };
    }
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
      <div>
        <h2 className="text-2xl font-extrabold">Мои записи</h2>
        <p className="text-gray-500">История и актуальные записи на занятия</p>
      </div>

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">Записей нет</h3>
          <p className="text-gray-500">Запишитесь на занятие в расписании</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const status = statusLabel(b.status);
            return (
              <div key={b.id} className="card flex items-center gap-4">
                <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-2xl shrink-0">📚</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold">{b.programName}</h4>
                  <p className="text-sm text-gray-500">
                    {b.childName} · {new Date(b.slotDate).toLocaleDateString("ru-RU")} · {b.slotStartTime}
                    {b.slotEndTime ? `–${b.slotEndTime}` : ""}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${status.class}`}>
                  {status.text}
                </span>
                {b.status === "confirmed" && (
                  <button onClick={() => handleCancel(b.id)} className="text-sm text-accent-red hover:underline font-semibold whitespace-nowrap">
                    Отменить
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
