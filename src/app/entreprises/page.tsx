import { SiteHeader } from "@/components/SiteHeader";
import { EntreprisesHero } from "@/components/entreprises/EntreprisesHero";
import { SectorExplorer } from "@/components/entreprises/SectorExplorer";
import { RoiCalculator } from "@/components/entreprises/RoiCalculator";
import { ContactFormSection } from "@/components/entreprises/ContactFormSection";
import { BadgeCheck, Database, LockKeyhole, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Pour les entreprises — API ADRESSA",
  description:
    "Intégrez des adresses précises, vérifiées et géolocalisées dans vos applications grâce à l'API ADRESSA."
};

export default function EntreprisesPage() {
  return (
    <main className="min-h-screen bg-adressa-gray">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-adressa-deep px-6 py-24 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            Transformez vos adresses en avantage concurrentiel.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-semibold leading-8 text-white/90 md:text-xl">
            Réduisez vos coûts logistiques et automatisez la localisation de vos clients grâce à l&apos;API d&apos;adressage de précision d&apos;ADRESSA.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60">
            Moins de recherches infructueuses, un point d&apos;entrée plus précis et une intégration accompagnée par notre équipe.
          </p>
          <div className="mt-10 flex justify-center">
            <EntreprisesHero />
          </div>
        </div>
      </section>

      <section className="border-b border-black/[0.04] bg-white px-6 py-7">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl bg-[#f8faf8] p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-adressa-green"><BadgeCheck size={18} /></span><div><p className="text-sm font-bold text-adressa-deep">Adresse vérifiable</p><p className="mt-1 text-xs leading-5 text-adressa-ink/55">Identifiant relié à une fiche et à des coordonnées de localisation.</p></div></div>
          <div className="flex items-start gap-3 rounded-2xl bg-[#f8faf8] p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700"><LockKeyhole size={18} /></span><div><p className="text-sm font-bold text-adressa-deep">KYC en appui</p><p className="mt-1 text-xs leading-5 text-adressa-ink/55">Une preuve d&apos;adresse de terrain à intégrer à vos vérifications internes.</p></div></div>
          <div className="flex items-start gap-3 rounded-2xl bg-[#f8faf8] p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><Database size={18} /></span><div><p className="text-sm font-bold text-adressa-deep">Intégration accompagnée</p><p className="mt-1 text-xs leading-5 text-adressa-ink/55">Étude du besoin et accès de démonstration sur demande.</p></div></div>
        </div>
      </section>

      {/* Secteurs + panneau impact opérationnel */}
      <section id="secteurs" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-adressa-deep">Une solution par secteur</h2>
          <p className="mt-2 text-adressa-ink/60">
            Cliquez sur un secteur pour voir l&apos;impact opérationnel correspondant.
          </p>
        </div>
        <SectorExplorer />
      </section>

      {/* Calculateur d'impact */}
      <section id="calculateur-impact" className="mx-auto max-w-6xl px-6 py-16 scroll-mt-20">
        <RoiCalculator />
      </section>

      <section className="bg-white px-6 py-14">
        <div className="mx-auto max-w-6xl rounded-3xl border border-black/[0.06] bg-[#fbfcfb] p-6 text-center sm:p-9">
          <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-emerald-50 text-adressa-green"><ShieldCheck size={21} /></div>
          <h2 className="mt-3 text-xl font-black text-adressa-deep">Pensé pour vos exigences de sécurité et de conformité</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-adressa-ink/60">ADRESSA apporte une donnée de localisation vérifiable à vos parcours. Les décisions KYC, la conservation des justificatifs et les contrôles réglementaires restent définis par votre établissement.</p>
          <div className="mt-6 border-t border-black/[0.06] pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-adressa-ink/40">Espace réservé aux partenaires et collectivités confirmés</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {["Collectivités", "Logistique & mobilité", "Banques & fintechs", "Intégrateurs"].map((name) => <div key={name} className="flex min-h-12 items-center justify-center rounded-xl border border-dashed border-black/15 bg-white px-3 text-xs font-semibold text-adressa-ink/45">{name}</div>)}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final avec formulaire de contact B2B */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-adressa-deep">Prêt à intégrer ADRESSA ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-adressa-ink/70">
            Décrivez-nous votre besoin, notre équipe vous accompagne dans la mise en place de votre accès API.
          </p>
        </div>
        <div className="mt-8">
          <ContactFormSection />
        </div>
      </section>

      <div className="bg-white pb-10 text-center">
        <p className="text-xs text-adressa-ink/40">
          Vous êtes développeur ou intégrateur technique ?{" "}
          <a href="#secteurs" className="underline hover:text-adressa-ink/70">
            Consulter la documentation API
          </a>
        </p>
      </div>
    </main>
  );
}
