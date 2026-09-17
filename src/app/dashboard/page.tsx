"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Booking {
  id: number;
  status: string;
  childName: string;
  slotDate: string;
  slotStartTime: string;
  programName: string;
}

interface Subscription {
  id: number;
  type: string;
  totalClasses: number;
  usedClasses: number;
  isActive: boolean;
}

interface Child {
  id: number;
  name: string;
  birthDate: string;
}

export default function ParentDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Booking[]>("/api/bookings").catch(() => []),
      apiFetch<Subscription[]>("/api/subscriptions").catch(() => []),
      apiFetch<Child[]>("/api/children").catch(() => []),
    ]).then(([b, s, c]) => {
      setBookings(b);
      setSubscriptions(s);
      setChildren(c);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🚀</div>
          <p className="text-gray-500">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter((b) => b.status === "confirmed");
  const activeSubs = subscriptions.filter((s) => s.isActive);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-3xl mb-2">👶</div>
          <p className="text-2xl font-extrabold text-brand">{children.length}</p>
          <p className="text-sm text-gray-500">Детей</p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-2xl font-extrabold text-brand">{activeBookings.length}</p>
          <p className="text-sm text-gray-500">Активных записей</p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">🎫</div>
          <p className="text-2xl font-extrabold text-brand">{activeSubs.length}</p>
          <p className="text-sm text-gray-500">Абонементов</p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-2xl font-extrabold text-accent-yellow">
            {activeSubs.reduce((sum, s) => sum + (s.totalClasses - s.usedClasses), 0)}
          </p>
          <p className="text-sm text-gray-500">Занятий осталось</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/schedule" className="card hover:border-brand border-2 border-transparent flex items-center gap-4">
          <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-2xl">📅</div>
          <div>
            <h3 className="font-bold">Расписание занятий</h3>
            <p className="text-sm text-gray-500">Посмотреть и записаться</p>
          </div>
        </Link>
        <Link href="/dashboard/children" className="card hover:border-brand border-2 border-transparent flex items-center gap-4">
          <div className="w-14 h-14 bg-accent-yellow/20 rounded-2xl flex items-center justify-center text-2xl">👶</div>
          <div>
            <h3 className="font-bold">Мои дети</h3>
            <p className="text-sm text-gray-500">Управление профилями</p>
          </div>
        </Link>
        <Link href="/dashboard/subscriptions" className="card hover:border-brand border-2 border-transparent flex items-center gap-4">
          <div className="w-14 h-14 bg-accent-red/10 rounded-2xl flex items-center justify-center text-2xl">🎫</div>
          <div>
            <h3 className="font-bold">Купить абонемент</h3>
            <p className="text-sm text-gray-500">Выгодные пакеты</p>
          </div>
        </Link>
      </div>

      {/* Upcoming Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Ближайшие занятия</h3>
          <Link href="/dashboard/bookings" className="text-brand text-sm font-semibold hover:underline">Все записи →</Link>
        </div>
        {activeBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-500">У вас пока нет записей на занятия</p>
            <Link href="/dashboard/schedule" className="btn-primary inline-block mt-4 text-sm !py-2">
              Посмотреть расписание
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-4 bg-bg-warm rounded-xl">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-xl">📚</div>
                <div className="flex-1">
                  <p className="font-semibold">{b.programName}</p>
                  <p className="text-sm text-gray-500">{b.childName} · {b.slotDate} · {b.slotStartTime}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  Подтверждено
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
