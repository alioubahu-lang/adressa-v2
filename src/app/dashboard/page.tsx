import nextDynamic from "next/dynamic";
import { MapPin, CheckCircle2, Clock, Building2, QrCode, ScanLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuickActionsBar } from "@/components/dashboard/QuickActionsBar";
import { ActivityChart, type DailyPoint } from "@/components/dashboard/ActivityChart";
import { RecentActivityTable, type RecentAddressRow } from "@/components/dashboard/RecentActivityTable";
import type { DashboardAddress } from "@/components/dashboard/TerritoryMapPanel";

const TerritoryMapPanel = nextDynamic(
  () => import("@/components/dashboard/TerritoryMapPanel").then((m) => m.TerritoryMapPanel),
  { ssr: false }
);

export const dynamic = "force-dynamic";

type RecentAddressWithScan = {
  adresssaId: string;
  latitude: number;
  longitude: number;
  landmark: string | null;
  status: string;
  verified: boolean;
  createdAt: Date;
  neighborhood: { name: string };
  scans: { date: Date }[];
};

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

async function getDashboardData() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    total,
    verified,
    pending,
    communesCovered,
    activeQr,
    scans30d,
    createdThisMonth,
    communes,
    scansLast30,
    addressesLast30,
    recentAddresses
  ] = await Promise.all([
    prisma.address.count(),
    prisma.address.count({ where: { verified: true } }),
    prisma.address.count({ where: { verified: false } }),
    prisma.address.groupBy({ by: ["communeId"] }).then((r: unknown[]) => r.length),
    prisma.qrCode.count({ where: { active: true } }),
    prisma.scan.count({ where: { date: { gte: thirtyDaysAgo } } }),
    prisma.address.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.commune.findMany({ orderBy: { name: "asc" } }),
    prisma.scan.findMany({ where: { date: { gte: thirtyDaysAgo } }, select: { date: true } }),
    prisma.address.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.address.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        neighborhood: true,
        scans: { orderBy: { date: "desc" }, take: 1, select: { date: true } }
      }
    }) as Promise<RecentAddressWithScan[]>
  ]);

  // Construction des points journaliers pour le graphique (30 derniers jours)
  const referenceStart = startOfDay(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  const dayBuckets: DailyPoint[] = [];
  for (let i = 0; i < 30; i++) {
    const day = new Date(referenceStart.getTime() + i * 24 * 60 * 60 * 1000);
    dayBuckets.push({ date: formatDayLabel(day), scans: 0, creations: 0 });
  }
  const dayIndex = (date: Date) =>
    Math.floor((startOfDay(date).getTime() - referenceStart.getTime()) / (24 * 60 * 60 * 1000));

  for (const s of scansLast30) {
    const idx = dayIndex(s.date);
    if (idx >= 0 && idx < 30) dayBuckets[idx].scans += 1;
  }
  for (const a of addressesLast30) {
    const idx = dayIndex(a.createdAt);
    if (idx >= 0 && idx < 30) dayBuckets[idx].creations += 1;
  }

  const mapAddresses: DashboardAddress[] = recentAddresses.map((a) => ({
    adresssaId: a.adresssaId,
    latitude: a.latitude,
    longitude: a.longitude,
    commune: "",
    neighborhood: a.neighborhood.name,
    verified: a.verified,
    createdAt: a.createdAt.toISOString()
  }));

  const recentRows: RecentAddressRow[] = recentAddresses.map((a) => ({
    adresssaId: a.adresssaId,
    neighborhood: a.neighborhood.name,
    landmark: a.landmark,
    status: a.status,
    lastScanAt: a.scans[0]?.date ? a.scans[0].date.toISOString() : null
  }));

  return {
    total,
    verified,
    pending,
    communesCovered,
    activeQr,
    scans30d,
    createdThisMonth,
    communes,
    dayBuckets,
    mapAddresses,
    recentRows
  };
}

export default async function DashboardOverviewPage() {
  const stats = await getDashboardData();
  const verifiedPct = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-adressa-deep">Vue générale</h1>
      </div>

      <QuickActionsBar communes={stats.communes} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total adresses" value={stats.total} Icon={MapPin} trend={`+${stats.createdThisMonth} ce mois`} />
        <KpiCard
          label="Adresses vérifiées"
          value={stats.verified}
          Icon={CheckCircle2}
          trend={`${verifiedPct}% vérifié`}
          tone="green"
        />
        <KpiCard label="Adresses en attente" value={stats.pending} Icon={Clock} tone="orange" />
        <KpiCard label="Communes couvertes" value={stats.communesCovered} Icon={Building2} />
        <KpiCard label="QR codes actifs" value={stats.activeQr} Icon={QrCode} />
        <KpiCard label="Scans (30j)" value={stats.scans30d} Icon={ScanLine} />
      </div>

      {/* Grille principale : carte + graphique */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TerritoryMapPanel addresses={stats.mapAddresses} />
        </div>
        <div className="lg:col-span-1">
          <ActivityChart data={stats.dayBuckets} />
        </div>
      </div>

      {/* Activité récente */}
      <div className="mt-6">
        <RecentActivityTable rows={stats.recentRows} />
      </div>
    </div>
  );
}
