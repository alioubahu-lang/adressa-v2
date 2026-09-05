import Link from "next/link";
import Image from "next/image";

const sections = [
  { title: "Comment ça marche", text: "Chaque bâtiment reçoit un identifiant unique, une position GPS précise et une page d'adresse numérique accessible par QR." },
  { title: "Une plaque physique", text: "Une plaque simple, posée sur le bâtiment, portant l'identifiant ADRESSA et un QR code dynamique." },
  { title: "Une identité numérique", text: "Derrière chaque plaque, une fiche vérifiée : GPS, quartier, repère, photo, historique." },
  { title: "GPS précis", text: "ADRESSA ROUTE guide jusqu'à l'entrée exacte du bâtiment, pas seulement jusqu'au quartier." },
  { title: "QR dynamique", text: "Le QR pointe vers ADRESSA, jamais directement vers une carte figée. La destination peut évoluer sans changer la plaque." },
  { title: "ADRESSA ROUTE", text: "Point d'entrée, repère et itinéraire précis pour ne plus jamais se perdre." },
  { title: "Pour les citoyens", text: "Recevoir des colis, donner rendez-vous, partager sa position en un lien." },
  { title: "Pour les entreprises", text: "Livraison, e-commerce, transport : une adresse fiable pour chaque client." },
  { title: "Pour les collectivités", text: "Un dashboard complet pour cartographier, vérifier et administrer le territoire." },
  { title: "Vision Afrique", text: "Du Sénégal à l'Afrique de l'Ouest : une infrastructure d'identité géographique panafricaine." }
];

export default function HomePage() {
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

      <section className="bg-adressa-deep px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-black leading-tight md:text-6xl">Chaque lieu a une identité.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            ADRESSA transforme chaque bâtiment en une adresse numérique précise, vérifiable et partageable.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/search" className="btn-primary bg-white text-adressa-deep hover:bg-adressa-light">
              Rechercher une adresse
            </Link>
            <Link href="#comment-ca-marche" className="btn-secondary bg-transparent text-white border-white/30 hover:bg-white/10">
              Découvrir ADRESSA
            </Link>
          </div>
        </div>
      </section>

      <section id="comment-ca-marche" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <div key={s.title} className="card">
              <h3 className="mb-2 text-lg font-bold text-adressa-deep">{s.title}</h3>
              <p className="text-sm text-adressa-ink/70">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-adressa-deep">Pilote : Sébikotane</h2>
          <p className="mt-3 text-adressa-ink/70">
            Le projet démarre avec 5 adresses pilotes à Sébikotane, quartier Dogar, avant de s'étendre aux autres
            villes du Sénégal puis à l'Afrique de l'Ouest.
          </p>
          <Link href="/a/SN-SBK-001" className="btn-primary mt-6 inline-flex">
            Voir un exemple : SN-SBK-001
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 px-6 py-8 text-center text-xs text-adressa-ink/50">
        ADRESSA — Cette adresse est identifiée par ADRESSA. © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
