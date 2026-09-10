import { SiteHeader } from "@/components/SiteHeader";
import { EntreprisesHero } from "@/components/entreprises/EntreprisesHero";
import { SectorExplorer } from "@/components/entreprises/SectorExplorer";
import { RoiCalculator } from "@/components/entreprises/RoiCalculator";
import { ContactFormSection } from "@/components/entreprises/ContactFormSection";

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
      <section className="bg-adressa-deep px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            L&apos;API d&apos;adressage qui connecte votre entreprise à chaque foyer sénégalais.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Intégrez des adresses précises, vérifiées et géolocalisées dans vos applications pour éliminer les
            échecs de livraison, accélérer le KYC et optimiser vos opérations.
          </p>
          <div className="mt-8 flex justify-center">
            <EntreprisesHero />
          </div>
        </div>
      </section>

      {/* Secteurs + JSON viewer */}
      <section id="apercu-api" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-adressa-deep">Une solution par secteur</h2>
          <p className="mt-2 text-adressa-ink/60">
            Cliquez sur un secteur pour voir un aperçu de la réponse API correspondante.
          </p>
        </div>
        <SectorExplorer />
      </section>

      {/* Calculateur ROI */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <RoiCalculator />
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
    </main>
  );
}
