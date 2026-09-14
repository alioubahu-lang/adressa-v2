import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type ExportAddress = {
  adresssaId: string;
  latitude: number;
  longitude: number;
  plusCode: string | null;
  landmark: string | null;
  buildingType: string | null;
  status: string;
  verified: boolean;
  createdAt: Date;
  commune: { name: string };
  neighborhood: { name: string };
  street: { name: string } | null;
};

// GET /api/export?format=csv|geojson&communeId=...
// Réservé aux utilisateurs connectés au dashboard.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") === "geojson" ? "geojson" : "csv";
  const communeId = searchParams.get("communeId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const addresses: ExportAddress[] = await prisma.address.findMany({
    where: {
      ...(communeId ? { communeId } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { adresssaId: { contains: q, mode: "insensitive" as const } },
              { neighborhood: { name: { contains: q, mode: "insensitive" as const } } }
            ]
          }
        : {})
    },
    include: { commune: true, neighborhood: true, street: true },
    orderBy: { createdAt: "desc" }
  });

  if (format === "geojson") {
    const geojson = {
      type: "FeatureCollection",
      features: addresses.map((a) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [a.longitude, a.latitude] },
        properties: {
          adresssaId: a.adresssaId,
          commune: a.commune.name,
          quartier: a.neighborhood.name,
          rue: a.street?.name ?? null,
          landmark: a.landmark,
          plusCode: a.plusCode,
          buildingType: a.buildingType,
          status: a.status,
          verified: a.verified,
          createdAt: a.createdAt
        }
      }))
    };
    return new NextResponse(JSON.stringify(geojson, null, 2), {
      headers: {
        "Content-Type": "application/geo+json",
        "Content-Disposition": `attachment; filename="adressa-export-${Date.now()}.geojson"`
      }
    });
  }

  const headers = [
    "adresssaId",
    "commune",
    "quartier",
    "rue",
    "latitude",
    "longitude",
    "plusCode",
    "landmark",
    "buildingType",
    "status",
    "verified",
    "createdAt"
  ];
  const escapeCsv = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const rows = addresses.map((a) =>
    [
      a.adresssaId,
      a.commune.name,
      a.neighborhood.name,
      a.street?.name ?? "",
      a.latitude,
      a.longitude,
      a.plusCode ?? "",
      a.landmark ?? "",
      a.buildingType ?? "",
      a.status,
      a.verified ? "oui" : "non",
      a.createdAt.toISOString()
    ]
      .map(escapeCsv)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="adressa-export-${Date.now()}.csv"`
    }
  });
}
