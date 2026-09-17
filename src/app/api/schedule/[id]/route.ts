import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduleSlots } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }
    const { id } = await params;
    await db.update(scheduleSlots).set({ isActive: false }).where(eq(scheduleSlots.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Schedule DELETE error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
