import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/address/search?q=SN-SBK-001 | Sébikotane | Dogar | nom de rue
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.address.findMany({
    where: {
      status: "PUBLIE",
      OR: [
        { adresssaId: { contains: q, mode: "insensitive" } },
        { commune: { name: { contains: q, mode: "insensitive" } } },
        { neighborhood: { name: { contains: q, mode: "insensitive" } } },
        { street: { name: { contains: q, mode: "insensitive" } } },
        { landmark: { contains: q, mode: "insensitive" } }
      ]
    },
    include: { commune: true, neighborhood: true, street: true },
    take: 25
  });

  return NextResponse.json({ items });
}
