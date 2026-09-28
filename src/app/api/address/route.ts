import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateAdresssaId } from "@/lib/adresssaId";
import { authOptions, canEditAddress } from "@/lib/auth";

const createAddressSchema = z.object({
  countryId: z.string().min(1),
  regionId: z.string().min(1),
  departmentId: z.string().min(1),
  communeId: z.string().min(1),
  neighborhoodId: z.string().min(1).optional(),
  neighborhoodName: z.string().trim().min(1).max(120).optional(),
  streetId: z.string().optional().nullable(),
  buildingNumber: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  entranceLatitude: z.number().min(-90).max(90).optional().nullable(),
  entranceLongitude: z.number().min(-180).max(180).optional().nullable(),
  plusCode: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  buildingType: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  businessPhotoUrl: z.string().url().optional().nullable(),
  platePhotoUrl: z.string().url().optional().nullable(),
  occupancyType: z.enum(["RESIDENTIEL", "COMMERCIAL", "PUBLIC"]).optional().nullable(),
  businessName: z.string().trim().max(160).optional().nullable(),
  businessCategory: z.string().trim().max(80).optional().nullable(),
  businessNinea: z.string().trim().max(80).optional().nullable(),
  businessRegister: z.string().trim().max(80).optional().nullable(),
  plateStatus: z.enum(["POSEE", "EN_ATTENTE"]).optional().nullable(),
  gpsAccuracyMeters: z.number().min(0).max(100000).optional().nullable(),
  clientRequestId: z.string().uuid().optional()
}).superRefine((data, context) => {
  if (!data.neighborhoodId && !data.neighborhoodName) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["neighborhoodName"], message: "Le nom du quartier est obligatoire." });
  }
  if (data.occupancyType && !(data.photoUrl || data.businessPhotoUrl)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["businessPhotoUrl"], message: "La photo de la façade est obligatoire." });
  }
  if (data.occupancyType === "COMMERCIAL") {
    if (!data.businessName?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["businessName"], message: "L'enseigne est obligatoire pour un commerce." });
    if (!data.businessCategory?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["businessCategory"], message: "La catégorie est obligatoire pour un commerce." });
  }
  if (data.plateStatus === "POSEE" && !data.platePhotoUrl) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["platePhotoUrl"], message: "La photo de la plaque posée est obligatoire." });
  }
});

// GET /api/address — liste paginée (usage dashboard)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const status = searchParams.get("status") ?? undefined;
  const communeId = searchParams.get("communeId") ?? undefined;

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(communeId ? { communeId } : {})
  };

  const [items, total] = await Promise.all([
    prisma.address.findMany({
      where,
      include: { commune: true, neighborhood: true, street: true, qrCode: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.address.count({ where })
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

// POST /api/address — création (agents et plus)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canEditAddress((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.clientRequestId) {
    const existingRequest = await prisma.address.findUnique({ where: { clientRequestId: data.clientRequestId } });
    if (existingRequest) return NextResponse.json(existingRequest);
  }

  const [country, commune] = await Promise.all([
    prisma.country.findUnique({ where: { id: data.countryId } }),
    prisma.commune.findUnique({ where: { id: data.communeId } })
  ]);
  if (!country || !commune) {
    return NextResponse.json({ error: "Pays ou commune introuvable." }, { status: 404 });
  }

  let neighborhoodId = data.neighborhoodId;
  if (neighborhoodId) {
    const neighborhood = await prisma.neighborhood.findFirst({ where: { id: neighborhoodId, communeId: commune.id } });
    if (!neighborhood) return NextResponse.json({ error: "Quartier introuvable pour cette commune." }, { status: 404 });
  } else if (data.neighborhoodName) {
    const existing = await prisma.neighborhood.findFirst({
      where: { communeId: commune.id, name: { equals: data.neighborhoodName, mode: "insensitive" } }
    });
    const neighborhood = existing ?? await prisma.neighborhood.create({ data: { communeId: commune.id, name: data.neighborhoodName } });
    neighborhoodId = neighborhood.id;
  }

  const communeCode = commune.code ?? commune.name.slice(0, 3).toUpperCase();
  const adresssaId = await generateAdresssaId(country.code, communeCode);
  const userId = (session?.user as any)?.id as string | undefined;

  try {
    const address = await prisma.address.create({
      data: {
        clientRequestId: data.clientRequestId,
        adresssaId,
        countryId: data.countryId,
        regionId: data.regionId,
        departmentId: data.departmentId,
        communeId: data.communeId,
        neighborhoodId: neighborhoodId!,
        streetId: data.streetId ?? null,
        buildingNumber: data.buildingNumber ?? null,
        latitude: data.latitude,
        longitude: data.longitude,
        entranceLatitude: data.entranceLatitude ?? null,
        entranceLongitude: data.entranceLongitude ?? null,
        plusCode: data.plusCode ?? null,
        landmark: data.landmark ?? null,
        buildingType: data.buildingType ?? null,
        description: data.description ?? null,
        photoUrl: data.photoUrl ?? data.businessPhotoUrl ?? null,
        businessPhotoUrl: data.businessPhotoUrl ?? data.photoUrl ?? null,
        platePhotoUrl: data.platePhotoUrl ?? null,
        occupancyType: data.occupancyType ?? null,
        businessName: data.businessName ?? null,
        businessCategory: data.businessCategory ?? null,
        businessNinea: data.businessNinea ?? null,
        businessRegister: data.businessRegister ?? null,
        plateStatus: data.plateStatus ?? null,
        gpsAccuracyMeters: data.gpsAccuracyMeters ?? null,
        status: "COLLECTE",
        createdById: userId ?? null,
        qrCode: {
          create: {
            code: adresssaId,
            targetUrl: `/a/${adresssaId}`
          }
        },
        history: userId
          ? {
              create: {
                userId,
                action: "CREATION",
                newValue: adresssaId
              }
            }
          : undefined
      },
      include: { qrCode: true }
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    if (data.clientRequestId && (error as { code?: string }).code === "P2002") {
      const existingRequest = await prisma.address.findUnique({ where: { clientRequestId: data.clientRequestId } });
      if (existingRequest) return NextResponse.json(existingRequest);
    }
    throw error;
  }
}
