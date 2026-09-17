"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Client {
  id: number;
  name: string;
  childrenCount: number;
  bookingsCount: number;
  createdAt: string;
}

interface Booking {
  id: number;
  status: string;
  programName: string;
  slotDate: string;
}

export default function AnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Client[]>("/api/admin/clients").catch(() => []),
      apiFetch<Booking[]>("/api/bookings").catch(() => []),
    ]).then(([c, b]) => {
      setClients(c);
      setBookings(b);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">📊</div>
      </div>
    );
  }

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const totalChildren = clients.reduce((sum, c) => sum + Number(c.childrenCount), 0);
  
  // Program popularity
  const programCounts: Record<string, number> = {};
  confirmed.forEach((b) => {
    programCounts[b.programName] = (programCounts[b.programName] || 0) + 1;
  });
  const sortedPrograms = Object.entries(programCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedPrograms.length > 0 ? sortedPrograms[0][1] : 1;

  // New clients this month
  const thisMonth = new Date().toISOString().slice(0, 7);
  const newThisMonth = clients.filter((c) => c.createdAt.slice(0, 7) === thisMonth).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold">Аналитика</h2>
        <p className="text-gray-500">Обзор ключевых показателей</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-3xl font-extrabold text-brand">{clients.length}</p>
          <p className="text-sm text-gray-500">Всего клиентов</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🆕</div>
          <p className="text-3xl font-extrabold text-accent-yellow">{newThisMonth}</p>
          <p className="text-sm text-gray-500">Новых в этом месяце</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-3xl font-extrabold text-green-600">{confirmed.length}</p>
          <p className="text-sm text-gray-500">Подтверждённых записей</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">❌</div>
          <p className="text-3xl font-extrabold text-accent-red">{cancelled.length}</p>
          <p className="text-sm text-gray-500">Отменённых</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-bold text-lg mb-2">👶 Детей зарегистрировано</h3>
          <p className="text-4xl font-extrabold text-brand">{totalChildren}</p>
          <p className="text-sm text-gray-500 mt-1">В среднем {clients.length > 0 ? (totalChildren / clients.length).toFixed(1) : 0} на семью</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-lg mb-2">📊 Конверсия</h3>
          <p className="text-4xl font-extrabold text-brand">
            {bookings.length > 0 ? Math.round((confirmed.length / bookings.length) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Подтверждённых из всех записей</p>
        </div>
      </div>

      {/* Program Popularity */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">🏆 Популярность программ</h3>
        {sortedPrograms.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Данных пока нет</p>
        ) : (
          <div className="space-y-3">
            {sortedPrograms.map(([name, count]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{name}</span>
                  <span className="text-sm text-gray-500">{count} записей</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-brand rounded-full h-3 transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
