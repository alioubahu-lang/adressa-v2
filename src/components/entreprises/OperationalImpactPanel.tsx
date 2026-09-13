"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Sector } from "./sectorsData";
import { ApiJsonViewer } from "./ApiJsonViewer";

export function OperationalImpactPanel({ sector }: { sector: Sector }) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg">
      <div className="bg-adressa-deep px-5 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Impact opérationnel</p>
        <h3 className="mt-1 flex items-center gap-2 text-base font-bold">
          <sector.Icon size={20} />
          {sector.title}
        </h3>
      </div>

      <div className="p-5">
        <div className="rounded-xl bg-adressa-light p-4 text-center">
          <div className="text-lg font-black text-adressa-deep">{sector.impact}</div>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/40">Problème vécu</p>
            <p className="mt-1 text-adressa-ink/70">{sector.problem}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-adressa-ink/40">Solution ADRESSA</p>
            <p className="mt-1 text-adressa-ink/70">{sector.solution}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-adressa-gray p-3 text-xs text-adressa-ink/60">
          ✓ Aucune compétence technique requise — l&apos;intégration est prise en charge par notre équipe.
        </div>

        <p className="mt-3 text-[10px] text-adressa-ink/40">
          Indicateur présenté à titre illustratif du bénéfice visé, non issu d&apos;une mesure certifiée.
        </p>

        <button
          type="button"
          onClick={() => setShowTechnical((v) => !v)}
          className="mt-4 flex items-center gap-1 text-xs font-medium text-adressa-ink/40 hover:text-adressa-ink/70"
        >
          {showTechnical ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Aperçu technique (développeurs)
        </button>

        {showTechnical && (
          <div className="mt-3">
            <ApiJsonViewer sector={sector} />
          </div>
        )}
      </div>
    </div>
  );
}
