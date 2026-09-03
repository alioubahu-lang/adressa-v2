import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const [total, verified, pending, communesCovered, activeQr, scans30d] = await Promise.all([
    prisma.address.count(),
    prisma.address.count({ where: { verified: true } }),
    prisma.address.count({ where: { verified: false } }),
    prisma.address.groupBy({ by: ["communeId"] }).then((r: unknown[]) => r.length),
    prisma.qrCode.count({ where: { active: true } }),
    prisma.scan.count({ where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } })
  ]);
  return { total, verified, pending, communesCovered, activeQr, scans30d };
}

export default async function DashboardOverviewPage() {
  const stats = await getStats();

  const kpis = [
    { label: "Total adresses", value: stats.total },
    { label: "Adresses vérifiées", value: stats.verified },
    { label: "Adresses en attente", value: stats.pending },
    { label: "Communes couvertes", value: stats.communesCovered },
    { label: "QR codes actifs", value: stats.activeQr },
    { label: "Scans (30j)", value: stats.scans30d }
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-adressa-deep">Vue générale</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="card">
            <div className="text-3xl font-black text-adressa-deep">{k.value}</div>
            <div className="mt-1 text-xs text-adressa-ink/60">{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
