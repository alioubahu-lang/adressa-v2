import { SiteHeader } from "@/components/SiteHeader";
import { CollectivitesHero, TerritoryPreview } from "@/components/collectivites/CollectivitesHero";
import { ModulesExplorer } from "@/components/collectivites/ModulesExplorer";
import { ImpactCalculator } from "@/components/collectivites/ImpactCalculator";
import { MairieContactForm } from "@/components/collectivites/MairieContactForm";
import Link from "next/link";
import { ArrowUpRight, Database, MapPin, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Pour les collectivités — ADRESSA",
  description:
    "Modernisez la gestion de votre commune grâce à l'adressage numérique certifié ADRESSA : fiscalité, secours, cadastre, état civil."
};

export default function CollectivitesPage() {
  return (
    <main className="min-h-screen bg-adressa-gray">
      <SiteHeader />

      {/* Hero institutionnel */}
      <section className="relative overflow-hidden bg-adressa-deep px-6 py-12 text-white sm:py-16 lg:py-20">
        <div aria-hidden="true" className="absolute -right-40 -top-48 size-[34rem] rounded-full border border-white/[0.06]" />
        <div aria-hidden="true" className="absolute -right-20 -top-28 size-[26rem] rounded-full border border-white/[0.06]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-100 sm:text-xs"><MapPin size={14} /> ADRESSA · Collectivités</span>
            <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
              Modernisez la gestion de votre commune grâce à l&apos;adressage numérique certifié.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Sécurisez vos recettes fiscales, accélérez les secours d&apos;urgence et offrez une identité postale
              officielle à chaque citoyen de votre collectivité.
            </p>
            <div className="mt-7"><CollectivitesHero /></div>
          </div>
          <div className="mx-auto w-full max-w-[610px]"><TerritoryPreview /></div>
        </div>
      </section>

      {/* Modules + simulateur dashboard */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-adressa-deep">Les cas d&apos;usage pour votre mairie</h2>
          <p className="mt-2 text-adressa-ink/60">
            Cliquez sur un module pour voir un aperçu du tableau de bord municipal correspondant.
          </p>
        </div>
        <ModulesExplorer />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 lg:grid-cols-[1.12fr_.88fr]">
          <article className="overflow-hidden rounded-3xl bg-gradient-to-br from-adressa-deep to-[#1b5a43] p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"><span className="size-2 rounded-full bg-emerald-300" /> Projet pilote · en déploiement</span>
              <span className="text-xs text-white/65">Sénégal</span>
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">Commune de Sébikotane</h2>
            <p className="mt-1 text-sm font-medium text-emerald-100">Quartier pilote : Tanghor</p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">Le pilote relie le repérage sur le terrain aux fiches numériques et aux plaques ADRESSA. Consultez la démonstration d&apos;une adresse du territoire.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-white/90">
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">Adresses géolocalisées</span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">Fiches vérifiables</span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">Plaques avec QR</span>
            </div>
            <Link href="/a/SN-SBK-001" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-adressa-deep transition hover:bg-emerald-50">Voir la démonstration SN-SBK-001 <ArrowUpRight size={16} /></Link>
          </article>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="flex items-start gap-4 rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Database size={21} /></span>
              <div><h3 className="font-bold text-adressa-deep">Souveraineté des données communales</h3><p className="mt-2 text-sm leading-6 text-adressa-ink/65">La commune garde la maîtrise des rôles, des accès et de la gouvernance de ses données.</p></div>
            </article>
            <article className="flex items-start gap-4 rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700"><ShieldCheck size={21} /></span>
              <div><h3 className="font-bold text-adressa-deep">Référentiels nationaux d&apos;urbanisme</h3><p className="mt-2 text-sm leading-6 text-adressa-ink/65">Un adressage structuré pour s&apos;aligner sur les référentiels et les besoins de planification du territoire.</p></div>
            </article>
          </div>
        </div>
      </section>

      {/* Calculateur d'impact */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <ImpactCalculator />
      </section>

      {/* Formulaire de contact B2G */}
      <section id="contact-mairie" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-adressa-deep">Déployer ADRESSA dans votre commune</h2>
          <p className="mx-auto mt-3 max-w-xl text-adressa-ink/70">
            Sollicitez une rencontre ou une présentation en conseil municipal.
          </p>
        </div>
        <div className="mt-8">
          <MairieContactForm />
        </div>
      </section>
    </main>
  );
}
