import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageAgentProfiles, type Role } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { MAX_PHOTO_SIZE_BYTES, uploadAgentProfilePhoto } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;
  if (!canManageAgentProfiles(role)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });

  const agent = await prisma.user.findFirst({ where: { id: params.id, role: "AGENT" }, select: { id: true } });
  if (!agent) return NextResponse.json({ error: "Agent introuvable." }, { status: 404 });

  const form = await req.formData();
  const photo = form.get("photo");
  if (!(photo instanceof File)) return NextResponse.json({ error: "Choisissez une photo à envoyer." }, { status: 400 });
  if (!photo.type.startsWith("image/")) return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
  if (photo.size > MAX_PHOTO_SIZE_BYTES) return NextResponse.json({ error: "La photo ne doit pas dépasser 8 Mo." }, { status: 413 });

  try {
    const photoUrl = await uploadAgentProfilePhoto(Buffer.from(await photo.arrayBuffer()), agent.id);
    await prisma.user.update({ where: { id: agent.id }, data: { profilePhotoUrl: photoUrl } });
    return NextResponse.json({ profilePhotoUrl: photoUrl });
  } catch (error) {
    console.error("Erreur d’envoi de la photo de profil:", error);
    return NextResponse.json({ error: "La photo n’a pas pu être enregistrée." }, { status: 500 });
  }
}
