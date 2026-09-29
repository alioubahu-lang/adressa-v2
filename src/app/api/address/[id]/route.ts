import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, canDeleteAddress, canEditAddress } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

// GET /api/address/SN-SBK-001
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const address = await prisma.address.findUnique({
    where: { adresssaId: params.id.toUpperCase() },
    include: { commune: true, neighborhood: true, street: true, region: true, country: true, qrCode: true }
  });

  if (!address) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  }

  const user = session.user as any;
  if (user.role === "AGENT") {
    const savedUser = user.id ? await prisma.user.findUnique({ where: { id: user.id }, select: { communeId: true } }) : null;
    if (address.createdById !== user.id || address.communeId !== savedUser?.communeId || address.verified || ["VERIFIE", "PUBLIE"].includes(address.status)) {
      return NextResponse.json({ error: "Cette adresse ne fait pas partie de vos saisies modifiables." }, { status: 404 });
    }
  }

  return NextResponse.json(address);
}

// PUT /api/address/SN-SBK-001
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;

  const body = await req.json();

  // Un titulaire de fiscal:edit (ex: MUNICIPAL_ADMIN) sans droit d'édition général
  // ne peut modifier QUE le statut fiscal — jamais les autres champs de l'adresse.
  const isFiscalOnlyUpdate = Object.keys(body).every((k) => k === "taxStatus");
  const authorized = canEditAddress(role) || (isFiscalOnlyUpdate && hasPermission(role, "fiscal:edit"));

  if (!authorized) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const existing = await prisma.address.findUnique({ where: { adresssaId: params.id.toUpperCase() } });
  if (!existing) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  }

  const user = session?.user as any;
  let agentCommuneId: string | null = null;
  if (role === "AGENT") {
    const savedUser = user?.id ? await prisma.user.findUnique({ where: { id: user.id }, select: { communeId: true } }) : null;
    agentCommuneId = savedUser?.communeId ?? null;
    if (existing.createdById !== user?.id || existing.communeId !== savedUser?.communeId || existing.verified || ["VERIFIE", "PUBLIE"].includes(existing.status)) {
      return NextResponse.json({ error: "Cette adresse ne fait pas partie de vos saisies modifiables." }, { status: 404 });
    }
  }

  const userId = (session?.user as any)?.id as string | undefined;

  // Champs modifiables — on ignore volontairement adresssaId (jamais modifiable après création)
  const updatable = [
    "latitude",
    "longitude",
    "entranceLatitude",
    "entranceLongitude",
    "plusCode",
    "landmark",
    "description",
    "photoUrl",
    ...(role === "AGENT" ? [] : ["status", "verified"]),
    "streetId",
    "buildingNumber",
    "buildingType",
    "businessPhotoUrl",
    "platePhotoUrl",
    "occupancyType",
    "businessName",
    "businessCategory",
    "businessNinea",
    "businessRegister",
    "plateStatus",
    "gpsAccuracyMeters",
    ...(role === "AGENT" ? [] : ["taxStatus"])
  ] as const;

  const data: Record<string, unknown> = {};
  const historyEntries: { action: string; oldValue: string; newValue: string }[] = [];

  for (const field of updatable) {
    if (field in body) {
      const oldValue = (existing as any)[field];
      const newValue = body[field];
      if (oldValue !== newValue) {
        data[field] = newValue;
        historyEntries.push({
          action: `MODIFICATION_${field.toUpperCase()}`,
          oldValue: String(oldValue),
          newValue: String(newValue)
        });
      }
    }
  }

  data.updatedById = userId ?? null;

  if (role === "AGENT") {
    const updatedCount = await prisma.$transaction(async (tx) => {
      const result = await tx.address.updateMany({
        where: { id: existing.id, createdById: userId, communeId: agentCommuneId ?? "__no_assignment__", verified: false, status: { in: ["BROUILLON", "COLLECTE", "A_VERIFIER"] } },
        data: data as any
      });
      if (result.count && historyEntries.length) {
        await tx.addressHistory.createMany({ data: historyEntries.map((entry) => ({ ...entry, addressId: existing.id, userId: userId ?? null })) });
      }
      return result.count;
    });
    if (!updatedCount) return NextResponse.json({ error: "Cette adresse n’est plus modifiable dans votre espace terrain." }, { status: 404 });
    const updated = await prisma.address.findUnique({ where: { id: existing.id } });
    return NextResponse.json(updated);
  }

  const updated = await prisma.address.update({
    where: { id: existing.id },
    data: {
      ...data,
      history: historyEntries.length
        ? { create: historyEntries.map((h) => ({ ...h, userId })) }
        : undefined
    }
  });

  return NextResponse.json(updated);
}

// DELETE /api/address/SN-SBK-001 — réservé ADMIN / SUPER_ADMIN
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!canDeleteAddress((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const existing = await prisma.address.findUnique({ where: { adresssaId: params.id.toUpperCase() } });
  if (!existing) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.scan.deleteMany({ where: { addressId: existing.id } }),
    prisma.addressHistory.deleteMany({ where: { addressId: existing.id } }),
    prisma.qrCode.deleteMany({ where: { addressId: existing.id } }),
    prisma.address.delete({ where: { id: existing.id } })
  ]);

  return NextResponse.json({ success: true });
}
