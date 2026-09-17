import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq } from "drizzle-orm";

const SUBSCRIPTION_PLANS = {
  single: { totalClasses: 1, price: 2500, label: "Разовое занятие" },
  pack4: { totalClasses: 4, price: 8000, label: "Абонемент на 4 занятия" },
  pack8: { totalClasses: 8, price: 14000, label: "Абонемент на 8 занятий" },
  unlimited: { totalClasses: 999, price: 25000, label: "Безлимитный абонемент" },
};

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.userId));
    return NextResponse.json(subs);
  } catch (e) {
    console.error("Subscriptions GET error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await req.json();
    const plan = SUBSCRIPTION_PLANS[body.type as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) return NextResponse.json({ error: "Неверный тип абонемента" }, { status: 400 });
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (body.type === "unlimited" ? 1 : 3));

    const [sub] = await db.insert(subscriptions).values({
      userId: user.userId,
      type: body.type,
      totalClasses: plan.totalClasses,
      price: plan.price,
      expiresAt,
    }).returning();
    return NextResponse.json(sub, { status: 201 });
  } catch (e) {
    console.error("Subscriptions POST error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
