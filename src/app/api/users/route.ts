import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "AGENT", "MUNICIPAL", "MUNICIPAL_ADMIN", "LOGISTICS_PARTNER", "VIEWER"]),
  communeId: z.string().optional().nullable()
});

function isSuperAdmin(role: unknown) {
  return role === "SUPER_ADMIN";
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  commune: { id: string; name: string } | null;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const users: UserRow[] = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, commune: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ items: users });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      communeId: parsed.data.communeId || null
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  return NextResponse.json(user, { status: 201 });
}
