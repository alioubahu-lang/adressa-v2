import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "AGENT", "MUNICIPAL", "MUNICIPAL_ADMIN", "LOGISTICS_PARTNER", "VIEWER"]).optional(),
  communeId: z.string().nullable().optional()
});

function isSuperAdmin(role: unknown) {
  return role === "SUPER_ADMIN";
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
      ...(parsed.data.communeId !== undefined ? { communeId: parsed.data.communeId } : {})
    },
    select: { id: true, name: true, email: true, role: true }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id as string | undefined;

  if (!isSuperAdmin((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (currentUserId === params.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
