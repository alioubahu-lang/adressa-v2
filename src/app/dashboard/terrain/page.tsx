import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, Compass, Database, Home, ListChecks, MapPin, MessageSquareText, Plus, WifiOff } from "lucide-react";
import { TerrainActions, AgentNetworkStatus } from "@/components/agent/TerrainActions";
import AgentTerrainMap from "@/components/agent/AgentTerrainMap";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const pendingStatuses = ["BROUILLON", "COLLECTE", "A_VERIFIER"] as const;

function statusInfo(status: string) {
  if (status === "BROUILLON") return { label: "À corriger", classes: "bg-rose-50 text-rose-700", icon: AlertCircle };
  if (status === "A_VERIFIER") return { label: "À vérifier", classes: "bg-amber-50 text-amber-800", icon: Clock3 };
  return { label: "En attente", classes: "bg-amber-50 text-amber-800", icon: Clock3 };
}

export default async function AgentTerrainPage({ searchParams }: { searchParams?: { queued?: string; created?: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session) redirect("/login");
  if (user?.role !== "AGENT") redirect("/dashboard");

  const savedUser = user.id ? await prisma.user.findUnique({ where: { id: user.id }, select: { communeId: true, name: true } }) : null;
  const communeId = savedUser?.communeId ?? null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const commonWhere = { createdById: user.id, communeId: communeId ?? "__no_assignment__" };
  const [pending, toCorrect, validatedHistory, addresses, latestComments, commune] = await Promise.all([
    prisma.address.count({ where: { ...commonWhere, verified: false, status: { in: [...pendingStatuses] } } }),
    prisma.address.count({ where: { ...commonWhere, verified: false, status: "BROUILLON" } }),
    prisma.addressHistory.findMany({
      where: { address: commonWhere, createdAt: { gte: startOfMonth }, action: "MODIFICATION_STATUS", newValue: { in: ["VERIFIE", "PUBLIE"] } },
      select: { addressId: true },
      distinct: ["addressId"]
    }),
    prisma.address.findMany({
      where: { ...commonWhere, verified: false, status: { in: [...pendingStatuses] } },
      select: { id: true, adresssaId: true, latitude: true, longitude: true, status: true, createdAt: true, landmark: true,
        neighborhood: { select: { name: true } }, commune: { select: { name: true } } },
      orderBy: { createdAt: "desc" }, take: 50
    }),
    prisma.addressComment.findMany({
      where: { address: { ...commonWhere, verified: false, status: { in: [...pendingStatuses] } } },
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, message: true, authorName: true, createdAt: true, address: { select: { adresssaId: true } } }
    }),
    communeId ? prisma.commune.findUnique({ where: { id: communeId }, select: { name: true } }) : null
  ]);

  const mapAddresses = addresses.map((address) => ({
    id: address.id,
    code: address.adresssaId,
    latitude: address.latitude,
    longitude: address.longitude,
    status: address.status,
    landmark: address.landmark,
    neighborhood: address.neighborhood.name
  }));

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 pb-24 md:pb-8">
      {searchParams?.queued && <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950"><WifiOff size={18} />Saisie conservée sur cet appareil. Elle sera synchronisée au retour du réseau.</div>}
      {searchParams?.created && <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"><CheckCircle2 size={18} />Votre saisie a été transmise pour validation.</div>}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#073d31] via-[#0c5b43] to-[#0e8060] p-5 text-white shadow-lg sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"><Compass size={14} /> Espace Agent de Terrain</div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Bonjour {savedUser?.name?.split(" ")[0] ?? "agent"}, prêt pour le terrain&nbsp;?</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Créez des adresses et suivez uniquement vos saisies en cours, dans votre zone de collecte.</p>
          </div>
          <Link href="/dashboard/addresses/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-adressa-deep shadow transition hover:bg-emerald-50"><Plus size={18} />Nouvelle adresse</Link>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-sm text-white/80">
          <span className="inline-flex items-center gap-2"><MapPin size={15} />Zone : <strong className="text-white">{commune?.name ?? "À affecter"}</strong></span>
          <AgentNetworkStatus />
          <span className="inline-flex items-center gap-2"><Database size={15} />Vos brouillons restent disponibles hors ligne</span>
        </div>
      </section>

      <section aria-label="Mes indicateurs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Adresses en attente de validation" value={pending} detail="Vos saisies non publiées" Icon={Clock3} tone="amber" />
        <MetricCard label="À corriger" value={toCorrect} detail="Brouillons à reprendre" Icon={AlertCircle} tone="rose" />
        <MetricCard label="Validées ce mois" value={validatedHistory.length} detail="Confirmées par l’administration" Icon={CheckCircle2} tone="green" />
      </section>

      <TerrainActions />

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div id="mes-saisies" className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-4 sm:px-5">
            <div><h2 className="font-bold text-adressa-deep">Mes saisies à traiter</h2><p className="mt-1 text-xs text-adressa-ink/55">Uniquement les adresses non validées de votre zone</p></div>
            <Link href="/dashboard/addresses/new" className="text-sm font-semibold text-adressa-green hover:underline">Nouvelle saisie +</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-adressa-light/70 text-xs uppercase tracking-wide text-adressa-deep/70"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Quartier / repère</th><th className="px-4 py-3">Date de saisie</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
              <tbody>{addresses.map((address) => {
                const status = statusInfo(address.status);
                const Icon = status.icon;
                return <tr key={address.id} className="border-t border-black/5 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-adressa-green">{address.adresssaId}</td>
                  <td className="px-4 py-3"><span className="block font-medium text-adressa-deep">{address.commune.name} · {address.neighborhood.name}</span><span className="text-xs text-adressa-ink/55">{address.landmark || "Repère à compléter"}</span></td>
                  <td className="whitespace-nowrap px-4 py-3 text-adressa-ink/70">{address.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}><Icon size={13} />{status.label}</span></td>
                  <td className="px-4 py-3 text-right"><Link href={`/dashboard/addresses/${encodeURIComponent(address.adresssaId)}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-adressa-green/20 px-3 py-2 text-xs font-bold text-adressa-green hover:bg-adressa-light">{address.status === "BROUILLON" ? "Corriger" : "Voir / éditer"}<ArrowRight size={13} /></Link></td>
                </tr>;
              })}
              {!addresses.length && <tr><td colSpan={5} className="px-4 py-10 text-center"><span className="mx-auto grid size-11 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={21} /></span><p className="mt-3 font-semibold text-adressa-deep">Aucune saisie en attente</p><p className="mt-1 text-sm text-adressa-ink/55">Vos prochaines collectes apparaîtront ici.</p></td></tr>}</tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-5"><div><h2 className="font-bold text-adressa-deep">Repérage terrain</h2><p className="mt-1 text-xs text-adressa-ink/55">Sébikotane et vos points temporaires</p></div><span className="inline-flex items-center gap-1.5 text-[11px] text-adressa-ink/55"><span className="size-2 rounded-full bg-sky-500" />Vous <span className="size-2 rounded-full bg-amber-400" />Attente <span className="size-2 rounded-full bg-rose-500" />À corriger</span></div>
          <div className="h-[340px] border-y border-black/5"><AgentTerrainMap addresses={mapAddresses} /></div>
          <div className="grid grid-cols-2 divide-x divide-black/5 px-4 py-3 text-xs text-adressa-ink/65"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-sky-500" />Position GPS en direct</span><span className="pl-3">{addresses.length} point{addresses.length !== 1 ? "s" : ""} à traiter</span></div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SuggestionCard Icon={CheckCircle2} title="Formulaire guidé" text="Une collecte par étapes : position, bâtiment, commerce et photos." />
        <SuggestionCard Icon={WifiOff} title="Mode hors ligne" text="Les saisies et photos restent sur cet appareil puis se synchronisent au retour du réseau." />
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-adressa-deep"><MessageSquareText size={19} className="text-adressa-green" /><h3 className="font-bold">Commentaires de l’administration</h3></div>{latestComments.length ? <ul className="mt-3 space-y-3">{latestComments.map((comment) => <li key={comment.id} className="rounded-xl bg-adressa-light/60 p-3"><Link href={`/dashboard/addresses/${encodeURIComponent(comment.address.adresssaId)}/edit`} className="text-xs font-bold text-adressa-green hover:underline">{comment.address.adresssaId}</Link><p className="mt-1 text-sm leading-5 text-adressa-ink/80">{comment.message}</p><p className="mt-2 text-[11px] text-adressa-ink/50">{comment.authorName} · {comment.createdAt.toLocaleDateString("fr-FR")}</p></li>)}</ul> : <p className="mt-2 text-sm leading-5 text-adressa-ink/60">Aucune remarque pour le moment. L’administration pourra vous laisser des consignes directement sur une saisie.</p>}</div>
      </section>

      <nav aria-label="Navigation terrain" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-black/10 bg-white/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <Link href="/dashboard/terrain" className="flex flex-col items-center gap-1 py-1 text-xs font-semibold text-adressa-green"><Home size={18} />Mon espace</Link>
        <Link href="/dashboard/addresses/new" className="flex flex-col items-center gap-1 py-1 text-xs text-adressa-ink/70"><Plus size={18} />Nouvelle adresse</Link>
        <Link href="#mes-saisies" className="flex flex-col items-center gap-1 py-1 text-xs text-adressa-ink/70"><ListChecks size={18} />Mes saisies</Link>
      </nav>
    </div>
  );
}

function MetricCard({ label, value, detail, Icon, tone }: { label: string; value: number; detail: string; Icon: typeof Clock3; tone: "amber" | "rose" | "green" }) {
  const colors = { amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-700", green: "bg-emerald-50 text-emerald-700" };
  return <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><span className="text-sm font-medium leading-5 text-adressa-ink/65">{label}</span><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${colors[tone]}`}><Icon size={19} /></span></div><div className="mt-3 text-3xl font-black tracking-tight text-adressa-deep">{value}</div><p className="mt-1 text-xs text-adressa-ink/50">{detail}</p></article>;
}

function SuggestionCard({ Icon, title, text }: { Icon: typeof CheckCircle2; title: string; text: string }) {
  return <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"><span className="grid size-10 place-items-center rounded-xl bg-adressa-light text-adressa-green"><Icon size={19} /></span><h3 className="mt-3 font-bold text-adressa-deep">{title}</h3><p className="mt-1 text-sm leading-5 text-adressa-ink/60">{text}</p></article>;
}

