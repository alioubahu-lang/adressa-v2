"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Navigation } from "lucide-react";
import type { Sector } from "./sectorsData";
import { ApiJsonViewer } from "./ApiJsonViewer";

export function OperationalImpactPanel({ sector }: { sector: Sector }) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div id="operational-impact-panel" aria-live="polite" className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_70px_-40px_rgba(15,46,35,.5)]">
      <div className="bg-adressa-deep px-5 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Impact opérationnel</p>
        <h3 className="mt-1 flex items-center gap-2 text-base font-bold">
          <sector.Icon size={20} />
          {sector.title}
        </h3>
      </div>

      <div className="p-5">
        <div className="relative h-[158px] overflow-hidden rounded-2xl border border-emerald-900/5 bg-[#e9f2e9] p-3">
          <div aria-hidden="true" className="absolute inset-0 opacity-65" style={{ backgroundImage: "linear-gradient(27deg,transparent 46%,#fff 47%,#fff 50%,transparent 51%),linear-gradient(117deg,transparent 43%,#fff 44%,#fff 47%,transparent 48%),linear-gradient(165deg,transparent 67%,#fff 68%,#fff 70%,transparent 71%)", backgroundSize: "100px 82px,130px 110px,160px 120px" }} />
          <svg aria-hidden="true" viewBox="0 0 400 150" className="absolute inset-0 h-full w-full">
            <path d="M61 123C92 98 116 106 145 80S198 58 226 80 280 119 321 82 356 49 371 35" fill="none" stroke="#80b79a" strokeWidth="5" strokeLinecap="round" strokeDasharray="7 8" />
            <circle cx="61" cy="123" r="9" fill="#16836d" stroke="white" strokeWidth="4" />
            <circle cx="226" cy="80" r="10" fill="#16836d" stroke="white" strokeWidth="4" />
            <circle cx="321" cy="82" r="9" fill="#eca83f" stroke="white" strokeWidth="4" />
          </svg>
          <div className="relative flex items-center justify-between"><span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-adressa-deep shadow-sm">Exemple de localisation</span><span className="grid size-7 place-items-center rounded-lg bg-white/90 text-adressa-green shadow-sm"><Navigation size={14} /></span></div>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 py-2 shadow-sm">
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-adressa-green"><MapPin size={15} fill="currentColor" /></span>
            <span><span className="block text-[10px] font-black text-adressa-deep">SN-SBK-001</span><span className="block text-[8px] text-adressa-ink/55">Tanghor · Sébikotane · point d&apos;entrée</span></span>
          </div>
          <span className="absolute bottom-3 right-3 text-[8px] font-medium text-adressa-ink/45">Aperçu illustratif</span>
        </div>

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
