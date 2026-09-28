"use client";

import { useMemo, useState } from "react";
import { Building2, Clock3, TrendingUp, Users } from "lucide-react";

type CommuneType = "urbaine" | "rurale" | "chef-lieu";

const profiles: Record<CommuneType, { label: string; fiscalAdjustment: number; rescueMinutes: number; addressableRate: number; note: string }> = {
  urbaine: { label: "Urbaine", fiscalAdjustment: 4, rescueMinutes: 15, addressableRate: 0.92, note: "Hypothèse : densité bâtie et activité commerciale plus fortes." },
  rurale: { label: "Rurale", fiscalAdjustment: -3, rescueMinutes: 9, addressableRate: 0.82, note: "Hypothèse : habitat plus dispersé et distances d’intervention plus longues." },
  "chef-lieu": { label: "Chef-lieu", fiscalAdjustment: 2, rescueMinutes: 12, addressableRate: 0.88, note: "Hypothèse : concentration des services et flux administratifs." }
};

const FISCAL_INCREASE_MIN = 25;
const FISCAL_INCREASE_MAX = 40;
const AVERAGE_HOUSEHOLD_SIZE = 5;

export function ImpactCalculator() {
  const [population, setPopulation] = useState(50000);
  const [communeType, setCommuneType] = useState<CommuneType>("urbaine");
  const profile = profiles[communeType];

  const { fiscalIncrease, addressable } = useMemo(() => {
    const ratio = (population - 10000) / (500000 - 10000);
    const baseFiscal = FISCAL_INCREASE_MIN + ratio * (FISCAL_INCREASE_MAX - FISCAL_INCREASE_MIN);
    const fiscal = Math.max(15, Math.min(50, Math.round(baseFiscal + profile.fiscalAdjustment)));
    const addressableCount = Math.round((population / AVERAGE_HOUSEHOLD_SIZE) * profile.addressableRate);
    return { fiscalIncrease: fiscal, addressable: addressableCount };
  }, [population, profile]);

  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm">
      <div className="bg-gradient-to-r from-adressa-deep to-[#205942] px-6 py-6 text-white sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-100"><TrendingUp size={13} /> Simulateur indicatif</span>
        <h2 className="mt-3 text-2xl font-black tracking-tight">Estimez l&apos;impact pour votre commune</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Ajustez la population et le profil territorial pour obtenir des ordres de grandeur adaptés.</p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_.72fr]">
          <div>
            <label htmlFor="commune-population" className="flex items-center justify-between gap-3 text-sm font-semibold text-adressa-deep">
              <span className="inline-flex items-center gap-2"><Users size={16} className="text-adressa-green" /> Nombre d&apos;habitants</span>
              <span className="text-lg font-black">{population.toLocaleString("fr-FR")}</span>
            </label>
            <input id="commune-population" type="range" min={10000} max={500000} step={5000} value={population} onChange={(e) => setPopulation(Number(e.target.value))} className="mt-4 w-full accent-adressa-green" />
            <div className="mt-1 flex justify-between text-[10px] text-adressa-ink/45"><span>10 000</span><span>500 000 habitants</span></div>
          </div>
          <div>
            <label htmlFor="commune-type" className="mb-2 block text-sm font-semibold text-adressa-deep">Typologie de la commune</label>
            <select id="commune-type" value={communeType} onChange={(e) => setCommuneType(e.target.value as CommuneType)} className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-medium text-adressa-deep outline-none focus:border-adressa-green focus:ring-2 focus:ring-adressa-green/15">
              {Object.entries(profiles).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}
            </select>
            <p className="mt-2 text-[10px] leading-4 text-adressa-ink/50">{profile.note}</p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-900/5 bg-amber-50/70 p-4"><span className="grid size-9 place-items-center rounded-xl bg-white text-amber-700"><TrendingUp size={18} /></span><div className="mt-4 text-2xl font-black text-adressa-deep">+{fiscalIncrease}%</div><p className="mt-1 text-xs leading-5 text-adressa-ink/60">hausse potentielle du recouvrement fiscal</p></div>
          <div className="rounded-2xl border border-sky-900/5 bg-sky-50/70 p-4"><span className="grid size-9 place-items-center rounded-xl bg-white text-sky-700"><Clock3 size={18} /></span><div className="mt-4 text-2xl font-black text-adressa-deep">-{profile.rescueMinutes} min</div><p className="mt-1 text-xs leading-5 text-adressa-ink/60">gain indicatif sur le repérage des secours</p></div>
          <div className="rounded-2xl border border-emerald-900/5 bg-emerald-50/70 p-4"><span className="grid size-9 place-items-center rounded-xl bg-white text-emerald-700"><Building2 size={18} /></span><div className="mt-4 text-2xl font-black text-adressa-deep">{addressable.toLocaleString("fr-FR")}</div><p className="mt-1 text-xs leading-5 text-adressa-ink/60">logements potentiellement adressables</p></div>
        </div>
        <p className="mt-5 rounded-xl bg-[#f7f9f7] p-3 text-[10px] leading-5 text-adressa-ink/50">Projections de travail, non garanties et non issues de mesures sur votre territoire. Calcul indicatif : potentiel fiscal de +{FISCAL_INCREASE_MIN} à +{FISCAL_INCREASE_MAX}% selon la population, ajusté selon la typologie ; nombre d&apos;adresses estimé avec un foyer moyen de {AVERAGE_HOUSEHOLD_SIZE} personnes et une couverture théorique de {Math.round(profile.addressableRate * 100)}%.</p>
      </div>
    </div>
  );
}
