import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats — KPI pour le dashboard
export async function GET() {
  const [total, verified, pending, communesCovered, activeQr, scans30d] = await Promise.all([
    prisma.address.count(),
    prisma.address.count({ where: { verified: true } }),
    prisma.address.count({ where: { verified: false } }),
    prisma.address.groupBy({ by: ["communeId"] }).then((r: unknown[]) => r.length),
    prisma.qrCode.count({ where: { active: true } }),
    prisma.scan.count({ where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } })
  ]);

  const byStatus = await prisma.address.groupBy({ by: ["status"], _count: true });

  return NextResponse.json({
    totalAddresses: total,
    verifiedAddresses: verified,
    pendingAddresses: pending,
    communesCovered,
    activeQrCodes: activeQr,
    scansLast30Days: scans30d,
    byStatus: byStatus.map((s: { status: string; _count: number }) => ({ status: s.status, count: s._count }))
  });
}
