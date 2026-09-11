import Link from "next/link";

export type RecentAddressRow = {
  adresssaId: string;
  neighborhood: string;
  landmark: string | null;
  status: string;
  lastScanAt: string | null; // ISO ou null
};

const statusStyles: Record<string, string> = {
  PUBLIE: "bg-green-100 text-green-700",
  VERIFIE: "bg-green-100 text-green-700",
  A_VERIFIER: "bg-orange-100 text-orange-700",
  COLLECTE: "bg-sky-100 text-sky-700",
  BROUILLON: "bg-gray-100 text-gray-600"
};

function formatRelativeDate(iso: string | null) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "à l'instant";
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  return `il y a ${diffJ} j`;
}

export function RecentActivityTable({ rows }: { rows: RecentAddressRow[] }) {
  return (
    <div className="card overflow-x-auto p-0">
      <div className="flex items-center justify-between border-b border-black/5 p-4">
        <h2 className="text-sm font-bold text-adressa-deep">Activité récente</h2>
        <Link href="/dashboard/addresses" className="text-xs font-semibold text-adressa-green underline">
          Voir toutes les adresses
        </Link>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-adressa-light text-adressa-deep">
          <tr>
            <th className="px-4 py-3">Code ADRESSA</th>
            <th className="px-4 py-3">Quartier</th>
            <th className="px-4 py-3">Repère</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Dernier scan</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.adresssaId} className="border-t border-black/5">
              <td className="px-4 py-3 font-semibold text-adressa-green">{r.adresssaId}</td>
              <td className="px-4 py-3">{r.neighborhood}</td>
              <td className="px-4 py-3 text-adressa-ink/60">{r.landmark ?? "—"}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-adressa-ink/60">{formatRelativeDate(r.lastScanAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link href={`/a/${r.adresssaId}`} className="text-adressa-green underline">
                    Voir
                  </Link>
                  <Link href={`/dashboard/addresses/${r.adresssaId}/edit`} className="text-adressa-green underline">
                    Éditer
                  </Link>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-adressa-ink/40">
                Aucune adresse pour l&apos;instant.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
