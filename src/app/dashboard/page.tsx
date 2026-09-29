import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { MapPin, CheckCircle2, Clock, Building2, QrCode, ScanLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getDefaultDashboardView } from "@/lib/permissions";
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
  commune: { name: string };
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

async function getDashboardData(requestedCommuneId?: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const communes = await prisma.commune.findMany({ orderBy: { name: "asc" } });
  const defaultCommuneId = communes.find((commune) => commune.code === "SBK" || commune.name === "Sébikotane")?.id ?? "all";
  const selectedCommuneId = requestedCommuneId && communes.some((commune) => commune.id === requestedCommuneId)
    ? requestedCommuneId
    : defaultCommuneId;
  const addressWhere = selectedCommuneId === "all" ? {} : { communeId: selectedCommuneId };

  const [
    total,
    verified,
    pending,
    communesCovered,
    activeQr,
    scans30d,
    createdThisMonth,
    scansLast30,
    addressesLast30,
    recentAddresses,
    mapAddressRecords
  ] = await Promise.all([
    prisma.address.count({ where: addressWhere }),
    prisma.address.count({ where: { ...addressWhere, verified: true } }),
    prisma.address.count({ where: { ...addressWhere, verified: false } }),
    prisma.address.groupBy({ by: ["communeId"], where: addressWhere }).then((r: unknown[]) => r.length),
    prisma.qrCode.count({ where: { active: true, address: addressWhere } }),
    prisma.scan.count({ where: { date: { gte: thirtyDaysAgo }, address: addressWhere } }),
    prisma.address.count({ where: { ...addressWhere, createdAt: { gte: startOfMonth } } }),
    prisma.scan.findMany({ where: { date: { gte: thirtyDaysAgo }, address: addressWhere }, select: { date: true } }),
    prisma.address.findMany({ where: { ...addressWhere, createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.address.findMany({
      where: addressWhere,
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        commune: true,
        neighborhood: true,
        scans: { orderBy: { date: "desc" }, take: 1, select: { date: true } }
      }
    }) as Promise<RecentAddressWithScan[]>,
    prisma.address.findMany({
      where: addressWhere,
      orderBy: { createdAt: "desc" },
      select: {
        adresssaId: true,
        latitude: true,
        longitude: true,
        landmark: true,
        verified: true,
        createdAt: true,
        commune: { select: { name: true } },
        neighborhood: { select: { name: true } }
      }
    })
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

  const mapAddresses: DashboardAddress[] = mapAddressRecords.map((a) => ({
    adresssaId: a.adresssaId,
    latitude: a.latitude,
    longitude: a.longitude,
    commune: a.commune.name,
    neighborhood: a.neighborhood.name,
    landmark: a.landmark,
    verified: a.verified,
    createdAt: a.createdAt.toISOString()
  }));

  const recentRows: RecentAddressRow[] = recentAddresses.map((a) => ({
    adresssaId: a.adresssaId,
    commune: a.commune.name,
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
    selectedCommuneId,
    dayBuckets,
    mapAddresses,
    recentRows
  };
}

export default async function DashboardOverviewPage({ searchParams }: { searchParams?: { commune?: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  // Un Municipal_Admin ou un Logistics_Partner est redirigé vers sa vue dédiée.
  // Le SUPER_ADMIN reste sur la vue opérationnelle complète par défaut.
  if (role !== "SUPER_ADMIN") {
    const defaultView = getDefaultDashboardView(role);
    if (defaultView === "municipal") redirect("/dashboard/fiscal");
    if (defaultView === "logistics") redirect("/dashboard/logistics");
  }

  const stats = await getDashboardData(searchParams?.commune);
  const verifiedPct = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-adressa-deep">Vue générale</h1>
      </div>

      <QuickActionsBar communes={stats.communes} selectedCommuneId={stats.selectedCommuneId} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6 xl:gap-5">
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
