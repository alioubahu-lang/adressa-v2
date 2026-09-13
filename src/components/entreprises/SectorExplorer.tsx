"use client";

import { useState } from "react";
import { sectors } from "./sectorsData";
import { OperationalImpactPanel } from "./OperationalImpactPanel";

export function SectorExplorer() {
  const [selectedId, setSelectedId] = useState(sectors[0].id);
  const selected = sectors.find((s) => s.id === selectedId) ?? sectors[0];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3">
        {sectors.map((sector) => {
          const isActive = sector.id === selectedId;
          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => setSelectedId(sector.id)}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-2 border-adressa-green bg-adressa-light/60 shadow-lg scale-[1.02]"
                  : "border border-black/5 bg-white hover:border-adressa-green/40 hover:shadow-md"
              }`}
            >
              <sector.Icon
                className={isActive ? "text-adressa-green" : "text-adressa-deep/60"}
                size={24}
                strokeWidth={1.75}
              />
              <h3 className="text-sm font-bold text-adressa-deep">{sector.title}</h3>
              <p className="text-xs text-adressa-ink/60">{sector.problem}</p>
              <p className="text-xs font-semibold text-adressa-green">{sector.impact}</p>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
        <OperationalImpactPanel sector={selected} />
      </div>
    </div>
  );
}
