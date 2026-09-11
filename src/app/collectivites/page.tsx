import { SiteHeader } from "@/components/SiteHeader";
import { CollectivitesHero } from "@/components/collectivites/CollectivitesHero";
import { ModulesExplorer } from "@/components/collectivites/ModulesExplorer";
import { ImpactCalculator } from "@/components/collectivites/ImpactCalculator";
import { MairieContactForm } from "@/components/collectivites/MairieContactForm";

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
      <section className="bg-adressa-deep px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            Modernisez la gestion de votre commune grâce à l&apos;adressage numérique certifié.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Sécurisez vos recettes fiscales, accélérez les secours d&apos;urgence et offrez une identité postale
            officielle à chaque citoyen de votre collectivité.
          </p>
          <div className="mt-8">
            <CollectivitesHero />
          </div>
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

      {/* Calculateur d'impact */}
      <section className="mx-auto max-w-2xl px-6 py-16">
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
