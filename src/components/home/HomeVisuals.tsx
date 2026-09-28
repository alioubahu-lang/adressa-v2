import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BadgeCheck, Building2, MapPin, PackageCheck, Route, ShieldCheck, Users } from "lucide-react";

export function AddressExperienceMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div aria-hidden="true" className="absolute -inset-5 rounded-[36px] bg-emerald-300/15 blur-2xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white p-2.5 shadow-2xl sm:p-3">
        <div className="relative aspect-[3/2] overflow-hidden rounded-[20px] bg-[#e8e2d4]">
          <Image
            src="/images/adressa-plaque-tanghor.png"
            alt="Plaque ADRESSA installée sur une façade, avec l’identifiant SN-SBK-001 pour Tanghor à Sébikotane"
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 1024px) 100vw, 640px"
            className="h-full w-full object-cover"
          />
          <div className="absolute left-[58.7%] top-[44.1%] z-10 aspect-square w-[7.8%] bg-white p-[0.15%] shadow-sm" aria-label="QR code fonctionnel pour SN-SBK-001">
            <Image src="/api/qr/SN-SBK-001?format=png" alt="" aria-hidden="true" width={512} height={512} unoptimized className="h-full w-full object-contain p-1" />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4 pt-14 sm:p-5 sm:pt-16">
            <div className="text-white drop-shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-xs">Plaque ADRESSA · Démonstration</p>
              <p className="mt-1 text-sm font-bold sm:text-base">SN-SBK-001 · Tanghor</p>
            </div>
            <Link href="/a/SN-SBK-001" className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-bold text-adressa-deep shadow-lg transition hover:bg-emerald-50 sm:px-4 sm:text-sm">
              Voir la fiche <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <span className="absolute right-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[9px] font-semibold text-adressa-deep shadow-sm backdrop-blur sm:right-4 sm:top-4 sm:text-[10px]">
            Tanghor · Sébikotane
          </span>
        </div>
      </div>
    </div>
  );
}

const audienceGroups = [
  {
    icon: Users,
    eyebrow: "Pour les citoyens",
    title: "Être trouvé, simplement.",
    text: "Recevoir un colis ou un visiteur devient plus facile quand votre adresse se partage en un lien.",
    points: ["Partager sa position en un clic", "Donner un repère fiable", "Recevoir colis et visiteurs"],
    href: "/search",
    link: "Découvrir l’adresse numérique",
    tone: "bg-[#e9f5ee] text-adressa-green"
  },
  {
    icon: Route,
    eyebrow: "Entreprises & livreurs",
    title: "Livrer sans tourner en rond.",
    text: "Une localisation précise et des repères clairs pour réduire les erreurs de livraison.",
    points: ["Optimiser les trajets", "Guider jusqu’à l’entrée", "Réduire les colis introuvables"],
    href: "/entreprises",
    link: "Voir les solutions entreprise",
    tone: "bg-[#eef3ff] text-[#4465b2]"
  },
  {
    icon: Building2,
    eyebrow: "Collectivités & villes",
    title: "Piloter le territoire.",
    text: "Cartographier les bâtiments et suivre les opérations municipales dans un espace dédié.",
    points: ["Cartographie souveraine", "Suivi des équipes terrain", "Données municipales centralisées"],
    href: "/collectivites",
    link: "Explorer l’espace collectivités",
    tone: "bg-[#fff2e5] text-[#9b5a19]"
  }
];

export function AudienceCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {audienceGroups.map(({ icon: Icon, eyebrow, title, text, points, href, link, tone }) => (
        <article key={eyebrow} className="group flex h-full flex-col rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-7">
          <div className={`mb-6 grid size-12 place-items-center rounded-2xl ${tone}`}><Icon size={22} aria-hidden="true" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-adressa-ink/45">{eyebrow}</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-adressa-deep">{title}</h3>
          <p className="mt-3 min-h-[3.5rem] text-sm leading-6 text-adressa-ink/65">{text}</p>
          <ul className="mt-5 space-y-2.5">
            {points.map((point) => <li key={point} className="flex items-center gap-2 text-sm text-adressa-ink/75"><span className="size-1.5 rounded-full bg-adressa-green" />{point}</li>)}
          </ul>
          <Link href={href} className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-bold text-adressa-green transition group-hover:gap-3">
            {link}<ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}

export function MunicipalDashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[600px] rounded-[26px] border border-black/5 bg-[#f6f8f6] p-3 shadow-[0_30px_90px_-40px_rgba(15,46,35,0.4)] sm:p-4">
      <div className="overflow-hidden rounded-[18px] border border-black/[0.06] bg-white">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2"><div className="grid size-7 place-items-center rounded-lg bg-adressa-light text-adressa-green"><Building2 size={15} /></div><div><p className="text-[10px] font-black text-adressa-deep sm:text-xs">ADRESSA · MAIRIE</p><p className="text-[8px] text-adressa-ink/50 sm:text-[9px]">Sébikotane · espace municipal</p></div></div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-semibold text-emerald-700 sm:text-[9px]">Données à jour</span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
          {[["Bâtiments", "1 248", "text-adressa-green"], ["À vérifier", "36", "text-amber-600"], ["Commerces", "312", "text-sky-700"]].map(([label, value, color]) => (
            <div key={label} className="rounded-xl bg-[#f7f9f7] p-2.5 sm:p-3"><p className="text-[8px] text-adressa-ink/55 sm:text-[9px]">{label}</p><p className={`mt-1 text-sm font-black sm:text-lg ${color}`}>{value}</p></div>
          ))}
        </div>
        <div className="grid gap-3 px-3 pb-3 sm:grid-cols-[1.35fr_0.8fr] sm:px-4 sm:pb-4">
          <div className="relative min-h-[145px] overflow-hidden rounded-xl bg-[#e7f0e8] p-3 sm:min-h-[190px]">
            <div className="absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: "linear-gradient(35deg,transparent 46%,#fff 47%,#fff 50%,transparent 51%),linear-gradient(120deg,transparent 44%,#fff 45%,#fff 48%,transparent 49%)", backgroundSize: "72px 62px" }} />
            <p className="relative text-[9px] font-bold text-adressa-deep sm:text-[10px]">Carte des adresses</p>
            {[["left-[22%] top-[36%]", "bg-adressa-green"], ["left-[54%] top-[53%]", "bg-amber-500"], ["left-[72%] top-[29%]", "bg-adressa-green"], ["left-[40%] top-[72%]", "bg-adressa-green"], ["left-[82%] top-[69%]", "bg-amber-500"]].map(([position, color], index) => <span key={index} className={`absolute ${position} z-10 size-3 rounded-full border-2 border-white ${color} shadow`} />)}
            <div className="absolute bottom-2 left-2 flex gap-2 rounded-full bg-white/90 px-2 py-1 text-[7px] text-adressa-ink/60 sm:bottom-3 sm:left-3"><span className="text-adressa-green">● Vérifiée</span><span className="text-amber-500">● À contrôler</span></div>
          </div>
          <div className="rounded-xl border border-black/[0.06] p-3">
            <div className="mb-3 flex items-center justify-between"><p className="text-[9px] font-bold text-adressa-deep sm:text-[10px]">À valider</p><span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[8px] text-amber-700">36</span></div>
            {["SN-SBK-126", "SN-SBK-125", "SN-SBK-124"].map((id, index) => <div key={id} className="flex items-center gap-2 border-t border-black/[0.05] py-2"><div className="grid size-7 shrink-0 place-items-center rounded-lg bg-adressa-light text-adressa-green"><MapPin size={12} /></div><div className="min-w-0"><p className="text-[8px] font-bold text-adressa-deep sm:text-[9px]">{id}</p><p className="text-[7px] text-adressa-ink/50">{index === 0 ? "Tanghor · Commerce" : "Quartier · Habitation"}</p></div><BadgeCheck size={13} className="ml-auto text-adressa-ink/20" /></div>)}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-black/[0.06] px-3 py-2.5 sm:px-4"><span className="text-[8px] text-adressa-ink/50 sm:text-[9px]">Synthèse du territoire</span><span className="inline-flex items-center gap-1 text-[8px] font-semibold text-adressa-green sm:text-[9px]"><ShieldCheck size={12} /> Accès mairie sécurisé</span></div>
      </div>
      <div className="absolute -bottom-3 -left-2 flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-[9px] font-semibold text-adressa-deep shadow-lg sm:-bottom-4 sm:-left-5 sm:px-4 sm:py-2.5 sm:text-[10px]">
        <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-adressa-green"><PackageCheck size={15} /></span>
        Données terrain · décisions mairie
      </div>
    </div>
  );
}
