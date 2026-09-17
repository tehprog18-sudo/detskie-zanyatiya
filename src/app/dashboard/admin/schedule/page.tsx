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
}

interface Program {
  id: number;
  name: string;
}

export default function AdminSchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ programId: "", date: "", startTime: "10:00", endTime: "12:00", maxSpots: "8" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [s, p] = await Promise.all([
      apiFetch<Slot[]>("/api/schedule").catch(() => []),
      apiFetch<Program[]>("/api/programs").catch(() => []),
    ]);
    setSlots(s);
    setPrograms(p);
    if (p.length > 0 && !form.programId) setForm((f) => ({ ...f, programId: String(p[0].id) }));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/schedule", {
        method: "POST",
        body: JSON.stringify({
          programId: parseInt(form.programId),
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          maxSpots: parseInt(form.maxSpots),
        }),
      });
      setShowForm(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить занятие из расписания?")) return;
    try {
      await apiFetch(`/api/schedule/${id}`, { method: "DELETE" });
      setSlots(slots.filter((s) => s.id !== id));
    } catch { /* empty */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">📅</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Управление расписанием</h2>
          <p className="text-gray-500">Добавляйте и управляйте занятиями</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          + Добавить занятие
        </button>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6">Добавить занятие в расписание</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Программа</label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })}
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Дата</label>
                <input type="date" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Начало</label>
                  <input type="time" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                    value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Конец</label>
                  <input type="time" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                    value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Макс. мест</label>
                <input type="number" min="1" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  value={form.maxSpots} onChange={(e) => setForm({ ...form, maxSpots: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-500">
                  Отмена
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50">
                  {saving ? "Сохранение..." : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slots List */}
      {slots.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">Расписание пусто</h3>
          <p className="text-gray-500">Добавьте первое занятие</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)).map((slot) => (
            <div key={slot.id} className="card flex items-center gap-4">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-2xl shrink-0">📚</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold">{slot.programName}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(slot.date).toLocaleDateString("ru-RU")} · {slot.startTime}–{slot.endTime}
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-brand">{slot.bookedSpots}/{slot.maxSpots}</p>
                <p className="text-xs text-gray-400">мест занято</p>
              </div>
              <button onClick={() => handleDelete(slot.id)} className="text-accent-red hover:underline text-sm font-semibold">
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
