import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/map?communeId=... — retourne les adresses sous forme légère pour affichage carte
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const communeId = searchParams.get("communeId") ?? undefined;
  const publicOnly = searchParams.get("public") === "true";
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!publicOnly && !session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  if (user?.role === "AGENT") {
    const savedUser = user.id ? await prisma.user.findUnique({ where: { id: user.id }, select: { communeId: true } }) : null;
    if (!savedUser?.communeId) return NextResponse.json({ items: [] });
    const allowedStatuses = ["BROUILLON", "COLLECTE", "A_VERIFIER"];
    const addresses = await prisma.address.findMany({
      where: { createdById: user.id, communeId: savedUser.communeId, verified: false, status: { in: allowedStatuses as any[] } },
      select: { adresssaId: true, latitude: true, longitude: true, photoUrl: true, status: true, commune: { select: { name: true } }, neighborhood: { select: { name: true } } },
      take: 5000
    });
    return NextResponse.json({ items: addresses });
  }

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
