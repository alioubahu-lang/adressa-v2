import Link from "next/link";

const features = [
  "Adressage des quartiers",
  "Numérotation des bâtiments",
  "Cartographie",
  "Base de données",
  "QR codes",
  "Plaques",
  "Dashboard",
  "Statistiques"
];

export const metadata = { title: "Pour les collectivités" };

export default function CollectivitesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="text-sm text-adressa-green">← Retour</Link>
      <h1 className="mt-4 text-3xl font-black text-adressa-deep">ADRESSA pour les collectivités</h1>
      <p className="mt-4 text-adressa-ink/70">
        Un outil complet pour cartographier, vérifier et administrer l&apos;adressage de votre territoire.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f} className="card">
            <h3 className="font-semibold text-adressa-deep">{f}</h3>
          </div>
        ))}
      </div>
      <Link href="/municipality" className="btn-primary mt-8 inline-flex">
        Voir la vue municipale
      </Link>
    </main>
  );
}
