import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";
import { uploadCommuneLogo, MAX_PHOTO_SIZE_BYTES } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;
  if (!hasPermission(role, "settings:manage")) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("logo");
  const communeId = form.get("communeId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun logo reçu." }, { status: 400 });
  }
  if (typeof communeId !== "string" || !communeId) {
    return NextResponse.json({ error: "Commune manquante." }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return NextResponse.json({ error: "Logo trop volumineux (8 Mo maximum)." }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadCommuneLogo(buffer, communeId);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Erreur upload logo mairie:", err);
    return NextResponse.json({ error: "Échec de l'envoi du logo." }, { status: 500 });
  }
}
