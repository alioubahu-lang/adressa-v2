import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/map?communeId=... — retourne les adresses sous forme légère pour affichage carte
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const communeId = searchParams.get("communeId") ?? undefined;
  const publicOnly = searchParams.get("public") === "true";

  const addresses = await prisma.address.findMany({
    where: {
      ...(communeId ? { communeId } : {}),
      ...(publicOnly ? { status: "PUBLIE" } : {})
    },
    select: {
      adresssaId: true,
      latitude: true,
      longitude: true,
      photoUrl: true,
      status: true,
      commune: { select: { name: true } },
      neighborhood: { select: { name: true } }
    },
    take: 5000
  });

  return NextResponse.json({ items: addresses });
}
