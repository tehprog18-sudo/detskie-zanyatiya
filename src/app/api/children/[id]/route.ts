import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { children } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const [updated] = await db.update(children).set({
      name: body.name,
      birthDate: body.birthDate,
      notes: body.notes,
    }).where(and(eq(children.id, parseInt(id)), eq(children.parentId, user.userId))).returning();
    if (!updated) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Children PUT error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { id } = await params;
    await db.delete(children).where(and(eq(children.id, parseInt(id)), eq(children.parentId, user.userId)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Children DELETE error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
