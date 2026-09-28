import Link from "next/link";
import nextDynamic from "next/dynamic";
import { ArrowDown, ArrowRight, BadgeCheck, Building2, MapPinned, QrCode, ShieldCheck } from "lucide-react";
import { HeroSearch } from "@/components/HeroSearch";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { FadeIn } from "@/components/FadeIn";
import { SiteHeader } from "@/components/SiteHeader";
import { AddressExperienceMockup, AudienceCards, MunicipalDashboardPreview } from "@/components/home/HomeVisuals";
import { prisma } from "@/lib/prisma";

const MapView = nextDynamic(() => import("@/components/MapView"), { ssr: false });

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [totalAddresses, verifiedAddresses, communesCovered] = await Promise.all([
    prisma.address.count({ where: { status: "PUBLIE" } }),
    prisma.address.count({ where: { status: "PUBLIE", verified: true } }),
    prisma.address.groupBy({ by: ["communeId"], where: { status: "PUBLIE" } }).then((r: unknown[]) => r.length)
  ]);

  return (
    <main className="overflow-hidden bg-[#fbfcfa]">
      <SiteHeader />

      <section className="relative isolate overflow-hidden bg-adressa-deep px-5 pb-20 pt-14 text-white sm:px-8 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-32 size-[34rem] rounded-full bg-emerald-500/20 blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-56 right-0 size-[36rem] rounded-full bg-teal-300/10 blur-[110px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100 sm:text-xs">
              <MapPinned size={15} aria-hidden="true" /> L&apos;infrastructure d&apos;adressage numérique et physique pour l&apos;Afrique
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[4.4rem]">Chaque lieu a une identité.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              ADRESSA relie chaque bâtiment à une adresse vérifiable, une plaque avec QR code et un itinéraire jusqu&apos;à son entrée.
            </p>
            <HeroSearch />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/collectivites" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-adressa-deep transition hover:bg-emerald-50">
                <Building2 size={17} aria-hidden="true" /> Espace collectivités <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/map" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white/90 transition hover:bg-white/10">
                Explorer la carte <ArrowDown size={15} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55 sm:text-sm">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-emerald-300" /> Identifiants uniques</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-300" /> Données vérifiées sur le terrain</span>
            </div>
          </div>
          <AddressExperienceMockup />
        </div>
      </section>

      <section aria-labelledby="metrics-title" className="relative z-10 mx-auto -mt-1 max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-adressa-green">Des engagements concrets</p><h2 id="metrics-title" className="mt-1 text-xl font-black tracking-tight text-adressa-deep sm:text-2xl">Métriques clés &amp; engagements</h2></div>
          <span className="text-xs text-adressa-ink/45">Données du pilote · mises à jour en direct</span>
        </div>
        <div className="grid overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_20px_60px_-45px_rgba(15,46,35,0.5)] sm:grid-cols-3">
          <div className="flex items-center gap-4 border-b border-black/[0.06] p-5 sm:border-b-0 sm:border-r sm:p-6"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-adressa-green"><BadgeCheck size={23} /></div><div><p className="text-2xl font-black text-adressa-deep"><AnimatedCounter value={verifiedAddresses} /><span className="text-base font-bold text-adressa-ink/35"> / <AnimatedCounter value={totalAddresses} /></span></p><p className="mt-0.5 text-xs text-adressa-ink/55 sm:text-sm">adresses vérifiées sur le pilote</p></div></div>
          <div className="flex items-center gap-4 border-b border-black/[0.06] p-5 sm:border-b-0 sm:border-r sm:p-6"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700"><QrCode size={22} /></div><div><p className="text-lg font-black text-adressa-deep">QR codes dynamiques</p><p className="mt-0.5 text-xs text-adressa-ink/55 sm:text-sm">Une plaque, une fiche qui évolue</p></div></div>
          <div className="flex items-center gap-4 p-5 sm:p-6"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700"><MapPinned size={22} /></div><div><p className="text-2xl font-black text-adressa-deep"><AnimatedCounter value={communesCovered} /></p><p className="mt-0.5 text-xs text-adressa-ink/55 sm:text-sm">commune{communesCovered > 1 ? "s" : ""} couverte{communesCovered > 1 ? "s" : ""} par le pilote</p></div></div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <FadeIn><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-adressa-green">Une adresse, plusieurs usages</p><h2 className="mt-2 text-3xl font-black tracking-tight text-adressa-deep sm:text-4xl">Pensé pour celles et ceux qui font vivre la ville.</h2></div><p className="max-w-md text-sm leading-6 text-adressa-ink/60">Une même infrastructure au service des habitants, de l&apos;activité économique et de l&apos;action publique.</p></div></FadeIn>
          <FadeIn delay={100}><AudienceCards /></FadeIn>
        </div>
      </section>

      <section className="bg-[#f1f6f2] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <FadeIn><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-adressa-green">Le territoire en un coup d&apos;œil</p><h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-adressa-deep sm:text-4xl">Un outil de pilotage pour les communes.</h2><p className="mt-5 max-w-lg text-base leading-7 text-adressa-ink/65">L&apos;espace municipal rassemble la cartographie des adresses, les vérifications terrain et les informations nécessaires au suivi du territoire.</p><ul className="mt-6 space-y-3 text-sm text-adressa-ink/75"><li className="flex gap-3"><span className="mt-2 size-2 shrink-0 rounded-full bg-adressa-green" />Visualiser les bâtiments et leur statut sur une carte</li><li className="flex gap-3"><span className="mt-2 size-2 shrink-0 rounded-full bg-adressa-green" />Suivre les adresses soumises à validation</li><li className="flex gap-3"><span className="mt-2 size-2 shrink-0 rounded-full bg-adressa-green" />Centraliser les informations utiles à la commune</li></ul><Link href="/collectivites" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-adressa-deep px-5 text-sm font-bold text-white transition hover:bg-adressa-green">Découvrir l&apos;espace collectivités <ArrowRight size={16} /></Link></div></FadeIn>
          <FadeIn delay={150}><div><p className="mb-3 inline-flex rounded-full border border-adressa-green/15 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-adressa-green">Maquette visuelle · exemple d&apos;interface</p><MunicipalDashboardPreview /></div></FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <FadeIn><div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-adressa-green">Ancrage local</p><h2 className="mt-2 text-3xl font-black tracking-tight text-adressa-deep">La carte, en direct.</h2></div><p className="max-w-xl text-sm leading-6 text-adressa-ink/60">Les points affichés correspondent aux adresses réellement enregistrées dans ADRESSA.</p></div></FadeIn>
        <FadeIn delay={100}><div className="h-[360px] overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-lg sm:h-[470px]"><MapView /></div></FadeIn>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <FadeIn><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-adressa-deep px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14"><div aria-hidden="true" className="absolute -right-16 -top-32 size-80 rounded-full bg-emerald-400/15 blur-3xl" /><div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"><span className="size-2 animate-pulse rounded-full bg-emerald-300" /> En déploiement</div><p className="mt-5 text-xs font-bold uppercase tracking-[0.17em] text-emerald-200/75">Projet pilote</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Sébikotane <span className="text-white/55">·</span> Quartier Tanghor</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Le pilote ADRESSA donne une identité numérique aux bâtiments et met en place les premiers repères physiques sur le terrain.</p></div><Link href="/a/SN-SBK-001" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-adressa-deep transition hover:bg-emerald-50">Voir la démo SN-SBK-001 <ArrowRight size={16} /></Link></div></div></FadeIn>
      </section>

      <footer className="border-t border-black/[0.06] px-6 py-8 text-center text-xs text-adressa-ink/50">ADRESSA — Cette adresse est identifiée par ADRESSA. © {new Date().getFullYear()}</footer>
    </main>
  );
}
