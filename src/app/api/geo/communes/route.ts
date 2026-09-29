import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const savedUser = user?.role === "AGENT" && user.id
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { communeId: true } })
    : null;
  const communes = await prisma.commune.findMany({
    where: user?.role === "AGENT" ? { id: savedUser?.communeId ?? "__unassigned__" } : undefined,
    include: { department: { include: { region: { include: { country: true } } } } },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ items: communes });
}
