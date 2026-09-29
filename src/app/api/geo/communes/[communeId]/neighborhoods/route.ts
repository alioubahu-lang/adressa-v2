import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { communeId: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (user?.role === "AGENT" && user.communeId !== params.communeId) {
    return NextResponse.json({ error: "Commune hors de votre zone d’affectation." }, { status: 403 });
  }
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { communeId: params.communeId },
    include: { streets: true },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ items: neighborhoods });
}
