import { Building2, CheckCircle2, Landmark, ShieldCheck, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FiscalTable, type FiscalRow } from "@/components/dashboard/FiscalTable";
import { MunicipalLiveWidgets } from "@/components/dashboard/MunicipalLiveWidgets";

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

export default async function FiscalDashboardPage({
  searchParams
}: {
  searchParams?: { communeId?: string };
}) {
  const communes = await prisma.commune.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, code: true } });
  const defaultCommune = communes.find((commune) => commune.code === "SBK" || commune.name.toLocaleLowerCase("fr-FR") === "sébikotane") ?? communes[0];
  const requestedCommune = communes.find((commune) => commune.id === searchParams?.communeId);
  const activeCommune = requestedCommune ?? defaultCommune;
  const addressWhere = activeCommune ? { communeId: activeCommune.id } : {};

  const [total, verified, activeQr, imposees, impayees, exonerees, nonRenseignees, addresses]: [
    number, number, number, number, number, number, number, AddressWithTaxHistory[]
  ] = await Promise.all([
    prisma.address.count({ where: addressWhere }),
    prisma.address.count({ where: { ...addressWhere, verified: true } }),
    prisma.qrCode.count({ where: { active: true, address: addressWhere } }),
    prisma.address.count({ where: { ...addressWhere, taxStatus: "IMPOSE" } }),
    prisma.address.count({ where: { ...addressWhere, taxStatus: "IMPAYE" } }),
    prisma.address.count({ where: { ...addressWhere, taxStatus: "EXONERE" } }),
    prisma.address.count({ where: { ...addressWhere, taxStatus: "NON_RENSEIGNE" } }),
    prisma.address.findMany({
      where: addressWhere,
      include: {
        commune: true,
        neighborhood: true,
        history: {
          where: { action: "MODIFICATION_TAXSTATUS" }, orderBy: { createdAt: "desc" }, take: 1,
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" }, take: 50
    })
  ]);

  const coverageRate = total > 0 ? Math.round((verified / total) * 100) : 0;
  const plaquesRate = total > 0 ? Math.round((activeQr / total) * 100) : 0;
  const rows: FiscalRow[] = addresses.map((address) => ({
    id: address.id,
    adresssaId: address.adresssaId,
    status: address.status,
    taxStatus: address.taxStatus,
    neighborhood: address.neighborhood,
    commune: address.commune,
    taxMeta: {
      lastModifiedAt: address.history[0]?.createdAt.toISOString() ?? null,
      lastModifiedBy: address.history[0]?.user?.name ?? null
    }
  }));
  const activeCommuneName = activeCommune?.name ?? "Aucune commune configurée";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-700/20 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 px-5 py-5 text-white shadow-sm sm:px-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full border-[26px] border-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden size-12 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 sm:grid"><Landmark size={24} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Espace institutionnel · ADRESSA</p>
              <h1 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Vue municipale</h1>
              <p className="mt-1 text-sm text-emerald-50/80">Pilotage de l’adressage, des plaques et de la fiscalité locale.</p>
            </div>
          </div>
          <form method="get" className="flex w-full items-center gap-2 sm:w-auto">
            <label htmlFor="active-commune" className="sr-only">Choisir la commune active</label>
            <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 sm:flex-none">
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-200 opacity-70" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-200" />
              </span>
              <select id="active-commune" name="communeId" defaultValue={activeCommune?.id ?? ""} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none sm:min-w-[145px] [&>option]:text-slate-900">
                {communes.map((commune) => <option key={commune.id} value={commune.id}>{commune.name.toLocaleUpperCase("fr-FR")}</option>)}
              </select>
            </div>
            <button type="submit" className="min-h-11 rounded-xl bg-white px-3.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50">Afficher</button>
          </form>
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/80 py-3 text-emerald-950" aria-label="Messages institutionnels ADRESSA">
        <div className="municipal-marquee flex w-max items-center gap-10 whitespace-nowrap px-4 text-sm font-semibold" aria-hidden="true">
          <span>🌿 Bienvenue à la Mairie de {activeCommuneName} — Système d’adressage numérique et géolocalisé ADRESSA.</span>
          <span>🏛️ Suivi en temps réel du déploiement des plaques QR Codes et de la voirie municipale.</span>
          <span>🚀 Ensemble pour la modernisation et l’attractivité de notre territoire.</span>
          <span>🌿 Bienvenue à la Mairie de {activeCommuneName} — Système d’adressage numérique et géolocalisé ADRESSA.</span>
          <span>🏛️ Suivi en temps réel du déploiement des plaques QR Codes et de la voirie municipale.</span>
          <span>🚀 Ensemble pour la modernisation et l’attractivité de notre territoire.</span>
        </div>
      </div>

      <MunicipalLiveWidgets commune={activeCommuneName} />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Building2 size={17} className="text-emerald-700" />
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-adressa-ink/55">Métriques globales · {activeCommuneName}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Bâtiments enregistrés" value={total} Icon={Building2} />
          <KpiCard label="Taux de couverture vérifiée" value={`${coverageRate}%`} Icon={CheckCircle2} tone="green" />
          <KpiCard label="Avancement pose des plaques" value={`${plaquesRate}%`} Icon={TrendingUp} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={17} className="text-emerald-700" />
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-adressa-ink/55">Métriques fiscales · {activeCommuneName}</h2>
        </div>
        <FiscalTable rows={rows} initialTaxCounts={{ IMPOSE: imposees, IMPAYE: impayees, EXONERE: exonerees, NON_RENSEIGNE: nonRenseignees }} />
      </section>
    </div>
  );
}
