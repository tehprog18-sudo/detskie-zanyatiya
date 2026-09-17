import Link from "next/link";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import LandingClient from "@/components/LandingClient";

export const dynamic = "force-dynamic";

async function getPrograms() {
  try {
    return await db.select().from(programs).where(eq(programs.isActive, true));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const programsList = await getPrograms();
  return <LandingClient programs={programsList} />;
}
