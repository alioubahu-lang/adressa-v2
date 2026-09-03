import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { SyncStatus } from "@/components/SyncStatus";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-adressa-gray">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
          <span className="font-semibold text-adressa-deep">Dashboard administrateur</span>
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
