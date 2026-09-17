"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  name: string;
  role: "parent" | "admin";
  phone: string | null;
}

const PARENT_NAV = [
  { href: "/dashboard", label: "Главная", icon: "🏠" },
  { href: "/dashboard/children", label: "Мои дети", icon: "👶" },
  { href: "/dashboard/schedule", label: "Расписание", icon: "📅" },
  { href: "/dashboard/bookings", label: "Мои записи", icon: "📋" },
  { href: "/dashboard/subscriptions", label: "Абонементы", icon: "🎫" },
];

const ADMIN_NAV = [
  { href: "/dashboard/admin", label: "Главная", icon: "🏠" },
  { href: "/dashboard/admin/clients", label: "Клиенты (CRM)", icon: "👥" },
  { href: "/dashboard/admin/schedule", label: "Расписание", icon: "📅" },
  { href: "/dashboard/admin/programs", label: "Программы", icon: "📚" },
  { href: "/dashboard/admin/bookings", label: "Записи", icon: "📋" },
  { href: "/dashboard/admin/test-drives", label: "Тест-драйвы", icon: "🎯" },
  { href: "/dashboard/admin/analytics", label: "Аналитика", icon: "📊" },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
      setLoading(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🚀</div>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const nav = user.role === "admin" ? ADMIN_NAV : PARENT_NAV;

  return (
    <div className="min-h-screen bg-bg-warm flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white text-lg">🚀</div>
            <div>
              <h1 className="font-extrabold text-brand text-sm">Академия Ума</h1>
              <p className="text-[10px] text-gray-400">Клуб первых открытий</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-brand"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-muted-blue/30 rounded-full flex items-center justify-center text-lg">
              {user.role === "admin" ? "🔧" : "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-accent-red hover:bg-red-50 rounded-xl transition-colors">
            🚪 Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-gray-900">
              {user.role === "admin" ? "Панель администратора" : "Личный кабинет"}
            </h2>
            <p className="text-sm text-gray-400">Добро пожаловать, {user.name}!</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
