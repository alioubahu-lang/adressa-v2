import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BadgeCheck, Building2, MapPin, Navigation, PackageCheck, Route, ShieldCheck, Users } from "lucide-react";

function DecorativeQr() {
  return (
    <Image src="/images/qr-sn-sbk-001.png" alt="QR code de l’adresse SN-SBK-001" width={128} height={128} priority className="size-12 shrink-0 border-2 border-white bg-white p-0.5 sm:size-[58px]" />
  );
}

export function AddressExperienceMockup() {
  return (
    <div aria-label="Illustration d'une plaque ADRESSA sur un bâtiment et de sa fiche sur smartphone" className="relative mx-auto w-full max-w-[590px]">
      <div className="absolute -inset-5 rounded-[36px] bg-emerald-300/10 blur-2xl" aria-hidden="true" />
      <div className="relative min-h-[390px] overflow-hidden rounded-[28px] border border-white/15 bg-[#e8f0e8] p-4 shadow-2xl sm:min-h-[430px] sm:p-6">
        <div className="absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: "radial-gradient(#0f2e23 0.65px, transparent 0.65px)", backgroundSize: "15px 15px" }} />
        <div className="relative h-[330px] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#d8e6d9] via-[#eef1e9] to-[#cedfd2] sm:h-[365px]">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-[#b5c8ba]" aria-hidden="true" />
          <div className="absolute bottom-12 left-6 right-10 h-[245px] rounded-t-[110px_22px] bg-gradient-to-br from-[#fffdf6] via-[#f5f0e5] to-[#dcd8cb] shadow-[16px_20px_34px_-20px_rgba(15,46,35,0.55)] sm:left-10 sm:right-16 sm:h-[275px]" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-lg bg-[#c8b99d]" />
            <div className="absolute bottom-0 left-1/2 h-[90px] w-20 -translate-x-1/2 rounded-t-2xl border-x-[5px] border-t-[5px] border-[#ded7c8] bg-[#83998c] sm:h-[110px] sm:w-24" />
            <div className="absolute bottom-24 left-5 h-14 w-16 rounded-t-lg border-[5px] border-[#e1d9c7] bg-[#b6d1d0] sm:bottom-28 sm:left-8 sm:h-16 sm:w-20" />
            <div className="absolute bottom-24 right-5 h-14 w-16 rounded-t-lg border-[5px] border-[#e1d9c7] bg-[#b6d1d0] sm:bottom-28 sm:right-8 sm:h-16 sm:w-20" />
          </div>

          <Link href="/a/SN-SBK-001" aria-label="Ouvrir la fiche de démonstration SN-SBK-001" className="absolute left-3 top-[43%] z-10 w-[190px] -rotate-2 rounded-lg border border-white/20 bg-gradient-to-br from-[#174a37] to-[#0c2e23] p-2.5 text-white shadow-xl ring-1 ring-black/15 sm:left-6 sm:w-[225px] sm:p-3">
            <span aria-hidden="true" className="absolute left-2 top-2 size-1.5 rounded-full bg-[#d7d2c6] shadow-[inset_0_1px_1px_rgba(0,0,0,.45)] sm:left-2.5 sm:top-2.5" />
            <span aria-hidden="true" className="absolute right-2 top-2 size-1.5 rounded-full bg-[#d7d2c6] shadow-[inset_0_1px_1px_rgba(0,0,0,.45)] sm:right-2.5 sm:top-2.5" />
            <span aria-hidden="true" className="absolute bottom-2 left-2 size-1.5 rounded-full bg-[#d7d2c6] shadow-[inset_0_1px_1px_rgba(0,0,0,.45)] sm:bottom-2.5 sm:left-2.5" />
            <span aria-hidden="true" className="absolute bottom-2 right-2 size-1.5 rounded-full bg-[#d7d2c6] shadow-[inset_0_1px_1px_rgba(0,0,0,.45)] sm:bottom-2.5 sm:right-2.5" />
            <span className="flex items-center gap-2.5 px-1.5 py-1 sm:px-2">
              <span className="min-w-0 flex-1">
                <span className="block text-[8px] font-bold tracking-[0.18em] text-[#60d3ba] sm:text-[9px]">ADRESSA · SÉNÉGAL</span>
                <span className="mt-1 block text-[15px] font-black leading-none tracking-wide sm:text-lg">SN-SBK-001</span>
                <span className="mt-1.5 block text-[8px] text-white/75 sm:text-[9px]">TANGHOR · SÉBIKOTANE</span>
              </span>
              <DecorativeQr />
            </span>
            <span aria-hidden="true" className="mt-1 block h-0.5 rounded-full bg-gradient-to-r from-[#39c7ad] to-transparent" />
          </Link>

          <div className="absolute bottom-4 left-3 flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-medium text-adressa-deep shadow-sm backdrop-blur sm:bottom-5 sm:left-5 sm:text-xs">
            <MapPin size={13} className="text-adressa-green" aria-hidden="true" /> Plaque physique · fiche numérique
          </div>

          <div className="absolute bottom-2 right-3 z-20 w-[142px] rounded-[22px] border-[5px] border-[#10231b] bg-[#10231b] p-1.5 shadow-2xl sm:bottom-3 sm:right-7 sm:w-[168px] sm:rounded-[26px] sm:border-[6px]">
            <div className="overflow-hidden rounded-[15px] bg-white sm:rounded-[19px]">
              <div className="flex h-5 items-center justify-center bg-adressa-deep sm:h-6"><span className="h-1 w-8 rounded-full bg-white/50" /></div>
              <div className="p-2.5 sm:p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[7px] font-black tracking-widest text-adressa-green sm:text-[8px]">ADRESSA SN</span>
                  <BadgeCheck size={13} className="text-adressa-green" aria-label="Adresse vérifiée" />
                </div>
                <div className="relative mb-2 h-14 overflow-hidden rounded-lg bg-gradient-to-br from-[#d9ece4] via-[#c0ddd2] to-[#a2caba] sm:h-[70px]">
                  <div className="absolute -bottom-3 left-1/2 h-12 w-12 -translate-x-1/2 rounded-t-full bg-white/80" />
                  <div className="absolute left-1/2 top-2 -translate-x-1/2 text-adressa-green"><MapPin size={18} fill="currentColor" /></div>
                  <span className="absolute bottom-1 left-2 rounded-full bg-white/80 px-1.5 py-0.5 text-[6px] text-adressa-deep">TANGHOR</span>
                </div>
                <p className="text-[10px] font-black text-adressa-deep sm:text-xs">SN-SBK-001</p>
                <p className="mt-0.5 text-[7px] text-adressa-ink/60 sm:text-[8px]">Tanghor · Sébikotane</p>
                <p className="mt-1 text-[6px] text-adressa-ink/50 sm:text-[7px]">PVP4+3C8 · Sénégal</p>
                <div className="mt-2 flex items-center justify-center gap-1 rounded-md bg-adressa-light px-1.5 py-1 text-[7px] font-semibold text-adressa-deep sm:text-[8px]">
                  <Navigation size={10} /> Itinéraire
                </div>
                <p className="mt-2 text-center text-[6px] text-adressa-ink/40">FICHE ADRESSE SUR MOBILE</p>
              </div>
            </div>
          </div>
          <div className="absolute right-4 top-4 z-10 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[9px] font-semibold text-adressa-deep shadow-sm backdrop-blur sm:right-6 sm:top-6 sm:text-[10px]">
            Du terrain au numérique
          </div>
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
