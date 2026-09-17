import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduleSlots, programs } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq, gte, and } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const slots = await db.select({
      id: scheduleSlots.id,
      programId: scheduleSlots.programId,
      date: scheduleSlots.date,
      startTime: scheduleSlots.startTime,
      endTime: scheduleSlots.endTime,
      maxSpots: scheduleSlots.maxSpots,
      bookedSpots: scheduleSlots.bookedSpots,
      isActive: scheduleSlots.isActive,
      programName: programs.name,
      programDescription: programs.shortDescription,
      programPrice: programs.price,
    }).from(scheduleSlots)
      .innerJoin(programs, eq(scheduleSlots.programId, programs.id))
      .where(and(gte(scheduleSlots.date, today), eq(scheduleSlots.isActive, true)));
    return NextResponse.json(slots);
  } catch (e) {
    console.error("Schedule GET error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }
    const body = await req.json();
    const [slot] = await db.insert(scheduleSlots).values({
      programId: body.programId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      maxSpots: body.maxSpots || 8,
    }).returning();
    return NextResponse.json(slot, { status: 201 });
  } catch (e) {
    console.error("Schedule POST error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
