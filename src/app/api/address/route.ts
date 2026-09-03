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
  neighborhoodId: z.string().min(1),
  streetId: z.string().optional().nullable(),
  buildingNumber: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  entranceLatitude: z.number().min(-90).max(90).optional().nullable(),
  entranceLongitude: z.number().min(-180).max(180).optional().nullable(),
  plusCode: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().nullable()
});

// GET /api/address — liste paginée (usage dashboard)
export async function GET(req: NextRequest) {
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

  const [country, commune] = await Promise.all([
    prisma.country.findUnique({ where: { id: data.countryId } }),
    prisma.commune.findUnique({ where: { id: data.communeId } })
  ]);
  if (!country || !commune) {
    return NextResponse.json({ error: "Pays ou commune introuvable." }, { status: 404 });
  }

  const communeCode = commune.code ?? commune.name.slice(0, 3).toUpperCase();
  const adresssaId = await generateAdresssaId(country.code, communeCode);
  const userId = (session?.user as any)?.id as string | undefined;

  const address = await prisma.address.create({
    data: {
      adresssaId,
      countryId: data.countryId,
      regionId: data.regionId,
      departmentId: data.departmentId,
      communeId: data.communeId,
      neighborhoodId: data.neighborhoodId,
      streetId: data.streetId ?? null,
      buildingNumber: data.buildingNumber ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      entranceLatitude: data.entranceLatitude ?? null,
      entranceLongitude: data.entranceLongitude ?? null,
      plusCode: data.plusCode ?? null,
      landmark: data.landmark ?? null,
      description: data.description ?? null,
      photoUrl: data.photoUrl ?? null,
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
}
