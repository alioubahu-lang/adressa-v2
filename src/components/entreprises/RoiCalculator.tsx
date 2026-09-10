"use client";

import { useMemo, useState } from "react";

// Hypothèses indicatives, affichées à l'utilisateur — jamais présentées comme des données mesurées.
const MINUTES_SAVED_PER_TRIP = 8;
const FAILURE_RATE_WITHOUT_ADRESSA = 0.15;
const FAILURE_RATE_WITH_ADRESSA = 0.03;

export function RoiCalculator() {
  const [monthlyVolume, setMonthlyVolume] = useState(200);

  const { hoursSaved, deliveriesRescued } = useMemo(() => {
    const minutesSaved = monthlyVolume * MINUTES_SAVED_PER_TRIP;
    const rescued = Math.round(monthlyVolume * (FAILURE_RATE_WITHOUT_ADRESSA - FAILURE_RATE_WITH_ADRESSA));
    return { hoursSaved: Math.round(minutesSaved / 60), deliveriesRescued: rescued };
  }, [monthlyVolume]);

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-adressa-deep">Estimez votre impact</h3>
      <p className="mt-1 text-sm text-adressa-ink/60">
        Une estimation indicative, à ajuster selon votre activité réelle.
      </p>

      <label className="mt-6 block text-sm font-medium text-adressa-ink/70">
        Livraisons / interventions par mois : <span className="font-bold text-adressa-deep">{monthlyVolume}</span>
      </label>
      <input
        type="range"
        min={0}
        max={5000}
        step={50}
        value={monthlyVolume}
        onChange={(e) => setMonthlyVolume(Number(e.target.value))}
        className="mt-2 w-full accent-adressa-green"
      />

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-adressa-light p-4 text-center">
          <div className="text-2xl font-black text-adressa-deep">{hoursSaved} h</div>
          <div className="mt-1 text-xs text-adressa-ink/60">gagnées par mois (estimation)</div>
        </div>
        <div className="rounded-xl bg-adressa-light p-4 text-center">
          <div className="text-2xl font-black text-adressa-deep">{deliveriesRescued}</div>
          <div className="mt-1 text-xs text-adressa-ink/60">échecs évités par mois (estimation)</div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-adressa-ink/40">
        Hypothèses utilisées : {MINUTES_SAVED_PER_TRIP} min gagnées par course, taux d&apos;échec ramené de{" "}
        {Math.round(FAILURE_RATE_WITHOUT_ADRESSA * 100)}% à {Math.round(FAILURE_RATE_WITH_ADRESSA * 100)}%. Ces
        chiffres sont indicatifs et non issus d&apos;une mesure sur votre activité.
      </p>
    </div>
  );
}
