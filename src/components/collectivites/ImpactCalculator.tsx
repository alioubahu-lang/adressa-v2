"use client";

import { useMemo, useState } from "react";

// Hypothèses indicatives, affichées à l'utilisateur — jamais présentées comme des données mesurées.
const FISCAL_INCREASE_MIN = 25;
const FISCAL_INCREASE_MAX = 40;
const RESCUE_TIME_SAVED_MINUTES = 12;
const AVERAGE_HOUSEHOLD_SIZE = 5;

export function ImpactCalculator() {
  const [population, setPopulation] = useState(50000);

  const { fiscalIncrease, addressable } = useMemo(() => {
    const ratio = (population - 10000) / (500000 - 10000);
    const fiscal = Math.round(FISCAL_INCREASE_MIN + ratio * (FISCAL_INCREASE_MAX - FISCAL_INCREASE_MIN));
    const addressableCount = Math.round(population / AVERAGE_HOUSEHOLD_SIZE);
    return { fiscalIncrease: fiscal, addressable: addressableCount };
  }, [population]);

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-adressa-deep">Estimez l&apos;impact pour votre commune</h3>
      <p className="mt-1 text-sm text-adressa-ink/60">
        Une estimation indicative, à ajuster selon la réalité de votre territoire.
      </p>

      <label className="mt-6 block text-sm font-medium text-adressa-ink/70">
        Nombre d&apos;habitants : <span className="font-bold text-adressa-deep">{population.toLocaleString("fr-FR")}</span>
      </label>
      <input
        type="range"
        min={10000}
        max={500000}
        step={5000}
        value={population}
        onChange={(e) => setPopulation(Number(e.target.value))}
        className="mt-2 w-full accent-adressa-green"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-adressa-light p-4 text-center">
          <div className="text-2xl font-black text-adressa-deep">+{fiscalIncrease}%</div>
          <div className="mt-1 text-xs text-adressa-ink/60">hausse du recouvrement fiscal (estimation)</div>
        </div>
        <div className="rounded-xl bg-adressa-light p-4 text-center">
          <div className="text-2xl font-black text-adressa-deep">-{RESCUE_TIME_SAVED_MINUTES} min</div>
          <div className="mt-1 text-xs text-adressa-ink/60">temps d&apos;intervention des secours (estimation)</div>
        </div>
        <div className="rounded-xl bg-adressa-light p-4 text-center">
          <div className="text-2xl font-black text-adressa-deep">{addressable.toLocaleString("fr-FR")}</div>
          <div className="mt-1 text-xs text-adressa-ink/60">logements/commerces adressables (estimation)</div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-adressa-ink/40">
        Hypothèses utilisées : hausse du recouvrement fiscal entre +{FISCAL_INCREASE_MIN}% et +{FISCAL_INCREASE_MAX}%
        selon la taille de la commune, gain de {RESCUE_TIME_SAVED_MINUTES} minutes en moyenne pour les secours, et un
        foyer moyen de {AVERAGE_HOUSEHOLD_SIZE} personnes pour l&apos;estimation des adresses. Ces chiffres sont
        indicatifs et non issus d&apos;une mesure sur votre territoire.
      </p>
    </div>
  );
}
