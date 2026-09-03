import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canEditAddress } from "@/lib/auth";
import { uploadAddressPhoto, MAX_PHOTO_SIZE_BYTES } from "@/lib/storage";

// POST /api/upload — multipart/form-data avec un champ "photo" et un champ "adresssaId"
// Réservé aux comptes pouvant créer/modifier une adresse (agents et plus).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canEditAddress((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("photo");
  const adresssaId = form.get("adresssaId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
  }
  if (typeof adresssaId !== "string" || !adresssaId) {
    return NextResponse.json({ error: "Identifiant ADRESSA manquant." }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return NextResponse.json({ error: "Photo trop volumineuse (8 Mo maximum)." }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadAddressPhoto(buffer, adresssaId.toUpperCase());
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Erreur upload photo:", err);
    return NextResponse.json({ error: "Échec de l'envoi de la photo." }, { status: 500 });
  }
}
