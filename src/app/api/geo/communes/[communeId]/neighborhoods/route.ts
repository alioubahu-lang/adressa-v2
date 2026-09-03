import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { communeId: string } }) {
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { communeId: params.communeId },
    include: { streets: true },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ items: neighborhoods });
}
