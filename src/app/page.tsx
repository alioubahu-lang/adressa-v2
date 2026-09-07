import Link from "next/link";

const usages = [
  "Livraison",
  "E-commerce",
  "Transport",
  "Immobilier",
  "Banques",
  "Assurances",
  "Télécommunications",
  "Services à domicile"
];

export const metadata = { title: "Pour les entreprises" };

export default function EntreprisesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="text-sm text-adressa-green">← Retour</Link>
      <h1 className="mt-4 text-3xl font-black text-adressa-deep">ADRESSA pour les entreprises</h1>
      <p className="mt-4 text-adressa-ink/70">
        Une adresse fiable, vérifiée et géolocalisée pour chaque client, connectée à votre système via l&apos;API
        ADRESSA.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {usages.map((u) => (
          <div key={u} className="card">
            <h3 className="font-semibold text-adressa-deep">{u}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}
