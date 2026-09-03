import Link from "next/link";

type AddressCardProps = {
  adresssaId: string;
  communeName: string;
  neighborhoodName: string;
  plusCode?: string | null;
};

export function AddressCard({ adresssaId, communeName, neighborhoodName, plusCode }: AddressCardProps) {
  return (
    <article className="card">
      <div className="mb-2 inline-block rounded-lg bg-adressa-light px-2 py-1 text-sm font-bold text-adressa-green">
        {adresssaId}
      </div>
      <h3 className="font-semibold text-adressa-deep">{communeName}</h3>
      <p className="text-sm text-adressa-ink/60">{neighborhoodName}</p>
      {plusCode && <p className="mt-1 text-xs text-adressa-ink/40">Plus Code : {plusCode}</p>}
      <Link href={`/a/${adresssaId}`} className="btn-primary mt-4 w-full text-sm">
        Voir
      </Link>
    </article>
  );
}
