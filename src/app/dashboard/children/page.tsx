"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Child {
  id: number;
  name: string;
  birthDate: string;
  notes: string | null;
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [form, setForm] = useState({ name: "", birthDate: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const loadChildren = async () => {
    try {
      const data = await apiFetch<Child[]>("/api/children");
      setChildren(data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { loadChildren(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingChild) {
        await apiFetch(`/api/children/${editingChild.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/api/children", { method: "POST", body: JSON.stringify(form) });
      }
      setShowForm(false);
      setEditingChild(null);
      setForm({ name: "", birthDate: "", notes: "" });
      loadChildren();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить ребёнка из списка?")) return;
    try {
      await apiFetch(`/api/children/${id}`, { method: "DELETE" });
      setChildren(children.filter((c) => c.id !== id));
    } catch { /* empty */ }
  };

  const startEdit = (child: Child) => {
    setEditingChild(child);
    setForm({ name: child.name, birthDate: child.birthDate, notes: child.notes || "" });
    setShowForm(true);
  };

  const getAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    if (months < 12) return `${months} мес.`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years} г. ${remMonths} мес.` : `${years} г.`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">👶</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Мои дети</h2>
          <p className="text-gray-500">Управляйте профилями ваших детей</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingChild(null); setForm({ name: "", birthDate: "", notes: "" }); }}
          className="btn-primary text-sm"
        >
          + Добавить ребёнка
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6">{editingChild ? "Редактировать" : "Добавить ребёнка"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Имя ребёнка</label>
                <input
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Дата рождения</label>
                <input
                  type="date" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                  value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Заметки</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                  rows={3} placeholder="Аллергии, особенности..."
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-500 hover:bg-gray-50">
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

      {/* Children List */}
      {children.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">👶</div>
          <h3 className="text-xl font-bold mb-2">Нет добавленных детей</h3>
          <p className="text-gray-500 mb-4">Добавьте информацию о вашем ребёнке для записи на занятия</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Добавить ребёнка
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child.id} className="card">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-accent-yellow/20 rounded-2xl flex items-center justify-center text-3xl">
                  👶
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{child.name}</h3>
                  <p className="text-sm text-gray-500">Возраст: {getAge(child.birthDate)}</p>
                  <p className="text-xs text-gray-400">Дата рождения: {new Date(child.birthDate).toLocaleDateString("ru-RU")}</p>
                  {child.notes && <p className="text-sm text-gray-600 mt-2 bg-bg-warm p-2 rounded-lg">{child.notes}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => startEdit(child)} className="text-sm text-brand hover:underline font-semibold">
                  ✏️ Редактировать
                </button>
                <button onClick={() => handleDelete(child.id)} className="text-sm text-accent-red hover:underline font-semibold">
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
