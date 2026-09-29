import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { canManageAgentProfiles, type Role } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({ message: z.string().trim().min(2).max(2000) });
const editableStatuses = ["BROUILLON", "COLLECTE", "A_VERIFIER"] as const;

async function getAddressForRole(adresssaId: string, user: any) {
  const address = await prisma.address.findUnique({ where: { adresssaId: adresssaId.toUpperCase() } });
  if (!address) return null;
  if (user.role === "AGENT") {
    const assigned = user.id ? await prisma.user.findUnique({ where: { id: user.id }, select: { communeId: true } }) : null;
    if (address.createdById !== user.id || address.communeId !== assigned?.communeId || address.verified || !editableStatuses.includes(address.status as any)) return null;
    return address;
  }
  if (canManageAgentProfiles(user.role as Role)) return address;
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const user = session.user as any;
  const address = await getAddressForRole(params.id, user);
  if (!address) return NextResponse.json({ error: "Adresse hors de votre périmètre." }, { status: 404 });

  const comments = await prisma.addressComment.findMany({
    where: { addressId: address.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, message: true, authorName: true, createdAt: true }
  });
  return NextResponse.json({ items: comments });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const user = session.user as any;
  if (!canManageAgentProfiles(user.role as Role)) return NextResponse.json({ error: "Seuls les administrateurs peuvent commenter." }, { status: 403 });

  const parsed = commentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Le commentaire doit contenir entre 2 et 2 000 caractères." }, { status: 400 });
  const address = await prisma.address.findUnique({ where: { adresssaId: params.id.toUpperCase() } });
  if (!address) return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  if (address.verified || !editableStatuses.includes(address.status as any)) {
    return NextResponse.json({ error: "Les remarques ne peuvent être ajoutées qu’aux saisies en cours de validation." }, { status: 409 });
  }

  const author = user.id ? await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } }) : null;
  const comment = await prisma.addressComment.create({
    data: { addressId: address.id, authorId: user.id ?? null, authorName: author?.name ?? session.user?.name ?? "Administration ADRESSA", message: parsed.data.message },
    select: { id: true, message: true, authorName: true, createdAt: true }
  });
  return NextResponse.json(comment, { status: 201 });
}
