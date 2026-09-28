"use client";

import { useState } from "react";
import { municipalModules } from "./modulesData";
import { MunicipalDashboardPreview } from "./MunicipalDashboardPreview";

export function ModulesExplorer() {
  const [selectedId, setSelectedId] = useState(municipalModules[0].id);
  const selected = municipalModules.find((m) => m.id === selectedId) ?? municipalModules[0];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div role="tablist" aria-label="Modules municipaux" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3">
        {municipalModules.map((module) => {
          const isActive = module.id === selectedId;
          return (
            <button
              key={module.id}
              id={`module-tab-${module.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="municipal-dashboard-panel"
              type="button"
              onClick={() => setSelectedId(module.id)}
              className={`group flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adressa-green focus-visible:ring-offset-2 ${
                isActive
                  ? "border-adressa-green/50 bg-white shadow-md ring-1 ring-adressa-green/25"
                  : "border-black/[0.06] bg-white hover:border-black/10 hover:shadow-sm"
              }`}
            >
              <span className={`grid size-10 place-items-center rounded-xl ${module.tone.card}`}><module.Icon className={module.tone.icon} size={20} strokeWidth={1.9} /></span>
              <h3 className="text-sm font-bold text-adressa-deep">{module.title}</h3>
              <p className="text-xs leading-5 text-adressa-ink/60">{module.description}</p>
              <span className={`mt-1 text-[10px] font-bold ${isActive ? module.tone.icon : "text-adressa-ink/35"}`}>{isActive ? "Aperçu affiché" : "Voir l’aperçu"}</span>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
        <MunicipalDashboardPreview module={selected} />
      </div>
    </div>
  );
}
