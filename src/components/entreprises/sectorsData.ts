import type { LucideIcon } from "lucide-react";
import { Truck, ShoppingCart, Car, Building2, Landmark, ShieldCheck, Wifi, Wrench } from "lucide-react";

export type Sector = {
  id: string;
  title: string;
  Icon: LucideIcon;
  problem: string;
  solution: string;
  impact: string;
  method: "GET" | "POST";
  endpoint: string;
  jsonResponse: Record<string, unknown>;
};

export const sectors: Sector[] = [
  {
    id: "livraison",
    title: "Livraison & Logistique",
    Icon: Truck,
    problem:
      "Plusieurs appels au client et des tours dans le quartier sont souvent nécessaires pour trouver le point de dépôt.",
    solution:
      "Chaque client reçoit un identifiant relié à un point GPS vérifié sur le terrain — le livreur va directement à l'entrée.",
    impact: "Jusqu'à -80% d'appels livreurs (bénéfice visé)",
    method: "GET",
    endpoint: "/api/v1/address/{adressa_id}/navigation",
    jsonResponse: {
      status: "success",
      data: {
        adressa_id: "SN-SBK-001",
        coordinates: { lat: 14.7351698, lng: -17.1439253 },
        address_details: {
          region: "Dakar",
          commune: "Sébikotane",
          quartier: "Dogar",
          landmark: "Près de TotalEnergies Sébikotane"
        },
        verified: true
      }
    }
  },
  {
    id: "ecommerce",
    title: "E-commerce & Webmasters",
    Icon: ShoppingCart,
    problem: "Une adresse tapée approximativement au moment de payer pousse souvent le client à abandonner son panier.",
    solution: "Un champ « identifiant ADRESSA » validé instantanément à la commande, relié à une position exacte.",
    impact: "Moins d'abandons de panier liés à l'adresse (bénéfice visé)",
    method: "POST",
    endpoint: "/api/v1/checkout/validate",
    jsonResponse: {
      status: "success",
      data: {
        adressa_id: "SN-SBK-002",
        valid: true,
        display_address: "SN-SBK-002 — Dogar, Sébikotane",
        coordinates: { lat: 14.7351691, lng: -17.1438918 }
      }
    }
  },
  {
    id: "transport",
    title: "Transport & VTC",
    Icon: Car,
    problem: "Le chauffeur perd du temps à chercher le point de prise en charge exact.",
    solution: "Le client partage son identifiant ADRESSA, le chauffeur est guidé directement au bon point.",
    impact: "Attente réduite avant prise en charge (bénéfice visé)",
    method: "GET",
    endpoint: "/api/v1/pickup/location",
    jsonResponse: {
      status: "success",
      data: {
        adressa_id: "SN-SBK-003",
        pickup_coordinates: { lat: 14.7345829, lng: -17.144212 },
        landmark: "Près de TotalEnergies Sébikotane"
      }
    }
  },
  {
    id: "immobilier",
    title: "Immobilier & BTP",
    Icon: Building2,
    problem: "Les biens fonciers sont difficiles à identifier et à suivre dans le temps.",
    solution: "Chaque bien reçoit une fiche numérique permanente liée à sa localisation précise.",
    impact: "Traçabilité complète du bien, du premier jour à la revente",
    method: "GET",
    endpoint: "/api/v1/real-estate/property",
    jsonResponse: {
      status: "success",
      data: {
        adressa_id: "SN-SBK-004",
        commune: "Sébikotane",
        quartier: "Dogar",
        plus_code: "PVM4+PC5",
        building_type: "Maison individuelle",
        verified: true
      }
    }
  },
  {
    id: "banques",
    title: "Banques & Fintechs",
    Icon: Landmark,
    problem: "Vérifier l'adresse physique d'un client (KYC) prend du temps et repose sur des justificatifs incertains.",
    solution: "Une adresse ADRESSA vérifiée sur le terrain sert de preuve de résidence immédiatement consultable.",
    impact: "Vérification en minutes plutôt qu'en jours (bénéfice visé)",
    method: "POST",
    endpoint: "/api/v1/kyc/verify-address",
    jsonResponse: {
      status: "success",
      data: {
        adressa_id: "SN-SBK-005",
        address_verified: true,
        verification_method: "terrain",
        commune: "Sébikotane",
        quartier: "Dogar"
      }
    }
  },
  {
    id: "assurances",
    title: "Assurances",
    Icon: ShieldCheck,
    problem: "Un sinistre mal localisé ralentit l'évaluation du risque et l'intervention.",
    solution: "Chaque souscription est géolocalisée précisément, pour un ciblage par zone et une intervention plus rapide.",
    impact: "Traitement des sinistres géolocalisés accéléré (bénéfice visé)",
    method: "GET",
    endpoint: "/api/v1/insurance/risk-zone",
    jsonResponse: {
      status: "success",
      data: {
        adressa_id: "SN-SBK-001",
        commune: "Sébikotane",
        quartier: "Dogar",
        zone_reference: "Dogar-01",
        coordinates: { lat: 14.7351698, lng: -17.1439253 }
      }
    }
  },
  {
    id: "telecom",
    title: "Télécommunications & Énergie",
    Icon: Wifi,
    problem: "Un technicien envoyé « dans le quartier » repart parfois sans avoir trouvé le bon domicile.",
    solution: "L'adresse ADRESSA inclut le point d'entrée exact et les consignes d'accès transmis au technicien.",
    impact: "Moins d'interventions techniciens infructueuses (bénéfice visé)",
    method: "GET",
    endpoint: "/api/v1/telecom/eligibility",
    jsonResponse: {
      status: "success",
      data: {
        adressa_id: "SN-SBK-002",
        coordinates: { lat: 14.7351691, lng: -17.1438918 },
        access_notes: "Entrée principale côté rue",
        eligible: true
      }
    }
  },
  {
    id: "services",
    title: "Services à Domicile",
    Icon: Wrench,
    problem: "Un artisan ou prestataire arrive en retard, ou ne trouve pas le bon logement.",
    solution: "L'ordre de mission intègre l'identifiant ADRESSA avec les consignes d'accès (digicode, étage, portail).",
    impact: "Ponctualité des interventions améliorée (bénéfice visé)",
    method: "GET",
    endpoint: "/api/v1/services/dispatch",
    jsonResponse: {
      status: "success",
      data: {
        adressa_id: "SN-SBK-003",
        commune: "Sébikotane",
        quartier: "Dogar",
        access_instructions: "Portail vert, sonner à l'interphone",
        coordinates: { lat: 14.7345829, lng: -17.144212 }
      }
    }
  }
];
