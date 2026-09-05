import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getAddress(id: string) {
  return prisma.address.findUnique({
    where: { adresssaId: id.toUpperCase() },
    include: { commune: true, neighborhood: true, street: true, qrCode: true }
  });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const address = await getAddress(params.id);
  if (!address) return { title: "Adresse introuvable" };
  return {
    title: `${address.adresssaId} | ${address.commune.name}`,
    description: `Adresse numérique vérifiée ADRESSA à ${address.commune.name}, ${address.neighborhood.name}.`,
    openGraph: {
      title: `ADRESSA — ${address.adresssaId}`,
      description: `${address.commune.name}, ${address.neighborhood.name}`,
      images: address.photoUrl ? [address.photoUrl] : undefined
    }
  };
}

export default async function PublicAddressPage({ params }: { params: { id: string } }) {
  const address = await getAddress(params.id);
  if (!address) notFound();

  // Enregistrement d'un scan minimal, sans donnée personnelle
  if (address.qrCode) {
    const h = headers();
    await prisma.scan.create({
      data: {
        qrCodeId: address.qrCode.id,
        addressId: address.id,
        device: h.get("user-agent")?.slice(0, 120) ?? null,
        referrer: h.get("referer")?.slice(0, 200) ?? null
      }
    });
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`;
  const shareText = encodeURIComponent(`ADRESSA ${address.adresssaId} — ${mapsUrl}`);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-white pb-16">
      <header className="bg-adressa-deep px-6 py-8 text-white">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon-512.png" alt="ADRESSA" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-black tracking-widest">ADRESSA</span>
        </div>
        {address.verified && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            ✓ Adresse vérifiée
          </div>
        )}
      </header>

      <section className="px-6 py-6">
        <div className="id-badge mb-2 inline-block rounded-lg bg-adressa-light px-3 py-1 text-lg font-bold text-adressa-green">
          {address.adresssaId}
        </div>
        <h1 className="text-2xl font-bold text-adressa-deep">{address.commune.name}</h1>
        <p className="text-adressa-ink/60">{address.neighborhood.name}</p>

        {address.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={address.photoUrl}
            alt={`Bâtiment ${address.adresssaId}`}
            className="mt-4 aspect-video w-full rounded-xl2 object-cover"
          />
        ) : (
          <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-xl2 bg-adressa-gray text-sm text-adressa-ink/40">
            Photo non disponible
          </div>
        )}

        {address.landmark && (
          <p className="mt-4 text-sm text-adressa-ink/70">
            <span className="font-semibold text-adressa-ink">Repère : </span>
            {address.landmark}
          </p>
        )}

        <div className="mt-4 rounded-xl bg-adressa-gray p-4 font-mono text-sm">
          <div>
            Localisation : {address.latitude.toFixed(7)}, {address.longitude.toFixed(7)}
          </div>
          {address.plusCode && <div className="mt-1">Plus Code : {address.plusCode}</div>}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1">
            🗺️ Voir sur la carte
          </a>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1">
            🚗 Itinéraire
          </a>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex-1"
          >
            💬 WhatsApp
          </a>
          <button className="btn-secondary flex-1" data-share-url={mapsUrl}>
            🔗 Partager
          </button>
        </div>

        <a href="#urgence" className="mt-4 block text-center text-sm font-semibold text-red-600">
          ⚠️ URGENCE — Voir la localisation
        </a>

        <p className="mt-8 text-center text-xs text-adressa-ink/40">
          Cette adresse est identifiée par ADRESSA.
        </p>

        <div className="mt-2 text-center">
          <a href={`mailto:?subject=Signaler une erreur ${address.adresssaId}`} className="text-xs text-adressa-ink/40 underline">
            Signaler une erreur
          </a>
        </div>
      </section>
    </main>
  );
}
