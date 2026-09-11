"use client";

import { useState } from "react";
import { municipalModules } from "./modulesData";
import { MunicipalDashboardPreview } from "./MunicipalDashboardPreview";

export function ModulesExplorer() {
  const [selectedId, setSelectedId] = useState(municipalModules[0].id);
  const selected = municipalModules.find((m) => m.id === selectedId) ?? municipalModules[0];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3">
        {municipalModules.map((module) => {
          const isActive = module.id === selectedId;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => setSelectedId(module.id)}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-2 border-adressa-green bg-adressa-light/60 shadow-lg scale-[1.02]"
                  : "border border-black/5 bg-white hover:border-adressa-green/40 hover:shadow-md"
              }`}
            >
              <module.Icon className={isActive ? "text-adressa-green" : "text-adressa-deep/60"} size={24} strokeWidth={1.75} />
              <h3 className="text-sm font-bold text-adressa-deep">{module.title}</h3>
              <p className="text-xs text-adressa-ink/60">{module.description}</p>
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
