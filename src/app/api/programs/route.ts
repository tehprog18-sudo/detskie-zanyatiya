import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(programs).where(eq(programs.isActive, true));
    return NextResponse.json(all);
  } catch (e) {
    console.error("Programs GET error:", e);
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
    const [program] = await db.insert(programs).values({
      name: body.name,
      description: body.description || null,
      shortDescription: body.shortDescription || null,
      imageUrl: body.imageUrl || null,
      price: body.price || 0,
      duration: body.duration || 120,
      maxSpots: body.maxSpots || 8,
    }).returning();
    return NextResponse.json(program, { status: 201 });
  } catch (e) {
    console.error("Programs POST error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
