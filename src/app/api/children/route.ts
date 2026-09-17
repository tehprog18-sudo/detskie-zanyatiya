import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { children } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const list = await db.select().from(children).where(eq(children.parentId, user.userId));
    return NextResponse.json(list);
  } catch (e) {
    console.error("Children GET error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await req.json();
    const [child] = await db.insert(children).values({
      parentId: user.userId,
      name: body.name,
      birthDate: body.birthDate,
      notes: body.notes || null,
    }).returning();
    return NextResponse.json(child, { status: 201 });
  } catch (e) {
    console.error("Children POST error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
