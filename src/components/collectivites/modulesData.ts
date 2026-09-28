import type { LucideIcon } from "lucide-react";
import { Coins, Siren, Map, FileCheck2, Landmark, BarChart3 } from "lucide-react";

export type MunicipalModule = {
  id: string;
  title: string;
  Icon: LucideIcon;
  description: string;
  metrics: { label: string; value: string }[];
  mapNote: string;
  tone: { card: string; icon: string; badge: string; bar: string };
  bars: number[];
  coverageLabel: string;
};

export const municipalModules: MunicipalModule[] = [
  {
    id: "fiscal",
    title: "Recouvrement Fiscal",
    Icon: Coins,
    description: "Optimisation de la taxe locale grâce à des adresses vérifiées et géolocalisées.",
    metrics: [
      { label: "Commerces à qualifier (aperçu)", value: "94%" },
      { label: "Potentiel fiscal repéré", value: "+35%" }
    ],
    mapNote: "Lecture par zone des activités et des adresses à instruire.",
    tone: { card: "bg-amber-50", icon: "text-amber-700", badge: "bg-amber-100 text-amber-800", bar: "bg-amber-500" },
    bars: [72, 48, 88, 57, 78], coverageLabel: "Repérage des activités"
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
    mapNote: "Accès aux points d'intervention et repères jusqu'à l'entrée.",
    tone: { card: "bg-rose-50", icon: "text-rose-700", badge: "bg-rose-100 text-rose-800", bar: "bg-rose-500" },
    bars: [88, 64, 76, 53, 91], coverageLabel: "Points de repère disponibles"
  },
  {
    id: "cadastre",
    title: "Cadastre & Patrimoine",
    Icon: Map,
    description: "Gestion des équipements et réseaux (eau, électricité, voirie).",
    metrics: [
      { label: "Équipements référencés (aperçu)", value: "128" },
      { label: "Réseaux cartographiés", value: "Eau, électricité, voirie" }
    ],
    mapNote: "Équipements et patrimoine communal rattachés à leurs adresses.",
    tone: { card: "bg-sky-50", icon: "text-sky-700", badge: "bg-sky-100 text-sky-800", bar: "bg-sky-500" },
    bars: [53, 84, 67, 75, 59], coverageLabel: "Patrimoine répertorié"
  },
  {
    id: "etat-civil",
    title: "Certificat de Résidence",
    Icon: FileCheck2,
    description: "Inclusion citoyenne et modernisation de l'état civil.",
    metrics: [
      { label: "Délai de délivrance (estimation)", value: "-70%" },
      { label: "Adresses vérifiables", value: "100% du pilote" }
    ],
    mapNote: "Une adresse vérifiable pour simplifier les démarches de résidence.",
    tone: { card: "bg-violet-50", icon: "text-violet-700", badge: "bg-violet-100 text-violet-800", bar: "bg-violet-500" },
    bars: [82, 63, 91, 72, 55], coverageLabel: "Adresses vérifiables"
  },
  {
    id: "attractivite",
    title: "Annuaire & Attractivité",
    Icon: Landmark,
    description: "Mise en valeur touristique et commerciale de la commune.",
    metrics: [
      { label: "Commerces référencés (aperçu)", value: "42" },
      { label: "Fiches publiques partageables", value: "Oui" }
    ],
    mapNote: "Commerces et lieux d'intérêt localisables dans un annuaire partagé.",
    tone: { card: "bg-teal-50", icon: "text-teal-700", badge: "bg-teal-100 text-teal-800", bar: "bg-teal-500" },
    bars: [61, 89, 58, 76, 93], coverageLabel: "Fiches territoriales publiables"
  },
  {
    id: "dashboard",
    title: "Dashboard Décisionnel",
    Icon: BarChart3,
    description: "Statistiques urbaines et suivi de la couverture d'adressage en temps réel.",
    metrics: [
      { label: "Adresses vérifiées (pilote)", value: "5/5" },
      { label: "Communes couvertes", value: "1" }
    ],
    mapNote: "Indicateurs et couverture territoriale réunis dans une vue de pilotage.",
    tone: { card: "bg-indigo-50", icon: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800", bar: "bg-indigo-500" },
    bars: [70, 80, 66, 91, 75], coverageLabel: "Vue de couverture"
  }
];
