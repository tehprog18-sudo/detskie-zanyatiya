import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, scheduleSlots, programs, children, users } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";
import { sendTelegramNotification, formatBookingMessage } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    if (user.role === "admin") {
      const all = await db.select({
        id: bookings.id,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        childName: children.name,
        slotDate: scheduleSlots.date,
        slotStartTime: scheduleSlots.startTime,
        programName: programs.name,
        parentName: users.name,
        parentEmail: users.email,
        parentPhone: users.phone,
      }).from(bookings)
        .innerJoin(children, eq(bookings.childId, children.id))
        .innerJoin(scheduleSlots, eq(bookings.slotId, scheduleSlots.id))
        .innerJoin(programs, eq(scheduleSlots.programId, programs.id))
        .innerJoin(users, eq(bookings.userId, users.id));
      return NextResponse.json(all);
    }

    const userBookings = await db.select({
      id: bookings.id,
      status: bookings.status,
      notes: bookings.notes,
      createdAt: bookings.createdAt,
      childName: children.name,
      slotDate: scheduleSlots.date,
      slotStartTime: scheduleSlots.startTime,
      slotEndTime: scheduleSlots.endTime,
      programName: programs.name,
    }).from(bookings)
      .innerJoin(children, eq(bookings.childId, children.id))
      .innerJoin(scheduleSlots, eq(bookings.slotId, scheduleSlots.id))
      .innerJoin(programs, eq(scheduleSlots.programId, programs.id))
      .where(eq(bookings.userId, user.userId));
    return NextResponse.json(userBookings);
  } catch (e) {
    console.error("Bookings GET error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await req.json();
    const { childId, slotId } = body;

    // Check slot availability
    const [slot] = await db.select().from(scheduleSlots).where(eq(scheduleSlots.id, slotId));
    if (!slot || slot.bookedSpots >= slot.maxSpots) {
      return NextResponse.json({ error: "Нет свободных мест" }, { status: 400 });
    }

    // Check child belongs to user
    const [child] = await db.select().from(children).where(
      and(eq(children.id, childId), eq(children.parentId, user.userId))
    );
    if (!child) {
      return NextResponse.json({ error: "Ребёнок не найден" }, { status: 404 });
    }

    // Create booking
    const [booking] = await db.insert(bookings).values({
      userId: user.userId,
      childId,
      slotId,
      notes: body.notes || null,
    }).returning();

    // Update booked spots
    await db.update(scheduleSlots)
      .set({ bookedSpots: sql`${scheduleSlots.bookedSpots} + 1` })
      .where(eq(scheduleSlots.id, slotId));

    // Get info for telegram
    const [program] = await db.select().from(programs).where(eq(programs.id, slot.programId));
    const [parentUser] = await db.select().from(users).where(eq(users.id, user.userId));

    sendTelegramNotification(
      formatBookingMessage(parentUser.name, child.name, program.name, slot.date, slot.startTime)
    ).catch(() => {});

    return NextResponse.json(booking, { status: 201 });
  } catch (e) {
    console.error("Bookings POST error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
