import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const communes = await prisma.commune.findMany({
    include: { department: { include: { region: { include: { country: true } } } } },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ items: communes });
}
