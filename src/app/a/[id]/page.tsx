import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { CopyButton } from "@/components/CopyButton";
import { ShareButton } from "@/components/ShareButton";

const SingleAddressMap = nextDynamic(() => import("@/components/SingleAddressMap"), { ssr: false });

async function getAddress(id: string) {
  return prisma.address.findUnique({
    where: { adresssaId: id.toUpperCase() },
    include: { commune: true, neighborhood: true, street: true, qrCode: true }
  });
}

function getOrigin() {
  const h = headers();
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const address = await getAddress(params.id);
  if (!address) return { title: "Adresse introuvable" };
  return {
    title: `ADRESSA ${address.adresssaId} — ${address.commune.name}, ${address.neighborhood.name}`,
    description: `Adresse numérique vérifiée ADRESSA — ${address.adresssaId}, ${address.commune.name}, ${address.neighborhood.name}. Localisation GPS, carte et itinéraire.`,
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

  const origin = getOrigin();
  const publicUrl = `${origin}/a/${address.adresssaId}`;
  const gpsText = `${address.latitude.toFixed(7)}, ${address.longitude.toFixed(7)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`;

  const whatsappMessage =
    `Voici l'adresse ADRESSA :\n\n${address.adresssaId}\n${address.commune.name} — ${address.neighborhood.name}\n\n` +
    `Voir l'adresse :\n${publicUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-adressa-gray pb-16">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/search" className="text-sm font-medium text-adressa-green hover:underline">
          ← Retour à la recherche
        </Link>

        <div className="mt-4 grid gap-8 md:grid-cols-3">
          {/* Colonne principale */}
          <div className="md:col-span-2">
            {address.verified && (
              <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-adressa-light px-3 py-1 text-xs font-semibold text-adressa-deep">
                ✓ Adresse vérifiée
              </div>
            )}

            <h1 className="text-3xl font-black text-adressa-deep">{address.adresssaId}</h1>
            <p className="mt-1 text-adressa-ink/70">
              📍 {address.commune.name} — {address.neighborhood.name}
            </p>
            <p className="mt-2 text-xs text-adressa-ink/50">
              Identifiant permanent — l&apos;identité numérique unique de ce bâtiment dans le système ADRESSA.{" "}
              <CopyButton value={address.adresssaId} label="Copier l'identifiant" copiedLabel="Identifiant copié !" />
            </p>

            {/* Photo */}
            {address.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={address.photoUrl}
                alt={`Photo du bâtiment ${address.adresssaId} à ${address.commune.name}, ${address.neighborhood.name}`}
                className="mt-6 aspect-video w-full rounded-xl2 object-cover shadow-sm"
              />
            ) : (
              <div className="mt-6 flex aspect-video w-full items-center justify-center rounded-xl2 bg-white text-sm text-adressa-ink/40">
                Photo non disponible
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <a href="#carte" className="btn-primary justify-center text-sm">
                📍 Voir sur la carte
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary justify-center text-sm"
              >
                🧭 Itinéraire
              </a>
              <ShareButton
                url={publicUrl}
                title={`ADRESSA — ${address.adresssaId}`}
                text={`${address.commune.name} — ${address.neighborhood.name}`}
                className="btn-secondary justify-center text-sm"
              />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary justify-center text-sm"
              >
                💬 WhatsApp
              </a>
            </div>

            {/* Informations de l'adresse */}
            <div className="card mt-6">
              <h2 className="mb-4 text-lg font-bold text-adressa-deep">Informations de l&apos;adresse</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">
                    🆔 Identifiant ADRESSA
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-adressa-deep">{address.adresssaId}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">🏠 Commune</dt>
                  <dd className="mt-1 text-sm text-adressa-ink">{address.commune.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">
                    📍 Quartier / Secteur
                  </dt>
                  <dd className="mt-1 text-sm text-adressa-ink">{address.neighborhood.name}</dd>
                </div>
                {address.landmark && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">📌 Repère</dt>
                    <dd className="mt-1 text-sm text-adressa-ink">{address.landmark}</dd>
                  </div>
                )}
                {address.plusCode && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">
                      🔢 Plus Code
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-adressa-ink">{address.plusCode}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">
                    🌍 Coordonnées GPS
                  </dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2 font-mono text-sm text-adressa-ink">
                    {gpsText}
                    <CopyButton value={gpsText} label="Copier les coordonnées" copiedLabel="Coordonnées copiées !" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/50">✓ Statut</dt>
                  <dd className="mt-1 text-sm text-adressa-ink">
                    {address.verified ? "Adresse vérifiée" : "Vérification en cours"}
                  </dd>
                </div>
              </dl>
            </div>

            {address.verified && (
              <div className="mt-6 rounded-xl bg-adressa-light p-4 text-sm">
                <p className="font-semibold text-adressa-deep">✓ Adresse vérifiée sur le terrain</p>
                <p className="mt-1 text-adressa-ink/70">
                  Cette adresse a été vérifiée et géolocalisée sur le terrain par ADRESSA.
                </p>
              </div>
            )}

            <div className="card mt-6">
              <h2 className="mb-2 text-lg font-bold text-adressa-deep">À propos du secteur</h2>
              <p className="text-sm text-adressa-ink/70">
                {address.neighborhood.name} — {address.commune.name}
                {address.landmark ? `, à proximité de ${address.landmark}` : ""}.
              </p>
            </div>

            {/* Carte interactive */}
            <div id="carte" className="mt-6 scroll-mt-24">
              <h2 className="mb-3 text-lg font-bold text-adressa-deep">Localisation sur la carte</h2>
              <div className="h-80 overflow-hidden rounded-xl2 border border-black/5 shadow-sm">
                <SingleAddressMap
                  latitude={address.latitude}
                  longitude={address.longitude}
                  label={address.adresssaId}
                  landmark={address.landmark}
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href={`mailto:?subject=Signaler une erreur ${address.adresssaId}`}
                className="text-xs text-adressa-ink/40 underline"
              >
                Signaler une erreur
              </a>
            </div>
          </div>

          {/* Colonne latérale : QR code */}
          <aside className="md:col-span-1">
            <div className="card sticky top-24 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr/${address.adresssaId}?format=png`}
                alt={`QR code ADRESSA de l'adresse ${address.adresssaId}`}
                className="mx-auto h-40 w-40"
              />
              <p className="mt-3 text-sm font-semibold text-adressa-deep">QR Code ADRESSA</p>
              <p className="mt-1 text-xs text-adressa-ink/60">Scannez pour accéder à cette adresse</p>
            </div>
          </aside>
        </div>

        <p className="mt-10 text-center text-xs text-adressa-ink/40">Cette adresse est identifiée par ADRESSA.</p>
      </div>
    </main>
  );
}
