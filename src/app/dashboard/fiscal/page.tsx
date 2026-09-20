import { Building2, CheckCircle2, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FiscalTable, type FiscalRow } from "@/components/dashboard/FiscalTable";

export const dynamic = "force-dynamic";

type AddressWithTaxHistory = {
  id: string;
  adresssaId: string;
  status: string;
  taxStatus: string;
  neighborhood: { name: string };
  commune: { name: string };
  history: { createdAt: Date; user: { name: string } | null }[];
};

export default async function FiscalDashboardPage() {
  const [total, verified, activeQr, imposees, impayees, exonerees, nonRenseignees, addresses]: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    AddressWithTaxHistory[]
  ] = await Promise.all([
    prisma.address.count(),
    prisma.address.count({ where: { verified: true } }),
    prisma.qrCode.count({ where: { active: true } }),
    prisma.address.count({ where: { taxStatus: "IMPOSE" } }),
    prisma.address.count({ where: { taxStatus: "IMPAYE" } }),
    prisma.address.count({ where: { taxStatus: "EXONERE" } }),
    prisma.address.count({ where: { taxStatus: "NON_RENSEIGNE" } }),
    prisma.address.findMany({
      include: {
        commune: true,
        neighborhood: true,
        history: {
          where: { action: "MODIFICATION_TAXSTATUS" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })
  ]);

  const coverageRate = total > 0 ? Math.round((verified / total) * 100) : 0;
  const plaquesRate = total > 0 ? Math.round((activeQr / total) * 100) : 0;

  const rows: FiscalRow[] = addresses.map((a) => ({
    id: a.id,
    adresssaId: a.adresssaId,
    status: a.status,
    taxStatus: a.taxStatus,
    neighborhood: a.neighborhood,
    commune: a.commune,
    taxMeta: {
      lastModifiedAt: a.history[0]?.createdAt.toISOString() ?? null,
      lastModifiedBy: a.history[0]?.user?.name ?? null
    }
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-adressa-deep">Vue municipale — Sébikotane</h1>
          <p className="text-sm text-adressa-ink/60">
            Dashboard analytique et gestion fiscale, réservés aux comptes municipaux.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/api/export?format=csv" className="btn-secondary text-sm">
            Export CSV
          </a>
          <a href="/api/export?format=geojson" className="btn-secondary text-sm">
            Export GeoJSON
          </a>
        </div>
      </div>

      {/* Groupe 1 — Métriques globales */}
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">Métriques globales</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <KpiCard label="Bâtiments enregistrés" value={total} Icon={Building2} />
        <KpiCard label="Taux de couverture vérifiée" value={`${coverageRate}%`} Icon={CheckCircle2} tone="green" />
        <KpiCard label="Avancement pose des plaques" value={`${plaquesRate}%`} Icon={TrendingUp} />
      </div>

      {/* Groupe 2 — Métriques fiscales */}
      <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">Métriques fiscales</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card text-center">
          <div className="text-2xl font-black text-green-700">
            {imposees} <span className="text-base font-medium text-adressa-ink/40">/ {total}</span>
          </div>
          <div className="mt-1 text-xs text-adressa-ink/60">Imposées</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-black text-red-700">
            {impayees} <span className="text-base font-medium text-adressa-ink/40">/ {total}</span>
          </div>
          <div className="mt-1 text-xs text-adressa-ink/60">Impayées</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-black text-sky-700">
            {exonerees} <span className="text-base font-medium text-adressa-ink/40">/ {total}</span>
          </div>
          <div className="mt-1 text-xs text-adressa-ink/60">Exonérées</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-black text-amber-700">
            {nonRenseignees} <span className="text-base font-medium text-adressa-ink/40">/ {total}</span>
          </div>
          <div className="mt-1 text-xs text-adressa-ink/60">Non renseignées</div>
          {nonRenseignees > 0 && (
            <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              À renseigner
            </span>
          )}
        </div>
      </div>

      <div className="mt-6">
        <FiscalTable rows={rows} />
      </div>
    </div>
  );
}
