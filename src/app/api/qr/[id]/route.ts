import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

// GET /api/qr/SN-SBK-001?format=png|svg
// Le QR pointe toujours vers ADRESSA (/a/{id}), jamais directement vers Google Maps,
// afin qu'ADRESSA reste maître de ce qui est affiché et puisse faire évoluer la
// destination sans jamais changer la plaque physique.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") === "svg" ? "svg" : "png";

  const adresssaId = params.id.toUpperCase();
  const qrCode = await prisma.qrCode.findUnique({ where: { code: adresssaId } });
  if (!qrCode || !qrCode.active) {
    return NextResponse.json({ error: "QR introuvable ou inactif." }, { status: 404 });
  }

  const origin = req.nextUrl.origin;
  const targetUrl = `${origin}${qrCode.targetUrl}`;

  if (format === "svg") {
    const svg = await QRCode.toString(targetUrl, { type: "svg", margin: 1, color: { dark: "#0F2E23" } });
    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" }
    });
  }

  const buffer = await QRCode.toBuffer(targetUrl, { margin: 1, width: 512, color: { dark: "#0F2E23" } });
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" }
  });
}
