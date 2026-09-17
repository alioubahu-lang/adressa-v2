import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export const dynamic = "force-dynamic";

type UserRow = { id: string; name: string; email: string; role: string; commune: { id: string; name: string } | null };
type CommuneRow = { id: string; name: string; logoUrl: string | null; contactEmail: string | null; contactPhone: string | null };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;
  const canManageSettings = hasPermission(role, "settings:manage");

  let users: UserRow[] = [];
  let communes: CommuneRow[] = [];

  if (canManageSettings) {
    [users, communes] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, commune: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.commune.findMany({
        select: { id: true, name: true, logoUrl: true, contactEmail: true, contactPhone: true },
        orderBy: { name: "asc" }
      })
    ]);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-adressa-deep">Paramètres</h1>
      <p className="mb-6 text-sm text-adressa-ink/60">
        Gérez les utilisateurs, les rôles des mairies et les configurations système.
      </p>

      <SettingsTabs
        canManageSettings={canManageSettings}
        users={users}
        communes={communes}
        currentUserId={(session?.user as any)?.id}
        currentUserName={session?.user?.name ?? undefined}
        currentUserEmail={session?.user?.email ?? undefined}
      />
    </div>
  );
}
