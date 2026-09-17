"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Program {
  id: number;
  name: string;
  description: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  price: number;
  duration: number;
  maxSpots: number;
  isActive: boolean;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", shortDescription: "", imageUrl: "", price: "2500", duration: "120", maxSpots: "8",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await apiFetch<Program[]>("/api/programs");
      setPrograms(data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      price: parseInt(form.price),
      duration: parseInt(form.duration),
      maxSpots: parseInt(form.maxSpots),
    };
    try {
      if (editingProgram) {
        await apiFetch(`/api/programs/${editingProgram.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/api/programs", { method: "POST", body: JSON.stringify(body) });
      }
      setShowForm(false);
      setEditingProgram(null);
      resetForm();
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
    setSaving(false);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", shortDescription: "", imageUrl: "", price: "2500", duration: "120", maxSpots: "8" });
  };

  const startEdit = (p: Program) => {
    setEditingProgram(p);
    setForm({
      name: p.name,
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      imageUrl: p.imageUrl || "",
      price: String(p.price),
      duration: String(p.duration),
      maxSpots: String(p.maxSpots),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Деактивировать программу?")) return;
    try {
      await apiFetch(`/api/programs/${id}`, { method: "DELETE" });
      setPrograms(programs.filter((p) => p.id !== id));
    } catch { /* empty */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">📚</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Программы занятий</h2>
          <p className="text-gray-500">Управление программами и описаниями</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingProgram(null); resetForm(); }} className="btn-primary text-sm">
          + Новая программа
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6">{editingProgram ? "Редактировать программу" : "Новая программа"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Название</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Краткое описание</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Полное описание</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Эмодзи / URL картинки</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  placeholder="🎨 или https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Цена (₽)</label>
                  <input type="number" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Длительность</label>
                  <input type="number" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                    value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Макс. мест</label>
                  <input type="number" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                    value={form.maxSpots} onChange={(e) => setForm({ ...form, maxSpots: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-500">
                  Отмена
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50">
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold mb-2">Программ пока нет</h3>
          <p className="text-gray-500">Создайте первую программу</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((p) => (
            <div key={p.id} className="card">
              <div className="text-4xl mb-3">{p.imageUrl || "📚"}</div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.shortDescription}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <span>💰 {p.price} ₽</span>
                <span>🕐 {p.duration} мин</span>
                <span>👥 {p.maxSpots} мест</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="text-sm text-brand hover:underline font-semibold">
                  ✏️ Редактировать
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-sm text-accent-red hover:underline font-semibold">
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
