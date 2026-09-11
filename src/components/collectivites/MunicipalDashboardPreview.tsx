"use client";

import type { MunicipalModule } from "./modulesData";

export function MunicipalDashboardPreview({ module }: { module: MunicipalModule }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg">
      <div className="flex items-center justify-between bg-adressa-deep px-5 py-3 text-white">
        <span className="text-sm font-bold">Aperçu du tableau de bord municipal</span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">Sébikotane</span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2">
          <module.Icon className="text-adressa-green" size={22} />
          <h3 className="text-sm font-bold text-adressa-deep">{module.title}</h3>
        </div>
        <p className="mt-2 text-xs text-adressa-ink/60">{module.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {module.metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-adressa-light p-3">
              <div className="text-xl font-black text-adressa-deep">{m.value}</div>
              <div className="mt-1 text-[11px] text-adressa-ink/60">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-adressa-gray p-3 text-xs text-adressa-ink/70">
          🗺️ {module.mapNote}
        </div>

        <p className="mt-3 text-[10px] text-adressa-ink/40">
          Aperçu illustratif à des fins de démonstration — les valeurs affichées ne sont pas des statistiques
          mesurées en temps réel.
        </p>
      </div>
    </div>
  );
}
