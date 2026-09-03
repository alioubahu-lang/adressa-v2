import Link from "next/link";
import { prisma } from "@/lib/prisma";

type AddressRow = {
  id: string;
  adresssaId: string;
  latitude: number;
  longitude: number;
  status: string;
  verified: boolean;
  commune: { name: string };
  neighborhood: { name: string };
  street: { name: string } | null;
};

export default async function DashboardAddressesPage({ searchParams }: { searchParams: { queued?: string } }) {
  const addresses: AddressRow[] = await prisma.address.findMany({
    include: { commune: true, neighborhood: true, street: true, qrCode: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div>
      {searchParams.queued && (
        <div className="mb-4 rounded-lg bg-adressa-light px-4 py-3 text-sm text-adressa-deep">
          📥 Adresse enregistrée localement — elle sera envoyée automatiquement dès le retour de connexion.
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-adressa-deep">Adresses</h1>
        <Link href="/dashboard/addresses/new" className="btn-primary">
          + Nouvelle adresse
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-adressa-light text-adressa-deep">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Commune</th>
              <th className="px-4 py-3">Quartier</th>
              <th className="px-4 py-3">Rue</th>
              <th className="px-4 py-3">GPS</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Vérifiée</th>
              <th className="px-4 py-3">QR</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((a) => (
              <tr key={a.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-semibold text-adressa-green">{a.adresssaId}</td>
                <td className="px-4 py-3">{a.commune.name}</td>
                <td className="px-4 py-3">{a.neighborhood.name}</td>
                <td className="px-4 py-3">{a.street?.name ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {a.latitude.toFixed(5)}, {a.longitude.toFixed(5)}
                </td>
                <td className="px-4 py-3">{a.status}</td>
                <td className="px-4 py-3">{a.verified ? "✓" : "—"}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/qr?id=${a.adresssaId}`} className="text-adressa-green underline">
                    QR
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/a/${a.adresssaId}`} className="text-adressa-green underline">
                      Voir
                    </Link>
                    <Link href={`/map?id=${a.adresssaId}`} className="text-adressa-green underline">
                      Carte
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
