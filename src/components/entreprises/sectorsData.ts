import type { LucideIcon } from "lucide-react";
import { Truck, ShoppingCart, Car, Building2, Landmark, ShieldCheck, Wifi, Wrench } from "lucide-react";

export type Sector = {
  id: string;
  title: string;
  Icon: LucideIcon;
  problem: string;
  solution: string;
  method: "GET" | "POST";
  endpoint: string;
  jsonResponse: Record<string, unknown>;
};

export const sectors: Sector[] = [
  {
    id: "livraison",
    title: "Livraison & Logistique",
    Icon: Truck,
    problem: "Appels répétés, livreurs perdus, retards.",
    solution: "Géocodage précis au point d'entrée + repères visuels (photo/description).",
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
    problem: "Abandon de panier au moment de la saisie d'adresse textuelle floue.",
    solution: "Widget Checkout avec autocomplétion par code ADRESSA.",
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
    problem: "Points de prise en charge imprécis pour les chauffeurs.",
    solution: "Conversion d'identifiant en coordonnées GPS de ramassage.",
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
    problem: "Difficulté d'identification et de traçabilité des biens fonciers.",
    solution: "Fiche foncière numérique liée aux références cadastrales.",
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
    problem: "Processus KYC longs pour vérifier l'adresse physique des clients.",
    solution: "Vérification d'adresse certifiée pour la conformité réglementaire.",
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
    problem: "Difficulté d'évaluation des risques locaux et lenteur d'intervention.",
    solution: "Géolocalisation des souscriptions et gestion des sinistres par zone.",
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
    problem: "Interventions techniciens échouées faute de localisation exacte.",
    solution: "Vérification d'éligibilité technique et accès bâtiment.",
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
    problem: "Retards des artisans/prestataires et consignes d'accès perdues.",
    solution: "Ordre de mission avec consignes d'accès détaillées (digicode, étage).",
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
