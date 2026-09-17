"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Client {
  id: number;
  name: string;
  email: string;
  childrenCount: number;
  bookingsCount: number;
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<unknown[]>([]);
  const [testDrives, setTestDrives] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Client[]>("/api/admin/clients").catch(() => []),
      apiFetch<unknown[]>("/api/bookings").catch(() => []),
      apiFetch<unknown[]>("/api/test-drive").catch(() => []),
    ]).then(([c, b, t]) => {
      setClients(c);
      setBookings(b);
      setTestDrives(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">🔧</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-2xl font-extrabold text-brand">{clients.length}</p>
          <p className="text-sm text-gray-500">Клиентов</p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-2xl font-extrabold text-brand">{bookings.length}</p>
          <p className="text-sm text-gray-500">Записей</p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-2xl font-extrabold text-accent-yellow">{testDrives.length}</p>
          <p className="text-sm text-gray-500">Тест-драйвов</p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">👶</div>
          <p className="text-2xl font-extrabold text-accent-red">
            {clients.reduce((sum, c) => sum + Number(c.childrenCount), 0)}
          </p>
          <p className="text-sm text-gray-500">Детей</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/admin/clients" className="card hover:border-brand border-2 border-transparent flex items-center gap-4">
          <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-2xl">👥</div>
          <div>
            <h3 className="font-bold">CRM — Клиенты</h3>
            <p className="text-sm text-gray-500">Список всех родителей</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/schedule" className="card hover:border-brand border-2 border-transparent flex items-center gap-4">
          <div className="w-14 h-14 bg-accent-yellow/20 rounded-2xl flex items-center justify-center text-2xl">📅</div>
          <div>
            <h3 className="font-bold">Расписание</h3>
            <p className="text-sm text-gray-500">Управление занятиями</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/programs" className="card hover:border-brand border-2 border-transparent flex items-center gap-4">
          <div className="w-14 h-14 bg-accent-red/10 rounded-2xl flex items-center justify-center text-2xl">📚</div>
          <div>
            <h3 className="font-bold">Программы</h3>
            <p className="text-sm text-gray-500">Управление программами</p>
          </div>
        </Link>
      </div>

      {/* Recent Clients */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Последние клиенты</h3>
          <Link href="/dashboard/admin/clients" className="text-brand text-sm font-semibold hover:underline">Все →</Link>
        </div>
        {clients.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Клиентов пока нет</p>
        ) : (
          <div className="space-y-3">
            {clients.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-3 bg-bg-warm rounded-xl">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-lg">👤</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </div>
                <span className="text-xs text-gray-400">Детей: {Number(c.childrenCount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
