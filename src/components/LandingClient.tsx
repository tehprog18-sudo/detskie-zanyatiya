"use client";

import { useState } from "react";
import Link from "next/link";

interface Program {
  id: number;
  name: string;
  description: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  price: number;
  duration: number;
}

const EMOJI_MAP: Record<string, string> = {
  "Маленький строитель": "🏗️",
  "Грязное творчество": "🎨",
  "Маленький повар": "👨‍🍳",
  "Музыкальный мир": "🎵",
  "Мир на ощупь": "🤲",
  "Лаборатория малыша": "🔬",
  "Первооткрыватель джунглей": "🌿",
  "Первооткрыватель космоса": "🚀",
  "Сенсорная комната": "✨",
  "Малыш и город": "🏙️",
};

const COLOR_MAP: Record<string, string> = {
  "Маленький строитель": "from-amber-400 to-orange-500",
  "Грязное творчество": "from-pink-400 to-purple-500",
  "Маленький повар": "from-green-400 to-emerald-500",
  "Музыкальный мир": "from-blue-400 to-indigo-500",
  "Мир на ощупь": "from-teal-400 to-cyan-500",
  "Лаборатория малыша": "from-violet-400 to-purple-600",
  "Первооткрыватель джунглей": "from-lime-400 to-green-600",
  "Первооткрыватель космоса": "from-indigo-400 to-blue-700",
  "Сенсорная комната": "from-rose-300 to-pink-500",
  "Малыш и город": "from-sky-400 to-blue-500",
};

const FEATURES = [
  { icon: "⭐", title: "Игра", desc: "Свободная игра в безопасном пространстве" },
  { icon: "❤️", title: "Творчество", desc: "Рисование, лепка и эксперименты" },
  { icon: "✈️", title: "Движение", desc: "Активные игры и физическая активность" },
  { icon: "☀️", title: "Музыка", desc: "Песни, танцы и живые инструменты" },
  { icon: "🌿", title: "Природа", desc: "Знакомство с окружающим миром" },
];

function TestDriveModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ parentName: "", phone: "", email: "", childAge: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/test-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
    } catch {
      alert("Ошибка отправки");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-brand mb-2">Заявка отправлена!</h3>
            <p className="text-gray-600">Мы свяжемся с вами в ближайшее время</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-brand mb-2">Тест-драйв клуба</h3>
            <p className="text-gray-500 mb-6">Приходите на пробное занятие и познакомьтесь с нашим пространством</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text" required placeholder="Ваше имя"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              />
              <input
                type="tel" required placeholder="Телефон"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                type="email" placeholder="Email (необязательно)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="text" placeholder="Возраст ребёнка"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                value={form.childAge} onChange={(e) => setForm({ ...form, childAge: e.target.value })}
              />
              <button type="submit" disabled={loading} className="btn-accent w-full disabled:opacity-50">
                {loading ? "Отправляем..." : "Записаться на тест-драйв"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ProgramModal({ program, onClose }: { program: Program; onClose: () => void }) {
  const emoji = EMOJI_MAP[program.name] || "📚";
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        <div className="text-6xl mb-4">{emoji}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h3>
        <p className="text-brand font-bold text-lg mb-4">{program.price} ₽ / занятие</p>
        <p className="text-gray-600 leading-relaxed mb-4">{program.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1">🕐 {program.duration} мин</span>
          <span className="flex items-center gap-1">👶 1–2 года</span>
        </div>
        <Link href="/login" className="btn-primary block text-center">
          Записаться на занятие
        </Link>
      </div>
    </div>
  );
}

export default function LandingClient({ programs: programsList }: { programs: Program[] }) {
  const [showTestDrive, setShowTestDrive] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const displayPrograms = programsList.length > 0 ? programsList : [
    { id: 1, name: "Маленький строитель", shortDescription: "Строим, исследуем, играем!", description: "Занятие для малышей-строителей", imageUrl: "🏗️", price: 2500, duration: 120 },
    { id: 2, name: "Грязное творчество", shortDescription: "Можно пачкаться, нельзя скучать!", description: "Творчество без границ", imageUrl: "🎨", price: 2500, duration: 120 },
    { id: 3, name: "Маленький повар", shortDescription: "Готовим, играем, развиваемся!", description: "Кулинарные приключения", imageUrl: "👨‍🍳", price: 2800, duration: 120 },
    { id: 4, name: "Музыкальный мир", shortDescription: "Играем, слушаем, двигаемся!", description: "Мир музыки для малышей", imageUrl: "🎵", price: 2500, duration: 120 },
    { id: 5, name: "Мир на ощупь", shortDescription: "Трогаем, щупаем, исследуем!", description: "Сенсорное развитие", imageUrl: "🤲", price: 2500, duration: 120 },
    { id: 6, name: "Лаборатория малыша", shortDescription: "Эксперименты и открытия!", description: "Простые опыты", imageUrl: "🔬", price: 2800, duration: 120 },
    { id: 7, name: "Первооткрыватель джунглей", shortDescription: "Приключение в джунглях!", description: "Активные игры", imageUrl: "🌿", price: 2500, duration: 120 },
    { id: 8, name: "Первооткрыватель космоса", shortDescription: "Путешествие к звёздам!", description: "Космические игры", imageUrl: "🚀", price: 2500, duration: 120 },
    { id: 9, name: "Сенсорная комната", shortDescription: "Расслабление и исследование.", description: "Мягкое занятие", imageUrl: "✨", price: 2500, duration: 120 },
    { id: 10, name: "Малыш и город", shortDescription: "Играем в город!", description: "Ролевые игры", imageUrl: "🏙️", price: 2500, duration: 120 },
  ];

  return (
    <div className="min-h-screen bg-bg-warm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white text-xl">🚀</div>
            <div>
              <h1 className="font-extrabold text-brand text-lg leading-tight">Академия Ума</h1>
              <p className="text-xs text-gray-500">Клуб первых открытий</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-gray-600 hover:text-brand font-medium text-sm">О нас</a>
            <a href="#programs" className="text-gray-600 hover:text-brand font-medium text-sm">Занятия</a>
            <a href="#contacts" className="text-gray-600 hover:text-brand font-medium text-sm">Контакты</a>
            <Link href="/login" className="btn-primary text-sm !py-2 !px-4">Личный кабинет</Link>
          </nav>
          <Link href="/login" className="md:hidden btn-primary text-sm !py-2 !px-4">Войти</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-accent-yellow/10 to-accent-red/5" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span>👶</span> Для малышей 1–2 лет и их родителей
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Уникальные занятия: первые открытия в{" "}
              <span className="text-brand">свободном игровом пространстве</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              Свободная игра, новые открытия для малышей, много движения, сенсорного опыта, музыки и общения ребёнка с родителем.{" "}
              <span className="font-bold text-accent-red">2 часа открытий</span> без скучных занятий.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setShowTestDrive(true)} className="btn-accent text-lg !py-4 !px-8">
                🎯 Тест-драйв клуба
              </button>
              <Link href="/login" className="btn-primary text-lg !py-4 !px-8 text-center">
                👤 Войти в личный кабинет
              </Link>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 text-6xl opacity-30 hidden lg:block">⭐</div>
          <div className="absolute bottom-10 right-20 text-8xl opacity-20 hidden lg:block">🚀</div>
          <div className="absolute top-20 right-40 text-4xl opacity-20 hidden lg:block">❤️</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              2 часа новых открытий
            </h3>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Яркие впечатления, игра и развитие для вашего малыша! Каждое занятие — новая тема!
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center p-6 rounded-2xl bg-bg-warm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h4 className="font-bold text-gray-900 mb-1">{f.title}</h4>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Тематические занятия в клубе первых открытий
            </h3>
            <p className="text-gray-500 text-lg">
              Вариации тематических встреч для ваших малышей
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayPrograms.map((p) => {
              const emoji = EMOJI_MAP[p.name] || p.imageUrl || "📚";
              const gradient = COLOR_MAP[p.name] || "from-blue-400 to-blue-600";
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProgram(p)}
                  className="group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                    {emoji}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{p.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{p.shortDescription}</p>
                  <div className="mt-3 text-brand font-bold text-sm">{p.price} ₽</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Абонементы</h3>
            <p className="text-gray-500 text-lg">Выберите удобный формат посещения</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Разовое", classes: "1 занятие", price: "2 500 ₽", color: "border-gray-200" },
              { name: "Стандарт", classes: "4 занятия", price: "8 000 ₽", color: "border-brand", popular: true },
              { name: "Продвинутый", classes: "8 занятий", price: "14 000 ₽", color: "border-accent-yellow" },
              { name: "Безлимит", classes: "Без ограничений", price: "25 000 ₽/мес", color: "border-accent-red" },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border-2 ${plan.color} p-6 bg-white ${plan.popular ? "shadow-xl scale-105" : "shadow-md"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                    Популярный
                  </div>
                )}
                <h4 className="font-bold text-lg mb-1">{plan.name}</h4>
                <p className="text-gray-500 text-sm mb-4">{plan.classes}</p>
                <p className="text-3xl font-extrabold text-brand mb-4">{plan.price}</p>
                <Link href="/login" className="btn-primary w-full text-center block text-sm !py-2.5">
                  Выбрать
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section id="contacts" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-brand rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Остались вопросы?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Свяжитесь с нами — мы с удовольствием расскажем о наших занятиях и поможем выбрать подходящее
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setShowTestDrive(true)} className="btn-accent">
                📞 Записаться на тест-драйв
              </button>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                ✈️ Написать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-lg">🚀</div>
            <div>
              <h4 className="font-bold">Академия Ума</h4>
              <p className="text-xs text-gray-400">Клуб первых открытий</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">© 2024 Академия Ума. Все права защищены.</p>
        </div>
      </footer>

      {/* Modals */}
      {showTestDrive && <TestDriveModal onClose={() => setShowTestDrive(false)} />}
      {selectedProgram && <ProgramModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />}
    </div>
  );
}
