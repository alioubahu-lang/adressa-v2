import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const addresses: { adresssaId: string; updatedAt: Date }[] = await prisma.address.findMany({
    where: { status: "PUBLIE" },
    select: { adresssaId: true, updatedAt: true }
  });

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/map`, changeFrequency: "weekly", priority: 0.8 },
    ...addresses.map((a) => ({
      url: `${base}/a/${a.adresssaId}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6
    }))
  ];
}
