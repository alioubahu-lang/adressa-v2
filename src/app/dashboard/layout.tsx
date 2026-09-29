import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { SyncStatus } from "@/components/SyncStatus";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AgentNetworkStatus } from "@/components/agent/TerrainActions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const role = (session.user as any)?.role;
  const isAgent = role === "AGENT";
  const userId = (session.user as any)?.id as string | undefined;
  const agentProfile = isAgent && userId ? await prisma.user.findUnique({ where: { id: userId }, select: { name: true, profilePhotoUrl: true, commune: { select: { name: true } } } }) : null;
  const agentName = agentProfile?.name || session.user?.name || "Agent ADRESSA";
  const initials = agentName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex min-h-screen bg-adressa-gray">
      <Sidebar role={(session.user as any)?.role} />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" aria-label="Revenir à l’accueil ADRESSA" title="Retour à l’accueil" className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-adressa-green md:hidden">
            <Image src="/logo-icon-512.png" alt="" aria-hidden="true" width={36} height={36} />
          </Link>
          <span className="hidden font-semibold text-adressa-deep md:inline">{isAgent ? "Espace Agent de Terrain" : "Dashboard administrateur"}</span>
          <div className="flex items-center gap-4">
            <SyncStatus />
            {isAgent ? <div className="flex items-center gap-3">
              <span role="img" aria-label={`Photo de ${agentName}`} className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-adressa-light text-sm font-bold text-adressa-deep ${agentProfile?.profilePhotoUrl ? "bg-cover bg-center" : ""}`} style={agentProfile?.profilePhotoUrl ? { backgroundImage: `url("${agentProfile.profilePhotoUrl}")` } : undefined}>{!agentProfile?.profilePhotoUrl && initials}</span>
              <span className="text-right"><span className="block max-w-[145px] truncate text-xs font-semibold text-adressa-deep sm:max-w-none sm:text-sm">{agentName} · AGENT DE TERRAIN</span><span className="block text-[11px] text-adressa-ink/60 sm:text-xs">Zone : {agentProfile?.commune?.name ?? "À affecter"}</span></span>
              <span className="hidden text-xs font-semibold text-emerald-700 lg:flex"><AgentNetworkStatus /></span>
            </div> : <span className="text-sm text-adressa-ink/60">{session.user?.name} · {role}</span>}
          </div>
        </header>
        <main className={isAgent ? "p-4 sm:p-6" : "p-6"}>{children}</main>
      </div>
    </div>
  );
}
