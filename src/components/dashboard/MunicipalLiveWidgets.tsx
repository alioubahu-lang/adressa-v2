"use client";

import { useEffect, useState } from "react";
import { Clock3, CloudSun, MapPin, ShieldCheck } from "lucide-react";

function getDakarTime() {
  const now = new Date();
  return {
    time: new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Dakar", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now),
    date: new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Dakar", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now)
  };
}

export function MunicipalLiveWidgets({ commune }: { commune: string }) {
  const [dakarTime, setDakarTime] = useState<{ time: string; date: string } | null>(null);

  useEffect(() => {
    const update = () => setDakarTime(getDakarTime());
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section aria-label="Informations rapides" className="grid gap-3 md:grid-cols-3">
      <article className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
        <div aria-hidden="true" className="absolute -right-3 -top-3 text-amber-300/50"><CloudSun size={86} strokeWidth={1.2} className="animate-[spin_28s_linear_infinite]" /></div>
        <div className="relative">
          <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-amber-900/60">Météo locale · aperçu</p><span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold text-amber-800"><MapPin size={11} />{commune}</span></div>
          <p className="mt-3 text-xl font-black text-slate-900">31 °C <span className="text-sm font-semibold text-slate-600">· Ensoleillé</span></p>
          <p className="mt-1 text-xs text-slate-500">Valeur illustrative — météo réelle à connecter.</p>
        </div>
      </article>

      <article className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
        <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-sky-900/60">Heure officielle</p><span className="grid size-9 place-items-center rounded-xl bg-white text-sky-700"><Clock3 size={18} /></span></div>
        <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-slate-900">{dakarTime?.time ?? "--:--:--"}</p>
        <p className="mt-1 truncate text-xs capitalize text-slate-500">{dakarTime?.date ?? "Heure de Dakar"} · GMT</p>
      </article>

      <article className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
        <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-emerald-900/60">Système ADRESSA</p><span className="grid size-9 place-items-center rounded-xl bg-white text-emerald-700"><ShieldCheck size={19} /></span></div>
        <p className="mt-1 flex items-center gap-2 text-xl font-black text-slate-900"><span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" /></span>Opérationnel <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-emerald-800">V2</span></p>
        <p className="mt-1 text-xs text-slate-500">Connexion sécurisée · données communales</p>
      </article>
    </section>
  );
}
