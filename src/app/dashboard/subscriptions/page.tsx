"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Subscription {
  id: number;
  type: string;
  totalClasses: number;
  usedClasses: number;
  price: number;
  isActive: boolean;
  purchasedAt: string;
  expiresAt: string | null;
}

const PLANS = [
  { type: "single", name: "Разовое занятие", classes: 1, price: 2500, emoji: "🎟️", desc: "Одно пробное занятие" },
  { type: "pack4", name: "Абонемент на 4 занятия", classes: 4, price: 8000, emoji: "📋", desc: "Экономия 20%", popular: true },
  { type: "pack8", name: "Абонемент на 8 занятий", classes: 8, price: 14000, emoji: "🎫", desc: "Экономия 30%" },
  { type: "unlimited", name: "Безлимитный", classes: 999, price: 25000, emoji: "⭐", desc: "На 1 месяц" },
];

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Subscription[]>("/api/subscriptions")
      .then(setSubs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (type: string) => {
    if (!confirm("Подтвердить покупку абонемента?")) return;
    setBuying(type);
    try {
      const sub = await apiFetch<Subscription>("/api/subscriptions", {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      setSubs([sub, ...subs]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
    setBuying(null);
  };

  const typeLabel = (type: string) => {
    const plan = PLANS.find((p) => p.type === type);
    return plan?.name || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">🎫</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold">Абонементы</h2>
        <p className="text-gray-500">Купите абонемент для выгодного посещения</p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.type} className={`card border-2 ${plan.popular ? "border-brand shadow-xl" : "border-transparent"} relative`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                Популярный
              </div>
            )}
            <div className="text-4xl mb-3">{plan.emoji}</div>
            <h3 className="font-bold text-lg">{plan.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{plan.desc}</p>
            <p className="text-3xl font-extrabold text-brand mb-4">{plan.price.toLocaleString()} ₽</p>
            <button
              onClick={() => handleBuy(plan.type)}
              disabled={buying === plan.type}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              {buying === plan.type ? "Оформляем..." : "Купить"}
            </button>
          </div>
        ))}
      </div>

      {/* Active Subscriptions */}
      <div>
        <h3 className="text-xl font-bold mb-4">Мои абонементы</h3>
        {subs.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">🎫</div>
            <p className="text-gray-500">У вас пока нет абонементов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map((sub) => (
              <div key={sub.id} className="card flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-yellow/20 rounded-2xl flex items-center justify-center text-2xl">🎫</div>
                <div className="flex-1">
                  <h4 className="font-bold">{typeLabel(sub.type)}</h4>
                  <p className="text-sm text-gray-500">
                    Использовано: {sub.usedClasses} / {sub.totalClasses === 999 ? "∞" : sub.totalClasses}
                  </p>
                  {sub.expiresAt && (
                    <p className="text-xs text-gray-400">
                      Действует до: {new Date(sub.expiresAt).toLocaleDateString("ru-RU")}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${sub.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {sub.isActive ? "Активен" : "Истёк"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
