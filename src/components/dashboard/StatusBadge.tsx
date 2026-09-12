const styles: Record<string, string> = {
  PUBLIE: "bg-green-100 text-green-700",
  VERIFIE: "bg-green-100 text-green-700",
  A_VERIFIER: "bg-orange-100 text-orange-700",
  COLLECTE: "bg-sky-100 text-sky-700",
  BROUILLON: "bg-gray-100 text-gray-600"
};

const labels: Record<string, string> = {
  PUBLIE: "Publié",
  VERIFIE: "Vérifié",
  A_VERIFIER: "En attente",
  COLLECTE: "Collecté",
  BROUILLON: "Brouillon"
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
