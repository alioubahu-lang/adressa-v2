import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, canDeleteAddress, canEditAddress } from "@/lib/auth";

// GET /api/address/SN-SBK-001
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const address = await prisma.address.findUnique({
    where: { adresssaId: params.id.toUpperCase() },
    include: { commune: true, neighborhood: true, street: true, region: true, country: true, qrCode: true }
  });

  if (!address) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  }

  return NextResponse.json(address);
}

// PUT /api/address/SN-SBK-001
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!canEditAddress(role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const existing = await prisma.address.findUnique({ where: { adresssaId: params.id.toUpperCase() } });
  if (!existing) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  }

  const body = await req.json();
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
    "status",
    "verified",
    "streetId",
    "buildingNumber"
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
