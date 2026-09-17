import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { comparePassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Введите email и пароль" }, { status: 400 });
    }
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }
    const token = createToken({ userId: user.id, email: user.email, role: user.role });
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
    console.error("Login error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
