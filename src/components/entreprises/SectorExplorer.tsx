"use client";

import { useState } from "react";
import { Landmark, Network, Truck } from "lucide-react";
import { sectors, type Sector } from "./sectorsData";
import { OperationalImpactPanel } from "./OperationalImpactPanel";

const sectorGroups = [
  { id: "logistique", label: "Logistique & Mobilité", Icon: Truck },
  { id: "finance", label: "Services Financiers & KYC", Icon: Landmark },
  { id: "infrastructure", label: "Infrastructures & Réseaux", Icon: Network }
] as const;

export function SectorExplorer() {
  const [selectedId, setSelectedId] = useState(sectors[0].id);
  const selected = sectors.find((sector) => sector.id === selectedId) ?? sectors[0];
  const activeGroup = selected.group;
  const visibleSectors = sectors.filter((sector) => sector.group === activeGroup);

  function selectGroup(group: Sector["group"]) {
    const firstSector = sectors.find((sector) => sector.group === group);
    if (firstSector) setSelectedId(firstSector.id);
  }

  return (
    <div>
      <div role="tablist" aria-label="Grands cas d’usage professionnels" className="mb-6 flex flex-wrap justify-center gap-2">
        {sectorGroups.map(({ id, label, Icon }) => {
          const active = activeGroup === id;
          return <button key={id} id={`sector-group-tab-${id}`} type="button" role="tab" tabIndex={active ? 0 : -1} aria-selected={active} aria-controls="sector-group-panel" onClick={() => selectGroup(id)} onKeyDown={(event) => {
            const currentIndex = sectorGroups.findIndex((group) => group.id === id);
            const nextIndex = event.key === "ArrowRight" ? (currentIndex + 1) % sectorGroups.length : event.key === "ArrowLeft" ? (currentIndex - 1 + sectorGroups.length) % sectorGroups.length : event.key === "Home" ? 0 : event.key === "End" ? sectorGroups.length - 1 : currentIndex;
            if (nextIndex !== currentIndex) {
              event.preventDefault();
              const nextGroup = sectorGroups[nextIndex];
              selectGroup(nextGroup.id);
              document.getElementById(`sector-group-tab-${nextGroup.id}`)?.focus();
            }
          }} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:px-4 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adressa-green focus-visible:ring-offset-2 ${active ? "border-adressa-green bg-adressa-deep text-white shadow-md" : "border-black/[0.08] bg-white text-adressa-ink/65 hover:border-adressa-green/40 hover:text-adressa-deep"}`}><Icon size={16} />{label}</button>;
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div id="sector-group-panel" role="tabpanel" aria-labelledby={`sector-group-tab-${activeGroup}`} className="grid content-start grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3">
          {visibleSectors.map((sector) => {
            const active = sector.id === selectedId;
            return (
              <button key={sector.id} type="button" aria-pressed={active} onClick={() => setSelectedId(sector.id)} className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adressa-green focus-visible:ring-offset-2 ${active ? "border-adressa-green/50 bg-white shadow-md ring-1 ring-adressa-green/20" : "border-black/[0.06] bg-white hover:border-adressa-green/35 hover:shadow-sm"}`}>
                <span className={`grid size-10 place-items-center rounded-xl ${active ? "bg-adressa-light text-adressa-green" : "bg-slate-50 text-adressa-deep/60"}`}><sector.Icon size={20} strokeWidth={1.8} /></span>
                <span className="text-sm font-bold text-adressa-deep">{sector.title}</span>
                <span className="text-xs leading-5 text-adressa-ink/60">{sector.problem}</span>
                <span className={`mt-auto pt-1 text-xs font-semibold ${active ? "text-adressa-green" : "text-adressa-ink/40"}`}>{sector.impact}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
          <OperationalImpactPanel sector={selected} />
        </div>
      </div>
    </div>
  );
}
