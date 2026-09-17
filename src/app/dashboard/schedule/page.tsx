"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Slot {
  id: number;
  programId: number;
  date: string;
  startTime: string;
  endTime: string;
  maxSpots: number;
  bookedSpots: number;
  programName: string;
  programDescription: string | null;
  programPrice: number;
}

interface Child {
  id: number;
  name: string;
}

export default function SchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [selectedChild, setSelectedChild] = useState<number>(0);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<Slot[]>("/api/schedule").catch(() => []),
      apiFetch<Child[]>("/api/children").catch(() => []),
    ]).then(([s, c]) => {
      setSlots(s);
      setChildren(c);
      if (c.length > 0) setSelectedChild(c[0].id);
      setLoading(false);
    });
  }, []);

  const handleBook = async () => {
    if (!bookingSlot || !selectedChild) return;
    setBooking(true);
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ childId: selectedChild, slotId: bookingSlot.id }),
      });
      setSuccess(true);
      // Update spots locally
      setSlots(slots.map((s) => s.id === bookingSlot.id ? { ...s, bookedSpots: s.bookedSpots + 1 } : s));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка записи");
    }
    setBooking(false);
  };

  const getDayName = (dateStr: string) => {
    const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return days[new Date(dateStr).getDay()];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  };

  // Group by date
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">📅</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Расписание занятий</h2>
        <p className="text-gray-500">Выберите занятие и запишитесь</p>
      </div>

      {/* Booking Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setBookingSlot(null); setSuccess(false); }}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            {success ? (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-brand mb-2">Вы записаны!</h3>
                <p className="text-gray-500">Ждём вас на занятии</p>
                <button onClick={() => { setBookingSlot(null); setSuccess(false); }} className="btn-primary mt-6">Отлично!</button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Запись на занятие</h3>
                <div className="bg-bg-warm rounded-xl p-4 mb-4">
                  <p className="font-bold text-lg">{bookingSlot.programName}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(bookingSlot.date)} ({getDayName(bookingSlot.date)}) · {bookingSlot.startTime}–{bookingSlot.endTime}
                  </p>
                  <p className="text-sm text-brand font-semibold mt-1">{bookingSlot.programPrice} ₽</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Мест: {bookingSlot.maxSpots - bookingSlot.bookedSpots} из {bookingSlot.maxSpots}
                  </p>
                </div>

                {children.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">Сначала добавьте ребёнка в профиль</p>
                    <a href="/dashboard/children" className="btn-primary text-sm">Добавить ребёнка</a>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-semibold mb-2">Выберите ребёнка</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none mb-4"
                      value={selectedChild}
                      onChange={(e) => setSelectedChild(Number(e.target.value))}
                    >
                      {children.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-3">
                      <button onClick={() => setBookingSlot(null)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-500">
                        Отмена
                      </button>
                      <button onClick={handleBook} disabled={booking} className="flex-1 btn-primary disabled:opacity-50">
                        {booking ? "Записываем..." : "Записаться"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Schedule */}
      {Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">Расписание пока пусто</h3>
          <p className="text-gray-500">Новые занятия скоро появятся!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateSlots]) => (
            <div key={date}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center text-xs font-bold">
                  {getDayName(date)}
                </span>
                {formatDate(date)}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateSlots.map((slot) => {
                  const spotsLeft = slot.maxSpots - slot.bookedSpots;
                  const isFull = spotsLeft <= 0;
                  return (
                    <div key={slot.id} className={`card ${isFull ? "opacity-60" : "hover:border-brand"} border-2 border-transparent`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold">{slot.programName}</h4>
                          <p className="text-sm text-gray-500">{slot.startTime}–{slot.endTime}</p>
                        </div>
                        <span className="text-brand font-bold">{slot.programPrice} ₽</span>
                      </div>
                      {slot.programDescription && (
                        <p className="text-sm text-gray-500 mb-3">{slot.programDescription}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isFull ? "bg-red-100 text-red-600" : spotsLeft <= 2 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          {isFull ? "Мест нет" : `Мест: ${spotsLeft}`}
                        </span>
                        {!isFull && (
                          <button onClick={() => setBookingSlot(slot)} className="text-sm font-bold text-brand hover:underline">
                            Записаться →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
