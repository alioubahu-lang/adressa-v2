import Link from "next/link";
import { Pencil, Eye, MapPin, QrCode } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AddressesToolbar } from "@/components/dashboard/AddressesToolbar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Pagination } from "@/components/dashboard/Pagination";

export const dynamic = "force-dynamic";

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

type SearchParams = {
  queued?: string;
  q?: string;
  commune?: string;
  status?: string;
  page?: string;
};

const PAGE_SIZE = 15;

export default async function DashboardAddressesPage({ searchParams }: { searchParams: SearchParams }) {
  const q = searchParams.q?.trim() || undefined;
  const communeId = searchParams.commune || undefined;
  const status = searchParams.status || undefined;
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  const where = {
    ...(communeId ? { communeId } : {}),
    ...(status ? { status: status as any } : {}),
    ...(q
      ? {
          OR: [
            { adresssaId: { contains: q, mode: "insensitive" as const } },
            { neighborhood: { name: { contains: q, mode: "insensitive" as const } } }
          ]
        }
      : {})
  };

  const [addresses, totalCount, communes]: [AddressRow[], number, { id: string; name: string }[]] = await Promise.all([
    prisma.address.findMany({
      where: {
        ...(communeId ? { communeId } : {}),
        ...(status ? { status: status as any } : {}),
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
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.address.count({ where }),
    prisma.commune.findMany({ orderBy: { name: "asc" } })
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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

      <AddressesToolbar communes={communes} />

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-adressa-light text-adressa-deep">
            <tr>
              <th className="whitespace-nowrap px-4 py-3">ID</th>
              <th className="px-4 py-3">Commune</th>
              <th className="px-4 py-3">Quartier</th>
              <th className="px-4 py-3">Rue</th>
              <th className="px-4 py-3">GPS</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Vérifiée</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((a) => (
              <tr key={a.id} className="border-t border-black/5">
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-adressa-green">{a.adresssaId}</td>
                <td className="px-4 py-3">{a.commune.name}</td>
                <td className="px-4 py-3">{a.neighborhood.name}</td>
                <td className="px-4 py-3">{a.street?.name ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                  {a.latitude.toFixed(5)}, {a.longitude.toFixed(5)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">{a.verified ? "✓" : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/addresses/${a.adresssaId}/edit`}
                      className="rounded-lg p-1.5 text-adressa-ink/60 hover:bg-adressa-light hover:text-adressa-deep"
                      title="Modifier"
                      aria-label={`Modifier ${a.adresssaId}`}
                    >
                      <Pencil size={16} />
                    </Link>
                    <Link
                      href={`/a/${a.adresssaId}`}
                      className="rounded-lg p-1.5 text-adressa-ink/60 hover:bg-adressa-light hover:text-adressa-deep"
                      title="Voir la fiche publique"
                      aria-label={`Voir ${a.adresssaId}`}
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      href={`/map?id=${a.adresssaId}`}
                      className="rounded-lg p-1.5 text-adressa-ink/60 hover:bg-adressa-light hover:text-adressa-deep"
                      title="Voir sur la carte"
                      aria-label={`Voir ${a.adresssaId} sur la carte`}
                    >
                      <MapPin size={16} />
                    </Link>
                    <Link
                      href={`/dashboard/qr?id=${a.adresssaId}`}
                      className="rounded-lg p-1.5 text-adressa-ink/60 hover:bg-adressa-light hover:text-adressa-deep"
                      title="QR code"
                      aria-label={`QR code de ${a.adresssaId}`}
                    >
                      <QrCode size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {addresses.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-adressa-ink/40">
                  Aucune adresse ne correspond à ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} />
      </div>
    </div>
  );
}
