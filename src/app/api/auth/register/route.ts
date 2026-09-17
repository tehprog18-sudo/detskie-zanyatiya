import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendTelegramNotification, formatNewClientMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
    }
    const hashedPassword = await hashPassword(password);
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      role: "parent",
    }).returning();

    const token = createToken({ userId: user.id, email: user.email, role: user.role });

    // Send Telegram notification
    sendTelegramNotification(formatNewClientMessage(name, email, phone)).catch(() => {});

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
      token,
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
