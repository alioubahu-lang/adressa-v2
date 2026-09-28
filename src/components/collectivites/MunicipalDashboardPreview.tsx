"use client";

import { Activity, ArrowUpRight, MapPin } from "lucide-react";
import type { MunicipalModule } from "./modulesData";

export function MunicipalDashboardPreview({ module }: { module: MunicipalModule }) {
  return (
    <div id="municipal-dashboard-panel" role="tabpanel" aria-live="polite" aria-labelledby={`module-tab-${module.id}`} className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-[0_24px_70px_-40px_rgba(15,46,35,.5)]">
      <div className="flex items-center justify-between gap-3 bg-adressa-deep px-4 py-3.5 text-white sm:px-5">
        <div><p className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-100">Espace mairie · aperçu</p><p className="mt-1 text-sm font-bold">Tableau de bord municipal</p></div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold">Sébikotane</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${module.tone.card}`}><module.Icon className={module.tone.icon} size={20} strokeWidth={2} /></span>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-black text-adressa-deep">{module.title}</h3><span className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${module.tone.badge}`}>Module actif</span></div><p className="mt-1 text-xs leading-5 text-adressa-ink/60">{module.description}</p></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {module.metrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-black/[0.04] bg-[#f8faf8] p-3"><div className="text-xl font-black tracking-tight text-adressa-deep">{metric.value}</div><div className="mt-1 text-[10px] leading-4 text-adressa-ink/60">{metric.label}</div></div>)}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[150px] overflow-hidden rounded-2xl bg-[#e9f2e9] p-3">
            <div aria-hidden="true" className="absolute inset-0 opacity-55" style={{ backgroundImage: "linear-gradient(32deg,transparent 47%,#fff 48%,#fff 51%,transparent 52%),linear-gradient(120deg,transparent 43%,#fff 44%,#fff 47%,transparent 48%)", backgroundSize: "72px 65px,90px 76px" }} />
            <div className="relative flex items-center justify-between"><p className="text-[9px] font-bold text-adressa-deep">Carte des interventions</p><MapPin size={13} className={module.tone.icon} /></div>
            <div className="absolute left-[18%] top-[37%] size-3 rounded-full border-2 border-white bg-emerald-600 shadow" />
            <div className={`absolute left-[53%] top-[58%] size-3 rounded-full border-2 border-white shadow ${module.tone.bar}`} />
            <div className="absolute left-[75%] top-[31%] size-3 rounded-full border-2 border-white bg-emerald-600 shadow" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[8px] text-adressa-ink/60"><Activity size={10} className={module.tone.icon} />{module.coverageLabel}</div>
          </div>
          <div className="rounded-2xl border border-black/[0.06] p-3">
            <div className="flex items-center justify-between"><p className="text-[9px] font-bold text-adressa-deep">Répartition par secteur</p><ArrowUpRight size={13} className="text-adressa-ink/35" /></div>
            <div className="mt-3 flex h-[82px] items-end gap-2 border-b border-l border-black/10 px-2 pb-1">
              {module.bars.map((height, index) => <div key={`${module.id}-bar-${index}`} className={`flex-1 rounded-t-md opacity-80 ${module.tone.bar}`} style={{ height: `${height}%` }} />)}
            </div>
            <div className="mt-2 flex justify-between text-[7px] text-adressa-ink/40"><span>Nord</span><span>Centre</span><span>Sud</span></div>
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-[#f7f9f7] px-3 py-2.5 text-[10px] leading-4 text-adressa-ink/65">{module.mapNote}</p>
        <p className="mt-2 text-[9px] leading-4 text-adressa-ink/40">Maquette illustrative : valeurs et visuels présentés à titre d&apos;exemple, non issus de statistiques mesurées en temps réel.</p>
      </div>
    </div>
  );
}
