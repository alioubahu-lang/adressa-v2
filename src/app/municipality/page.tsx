import { prisma } from "@/lib/prisma";

export const metadata = { title: "Vue municipale" };
export const dynamic = "force-dynamic";

type CommuneRow = {
  id: string;
  name: string;
  addresses: { id: string; verified: boolean; neighborhoodId: string }[];
  neighborhoods: { id: string }[];
};

export default async function MunicipalityPage() {
  const communes: CommuneRow[] = await prisma.commune.findMany({
    include: {
      addresses: { select: { id: true, verified: true, neighborhoodId: true } },
      neighborhoods: true
    }
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-black text-adressa-deep">Vue municipale</h1>
      <p className="mt-2 text-adressa-ink/60">
        Suivi de la couverture d&apos;adressage par commune.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {communes.map((c) => {
          const total = c.addresses.length;
          const verified = c.addresses.filter((a: { verified: boolean }) => a.verified).length;
          return (
            <div key={c.id} className="card">
              <h2 className="text-lg font-bold text-adressa-deep">{c.name}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <dt className="text-adressa-ink/60">Adresses</dt>
                <dd className="font-semibold">{total}</dd>
                <dt className="text-adressa-ink/60">Vérifiées</dt>
                <dd className="font-semibold">{verified}</dd>
                <dt className="text-adressa-ink/60">Non vérifiées</dt>
                <dd className="font-semibold">{total - verified}</dd>
                <dt className="text-adressa-ink/60">Quartiers couverts</dt>
                <dd className="font-semibold">{c.neighborhoods.length}</dd>
              </dl>
            </div>
          );
        })}
      </div>
    </main>
  );
}
