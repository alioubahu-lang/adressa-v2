"use client";

import { useState } from "react";
import { Banknote, Clock3, PackageCheck, TrendingUp } from "lucide-react";

const MINUTES_SAVED_PER_TRIP = 8;
const FAILURE_RATE_WITHOUT_ADRESSA = 0.15;
const FAILURE_RATE_WITH_ADRESSA = 0.03;
const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export function RoiCalculator() {
  const [monthlyVolume, setMonthlyVolume] = useState(200);
  const [costPerTrip, setCostPerTrip] = useState("8000");

  const hoursSaved = Math.round((monthlyVolume * MINUTES_SAVED_PER_TRIP) / 60);
  const failuresAvoided = Math.round(monthlyVolume * (FAILURE_RATE_WITHOUT_ADRESSA - FAILURE_RATE_WITH_ADRESSA));
  const costValue = Math.min(50000, Math.max(500, Number(costPerTrip) || 500));
  const monthlySavings = failuresAvoided * costValue;

  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_24px_70px_-42px_rgba(15,46,35,.45)]">
      <div className="bg-gradient-to-r from-adressa-deep to-[#205942] px-6 py-6 text-white sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-100"><TrendingUp size={13} /> Simulateur ROI</span>
        <h2 className="mt-3 text-2xl font-black tracking-tight">Estimez vos gains opérationnels</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Modifiez le volume mensuel et le coût moyen d&apos;une course pour simuler l&apos;impact potentiel d&apos;ADRESSA.</p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-2">
          <div>
            <label htmlFor="monthly-volume" className="flex items-center justify-between gap-3 text-sm font-semibold text-adressa-deep"><span>Livraisons / interventions mensuelles</span><span className="text-lg font-black">{formatNumber(monthlyVolume)}</span></label>
            <input id="monthly-volume" type="range" min={50} max={5000} step={50} value={monthlyVolume} onChange={(event) => setMonthlyVolume(Number(event.target.value))} className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-adressa-green" />
            <div className="mt-1 flex justify-between text-[10px] text-adressa-ink/45"><span>50</span><span>5 000 par mois</span></div>
          </div>
          <div>
            <label htmlFor="cost-per-trip" className="mb-2 block text-sm font-semibold text-adressa-deep">Coût moyen d&apos;une course / livraison</label>
            <div className="relative">
              <input id="cost-per-trip" type="number" min={500} max={50000} step={500} value={costPerTrip} onChange={(event) => setCostPerTrip(event.target.value)} onBlur={() => setCostPerTrip(String(costValue))} className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 pr-16 text-base font-bold text-adressa-deep outline-none transition focus:border-adressa-green focus:ring-2 focus:ring-adressa-green/15" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-adressa-ink/45">FCFA</span>
            </div>
            <input aria-label="Ajuster le coût moyen de la course" type="range" min={500} max={50000} step={500} value={costValue} onChange={(event) => setCostPerTrip(event.target.value)} className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-adressa-green" />
            <div className="mt-1 flex justify-between text-[10px] text-adressa-ink/45"><span>500 FCFA</span><span>50 000 FCFA</span></div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-900/5 bg-sky-50/70 p-4"><span className="grid size-9 place-items-center rounded-xl bg-white text-sky-700"><Clock3 size={18} /></span><div className="mt-4 text-2xl font-black text-adressa-deep">{formatNumber(hoursSaved)} h</div><p className="mt-1 text-xs leading-5 text-adressa-ink/60">temps potentiellement gagné par mois</p></div>
          <div className="rounded-2xl border border-emerald-900/5 bg-emerald-50/70 p-4"><span className="grid size-9 place-items-center rounded-xl bg-white text-adressa-green"><PackageCheck size={18} /></span><div className="mt-4 text-2xl font-black text-adressa-deep">{formatNumber(failuresAvoided)}</div><p className="mt-1 text-xs leading-5 text-adressa-ink/60">tentatives infructueuses potentiellement évitées</p></div>
          <div className="rounded-2xl border border-amber-900/5 bg-amber-50/70 p-4"><span className="grid size-9 place-items-center rounded-xl bg-white text-amber-700"><Banknote size={18} /></span><div className="mt-4 text-xl font-black text-adressa-deep sm:text-2xl">{formatNumber(monthlySavings)} FCFA</div><p className="mt-1 text-xs leading-5 text-adressa-ink/60">économies mensuelles estimées</p></div>
        </div>
        <p className="mt-5 rounded-xl bg-[#f7f9f7] p-3 text-[10px] leading-5 text-adressa-ink/50">Simulation illustrative : {MINUTES_SAVED_PER_TRIP} minutes gagnées par intervention et taux d&apos;échec hypothétique de {Math.round(FAILURE_RATE_WITHOUT_ADRESSA * 100)}% ramené à {Math.round(FAILURE_RATE_WITH_ADRESSA * 100)}%. Le gain FCFA correspond aux tentatives infructueuses évitées multipliées par le coût moyen saisi. Ces hypothèses ne sont pas des résultats mesurés et doivent être ajustées à votre activité.</p>
      </div>
    </div>
  );
}
