import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

const updateCommuneSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable()
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;
  if (!hasPermission(role, "settings:manage")) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateCommuneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.commune.update({
    where: { id: params.id },
    data: parsed.data
  });

  return NextResponse.json(updated);
}
