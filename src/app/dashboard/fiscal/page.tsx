import { Building2, CheckCircle2, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TaxStatusSelect } from "@/components/dashboard/TaxStatusSelect";

export const dynamic = "force-dynamic";

type FiscalAddressRow = {
  id: string;
  adresssaId: string;
  status: string;
  taxStatus: string;
  neighborhood: { name: string };
  commune: { name: string };
};

export default async function FiscalDashboardPage() {
  const [total, verified, activeQr, imposees, impayees, exonerees, addresses]: [
    number,
    number,
    number,
    number,
    number,
    number,
    FiscalAddressRow[]
  ] = await Promise.all([
    prisma.address.count(),
    prisma.address.count({ where: { verified: true } }),
    prisma.qrCode.count({ where: { active: true } }),
    prisma.address.count({ where: { taxStatus: "IMPOSE" } }),
    prisma.address.count({ where: { taxStatus: "IMPAYE" } }),
    prisma.address.count({ where: { taxStatus: "EXONERE" } }),
    prisma.address.findMany({
      include: { commune: true, neighborhood: true },
      orderBy: { createdAt: "desc" },
      take: 50
    })
  ]);

  const coverageRate = total > 0 ? Math.round((verified / total) * 100) : 0;
  const plaquesRate = total > 0 ? Math.round((activeQr / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
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

      <div className="mb-6" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <KpiCard label="Bâtiments enregistrés" value={total} Icon={Building2} />
        <KpiCard label="Taux de couverture vérifiée" value={`${coverageRate}%`} Icon={CheckCircle2} tone="green" />
        <KpiCard label="Avancement pose des plaques" value={`${plaquesRate}%`} Icon={TrendingUp} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-black text-green-700">{imposees}</div>
          <div className="mt-1 text-xs text-adressa-ink/60">Imposées</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-black text-red-700">{impayees}</div>
          <div className="mt-1 text-xs text-adressa-ink/60">Impayées</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-black text-sky-700">{exonerees}</div>
          <div className="mt-1 text-xs text-adressa-ink/60">Exonérées</div>
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto p-0">
        <div className="border-b border-black/5 p-4">
          <h2 className="text-sm font-bold text-adressa-deep">Recouvrement par adresse</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-adressa-light text-adressa-deep">
            <tr>
              <th className="px-4 py-3">ID ADRESSA</th>
              <th className="px-4 py-3">Commune</th>
              <th className="px-4 py-3">Quartier</th>
              <th className="px-4 py-3">Statut adresse</th>
              <th className="px-4 py-3">Statut fiscal</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((a) => (
              <tr key={a.id} className="border-t border-black/5">
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-adressa-green">{a.adresssaId}</td>
                <td className="px-4 py-3">{a.commune.name}</td>
                <td className="px-4 py-3">{a.neighborhood.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <TaxStatusSelect adresssaId={a.adresssaId} initialValue={a.taxStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-adressa-ink/40">
        Le statut fiscal est renseigné manuellement par les services municipaux — ADRESSA n&apos;a pas accès à
        votre système de recouvrement et n&apos;émet aucun avis d&apos;imposition.
      </p>
    </div>
  );
}
