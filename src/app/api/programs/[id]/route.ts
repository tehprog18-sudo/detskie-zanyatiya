import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const [updated] = await db.update(programs).set({
      name: body.name,
      description: body.description,
      shortDescription: body.shortDescription,
      imageUrl: body.imageUrl,
      price: body.price,
      duration: body.duration,
      maxSpots: body.maxSpots,
    }).where(eq(programs.id, parseInt(id))).returning();
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Programs PUT error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }
    const { id } = await params;
    await db.update(programs).set({ isActive: false }).where(eq(programs.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Programs DELETE error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
