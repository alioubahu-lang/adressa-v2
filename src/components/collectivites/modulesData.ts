import type { LucideIcon } from "lucide-react";
import { Coins, Siren, Map, FileCheck2, Landmark, BarChart3 } from "lucide-react";

export type MunicipalModule = {
  id: string;
  title: string;
  Icon: LucideIcon;
  description: string;
  metrics: { label: string; value: string }[];
  mapNote: string;
};

export const municipalModules: MunicipalModule[] = [
  {
    id: "fiscal",
    title: "Recouvrement Fiscal & Patentes",
    Icon: Coins,
    description: "Optimisation de la taxe locale grâce à des adresses vérifiées et géolocalisées.",
    metrics: [
      { label: "Contribuables identifiés (aperçu)", value: "94%" },
      { label: "Hausse de recettes estimée", value: "+35%" }
    ],
    mapNote: "Zones fiscales de Sébikotane cartographiées avec adresses vérifiées."
  },
  {
    id: "urgences",
    title: "Secours & Urgences",
    Icon: Siren,
    description: "Intervention rapide des sapeurs-pompiers, de la police et du SAMU.",
    metrics: [
      { label: "Temps d'intervention gagné (estimation)", value: "-12 min" },
      { label: "Bâtiments géolocalisés", value: "100%" }
    ],
    mapNote: "Itinéraires d'urgence calculés jusqu'au point d'entrée du bâtiment."
  },
  {
    id: "cadastre",
    title: "Cadastre & Patrimoine Municipal",
    Icon: Map,
    description: "Gestion des équipements et réseaux (eau, électricité, voirie).",
    metrics: [
      { label: "Équipements référencés (aperçu)", value: "128" },
      { label: "Réseaux cartographiés", value: "Eau, électricité, voirie" }
    ],
    mapNote: "Référentiel numérique du patrimoine municipal de Sébikotane."
  },
  {
    id: "etat-civil",
    title: "Certificat de Résidence Numérique",
    Icon: FileCheck2,
    description: "Inclusion citoyenne et modernisation de l'état civil.",
    metrics: [
      { label: "Délai de délivrance (estimation)", value: "-70%" },
      { label: "Adresses vérifiables", value: "100% du pilote" }
    ],
    mapNote: "Chaque citoyen dispose d'une adresse numérique officielle et vérifiable."
  },
  {
    id: "attractivite",
    title: "Annuaire & Attractivité Territoriale",
    Icon: Landmark,
    description: "Mise en valeur touristique et commerciale de la commune.",
    metrics: [
      { label: "Commerces référencés (aperçu)", value: "42" },
      { label: "Fiches publiques partageables", value: "Oui" }
    ],
    mapNote: "Annuaire public des commerces et lieux d'intérêt de Sébikotane."
  },
  {
    id: "dashboard",
    title: "Dashboard & Cartographie Décisionnelle",
    Icon: BarChart3,
    description: "Statistiques urbaines et suivi de la couverture d'adressage en temps réel.",
    metrics: [
      { label: "Adresses vérifiées (pilote)", value: "5/5" },
      { label: "Communes couvertes", value: "1" }
    ],
    mapNote: "Vue d'ensemble cartographique de la couverture d'adressage."
  }
];
