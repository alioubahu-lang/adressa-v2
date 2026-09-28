import { NextResponse } from "next/server";

// Aucune destination de traitement n'est configurée. Ne pas conserver les données
// personnelles dans les journaux ni confirmer une demande qui n'a pas été transmise.
export async function POST() {
  return NextResponse.json(
    { error: "Ce formulaire n'est pas encore activé. Votre demande n'a pas été transmise." },
    { status: 503 }
  );
}
