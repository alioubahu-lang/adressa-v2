import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  representativeName: z.string().min(1),
  role: z.string().min(1),
  communeName: z.string().min(1),
  region: z.string().min(1),
  contact: z.string().min(1),
  estimatedPopulation: z.string().optional()
});

// POST /api/mairie-contact-request
// Journalisée dans les logs Vercel pour l'instant. Pour une vraie capture de leads,
// brancher un envoi d'email (ex. Resend) ou un enregistrement en base de données.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  console.log("[ADRESSA] Nouvelle demande de contact mairie :", parsed.data);

  return NextResponse.json({ success: true });
}
