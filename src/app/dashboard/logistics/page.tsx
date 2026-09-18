import { prisma } from "@/lib/prisma";
import { RouteSearch } from "@/components/dashboard/RouteSearch";

export const dynamic = "force-dynamic";

type RecentScan = {
  id: string;
  date: Date;
  device: string | null;
  address: { adresssaId: string; neighborhood: { name: string } };
};

export default async function LogisticsDashboardPage() {
  const recentScans: RecentScan[] = await prisma.scan.findMany({
    orderBy: { date: "desc" },
    take: 20,
    include: { address: { include: { neighborhood: true } } }
  });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-adressa-deep">Espace partenaire logistique</h1>
      <p className="mb-6 text-sm text-adressa-ink/60">
        Recherchez une adresse, obtenez un itinéraire, et consultez l&apos;historique des requêtes.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RouteSearch />

          <div className="card mt-6">
            <h2 className="mb-2 text-sm font-bold text-adressa-deep">Suivi des livraisons en cours</h2>
            <p className="text-sm text-adressa-ink/50">
              Fonctionnalité à venir — ADRESSA ne dispose pas encore d&apos;un système de suivi de commandes/livraisons.
              Contactez notre équipe si vous souhaitez être partenaire pilote pour ce module.
            </p>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h2 className="mb-3 text-sm font-bold text-adressa-deep">Historique des requêtes d&apos;adresses</h2>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {recentScans.map((s) => (
                <div key={s.id} className="rounded-lg bg-adressa-gray p-2 text-xs">
                  <div className="font-semibold text-adressa-green">{s.address.adresssaId}</div>
                  <div className="text-adressa-ink/60">
                    {s.address.neighborhood.name} · {new Date(s.date).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
              {recentScans.length === 0 && <p className="text-xs text-adressa-ink/40">Aucune requête pour l&apos;instant.</p>}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-2 text-sm font-bold text-adressa-deep">Clés API & intégration</h2>
            <p className="text-sm text-adressa-ink/50">
              L&apos;accès API programmatique n&apos;est pas encore ouvert en libre-service. Faites une demande
              d&apos;intégration et notre équipe vous accompagne.
            </p>
            <a href="/entreprises#secteurs" className="btn-secondary mt-3 inline-block text-sm">
              Demander un accès
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
