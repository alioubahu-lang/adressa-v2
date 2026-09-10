import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  fullName: z.string().optional(),
  companyName: z.string().min(1),
  sector: z.string().min(1),
  email: z.string().email(),
  monthlyVolume: z.string().optional(),
  message: z.string().optional()
});

// POST /api/api-access-request
// Pour l'instant, la demande est simplement journalisée côté serveur (visible dans les
// logs Vercel). Pour une vraie capture de leads en production, brancher ici un envoi
// d'email (ex. Resend, SendGrid) ou un enregistrement en base de données.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  console.log("[ADRESSA] Nouvelle demande d'accès API :", parsed.data);

  return NextResponse.json({ success: true });
}
