import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromHeaders(req.headers);
    if (!payload) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    console.error("Me error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
