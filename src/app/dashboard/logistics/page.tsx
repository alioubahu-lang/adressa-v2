import { prisma } from "@/lib/prisma";
import { RoadManagement } from "@/components/dashboard/RoadManagement";

export const dynamic = "force-dynamic";

export default async function LogisticsDashboardPage() {
  const [streets, neighborhoods] = await Promise.all([
    prisma.street.findMany({
      orderBy: [{ neighborhood: { name: "asc" } }, { name: "asc" }],
      include: {
        neighborhood: { include: { commune: true } },
        _count: { select: { addresses: true } }
      }
    }),
    prisma.neighborhood.findMany({
      where: { commune: { name: { contains: "Sébikotane", mode: "insensitive" } } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, commune: { select: { name: true } } }
    })
  ]);

  const roads = streets.map((street) => ({
    id: street.id,
    code: street.code ?? `ROUTE-${street.id.slice(-5).toUpperCase()}`,
    name: street.name,
    neighborhoodId: street.neighborhoodId,
    neighborhood: street.neighborhood.name,
    commune: street.neighborhood.commune.name,
    addressCount: street._count.addresses,
    // La longueur et le statut ne sont pas encore des champs du modèle Street.
    lengthKm: null as number | null,
    status: "À cartographier"
  }));

  return (
    <RoadManagement
      initialRoads={roads}
      neighborhoods={neighborhoods.map((item) => ({ ...item, commune: item.commune.name }))}
    />
  );
}
