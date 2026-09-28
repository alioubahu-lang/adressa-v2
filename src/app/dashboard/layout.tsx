import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { SyncStatus } from "@/components/SyncStatus";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-adressa-gray">
      <Sidebar role={(session.user as any)?.role} />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" aria-label="Revenir à l’accueil ADRESSA" title="Retour à l’accueil" className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-adressa-green md:hidden">
            <Image src="/logo-icon-512.png" alt="" aria-hidden="true" width={36} height={36} />
          </Link>
          <span className="hidden font-semibold text-adressa-deep md:inline">Dashboard administrateur</span>
          <div className="flex items-center gap-4">
            <SyncStatus />
            <span className="text-sm text-adressa-ink/60">
              {session.user?.name} · {(session.user as any)?.role}
            </span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
