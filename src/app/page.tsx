import Link from "next/link";
import Image from "next/image";
import nextDynamic from "next/dynamic";
import { HeroSearch } from "@/components/HeroSearch";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { FadeIn } from "@/components/FadeIn";
import { prisma } from "@/lib/prisma";

const MapView = nextDynamic(() => import("@/components/MapView"), { ssr: false });

export const dynamic = "force-dynamic";

const sections = [
  { icon: "🆔", title: "Comment ça marche", text: "Chaque bâtiment reçoit un identifiant unique, une position GPS précise et une page d'adresse numérique accessible par QR." },
  { icon: "🪧", title: "Une plaque physique", text: "Une plaque simple, posée sur le bâtiment, portant l'identifiant ADRESSA et un QR code dynamique." },
  { icon: "🧾", title: "Une identité numérique", text: "Derrière chaque plaque, une fiche vérifiée : GPS, quartier, repère, photo, historique." },
  { icon: "🎯", title: "GPS précis", text: "ADRESSA ROUTE guide jusqu'à l'entrée exacte du bâtiment, pas seulement jusqu'au quartier." },
  { icon: "📲", title: "QR dynamique", text: "Le QR pointe vers ADRESSA, jamais directement vers une carte figée. La destination peut évoluer sans changer la plaque." },
  { icon: "🧭", title: "ADRESSA ROUTE", text: "Point d'entrée, repère et itinéraire précis pour ne plus jamais se perdre." },
  { icon: "👤", title: "Pour les citoyens", text: "Recevoir des colis, donner rendez-vous, partager sa position en un lien." },
  { icon: "🚚", title: "Pour les entreprises", text: "Livraison, e-commerce, transport : une adresse fiable pour chaque client." },
  { icon: "🏛️", title: "Pour les collectivités", text: "Un dashboard complet pour cartographier, vérifier et administrer le territoire." },
  { icon: "🌍", title: "Vision Afrique", text: "Du Sénégal à l'Afrique de l'Ouest : une infrastructure d'identité géographique panafricaine." }
];

export default async function HomePage() {
  const [totalAddresses, verifiedAddresses, communesCovered] = await Promise.all([
    prisma.address.count({ where: { status: "PUBLIE" } }),
    prisma.address.count({ where: { status: "PUBLIE", verified: true } }),
    prisma.address.groupBy({ by: ["communeId"], where: { status: "PUBLIE" } }).then((r: unknown[]) => r.length)
  ]);

  return (
    <main>
      <header className="border-b border-black/5 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon-512.png" alt="ADRESSA" width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-black tracking-widest text-adressa-deep">ADRESSA</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-medium text-adressa-ink/70 md:flex">
            <Link href="/search" className="hover:text-adressa-deep">Rechercher</Link>
            <Link href="/map" className="hover:text-adressa-deep">Carte</Link>
            <Link href="/entreprises" className="hover:text-adressa-deep">Entreprises</Link>
            <Link href="/collectivites" className="hover:text-adressa-deep">Collectivités</Link>
            <Link href="/login" className="hover:text-adressa-deep">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-adressa-deep px-6 py-24 text-white">
        <div
          aria-hidden
          className="animate-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-adressa-green/30 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-blob-delay pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-black leading-tight md:text-6xl">Chaque lieu a une identité.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            ADRESSA transforme chaque bâtiment en une adresse numérique précise, vérifiable et partageable.
          </p>

          <HeroSearch />

          <p className="mt-4 text-sm text-white/50">
            Essayez avec un vrai identifiant : <span className="font-mono text-white/70">SN-SBK-001</span>
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <div className="min-w-[130px] rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
              <div className="text-3xl font-black text-white">
                <AnimatedCounter value={totalAddresses} />
              </div>
              <div className="mt-1 text-xs text-white/60">
                adresse{totalAddresses > 1 ? "s" : ""} active{totalAddresses > 1 ? "s" : ""}
              </div>
            </div>
            <div className="min-w-[130px] rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
              <div className="text-3xl font-black text-white">
                <AnimatedCounter value={verifiedAddresses} />
              </div>
              <div className="mt-1 text-xs text-white/60">vérifiée{verifiedAddresses > 1 ? "s" : ""}</div>
            </div>
            <div className="min-w-[130px] rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
              <div className="text-3xl font-black text-white">
                <AnimatedCounter value={communesCovered} />
              </div>
              <div className="mt-1 text-xs text-white/60">
                commune{communesCovered > 1 ? "s" : ""} couverte{communesCovered > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <Link href="#comment-ca-marche" className="mt-8 inline-block text-sm text-white/50 underline hover:text-white/80">
            Découvrir comment ça marche ↓
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <FadeIn>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-adressa-deep">La carte, en direct</h2>
            <p className="mt-2 text-adressa-ink/60">
              Voici les adresses réellement enregistrées dans ADRESSA aujourd'hui — pas une maquette.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={150}>
          <div className="h-96 overflow-hidden rounded-xl2 border border-black/5 shadow-sm transition-shadow hover:shadow-lg">
            <MapView />
          </div>
        </FadeIn>
      </section>

      <section id="comment-ca-marche" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((s, i) => (
            <FadeIn key={s.title} delay={i * 60}>
              <div className="card h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-3 text-3xl">{s.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-adressa-deep">{s.title}</h3>
                <p className="text-sm text-adressa-ink/70">{s.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <FadeIn>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-adressa-deep">Pilote : Sébikotane</h2>
            <p className="mt-3 text-adressa-ink/70">
              Le projet démarre avec 5 adresses pilotes à Sébikotane, quartier Dogar, avant de s'étendre aux autres
              villes du Sénégal puis à l'Afrique de l'Ouest.
            </p>
            <div className="relative mt-6 inline-flex">
              <span className="animate-pulse-ring absolute inset-0 rounded-xl bg-adressa-green/40" />
              <Link href="/a/SN-SBK-001" className="btn-primary relative">
                Voir un exemple : SN-SBK-001
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-black/5 px-6 py-8 text-center text-xs text-adressa-ink/50">
        ADRESSA — Cette adresse est identifiée par ADRESSA. © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
