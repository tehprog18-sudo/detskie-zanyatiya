import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, scheduleSlots } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { id } = await params;
    const bookingId = parseInt(id);
    
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!booking) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    if (booking.userId !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, bookingId));
    await db.update(scheduleSlots)
      .set({ bookedSpots: sql`GREATEST(${scheduleSlots.bookedSpots} - 1, 0)` })
      .where(eq(scheduleSlots.id, booking.slotId));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Bookings DELETE error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
