import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { testDriveRequests } from "@/db/schema";
import { getUserFromHeaders } from "@/lib/auth";
import { sendTelegramNotification, formatTestDriveMessage } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }
    const requests = await db.select().from(testDriveRequests);
    return NextResponse.json(requests);
  } catch (e) {
    console.error("Test-drive GET error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [request] = await db.insert(testDriveRequests).values({
      parentName: body.parentName,
      phone: body.phone,
      email: body.email || null,
      childAge: body.childAge || null,
      message: body.message || null,
    }).returning();

    sendTelegramNotification(
      formatTestDriveMessage(body.parentName, body.phone, body.childAge)
    ).catch(() => {});

    return NextResponse.json(request, { status: 201 });
  } catch (e) {
    console.error("Test-drive POST error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
