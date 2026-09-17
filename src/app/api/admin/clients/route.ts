import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, children, bookings } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const clients = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
      childrenCount: sql<number>`(SELECT COUNT(*) FROM children WHERE children.parent_id = ${users.id})`,
      bookingsCount: sql<number>`(SELECT COUNT(*) FROM bookings WHERE bookings.user_id = ${users.id})`,
    }).from(users).where(eq(users.role, "parent"));

    return NextResponse.json(clients);
  } catch (e) {
    console.error("Admin clients error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
