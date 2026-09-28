"use client";

import { Calendar, FileDown, MapPin } from "lucide-react";

export function TerritoryPreview() {
  return (
    <div className="w-full rounded-3xl border border-white/15 bg-white p-3 text-adressa-deep shadow-2xl sm:p-4">
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-adressa-green">Vue communale</p>
          <p className="mt-1 text-sm font-black">Sébikotane · Sénégal</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-800 sm:text-[10px]">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Aperçu cartographique
        </span>
      </div>
      <div className="relative h-[220px] overflow-hidden rounded-2xl border border-emerald-900/5 bg-[#e8f0e8] sm:h-[270px]">
        <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(28deg,transparent 47%,#fff 48%,#fff 51%,transparent 52%),linear-gradient(112deg,transparent 43%,#fff 44%,#fff 47%,transparent 48%),linear-gradient(165deg,transparent 64%,#fff 65%,#fff 67%,transparent 68%)", backgroundSize: "130px 105px,160px 135px,210px 150px" }} />
        <svg aria-hidden="true" viewBox="0 0 520 270" className="absolute inset-0 h-full w-full">
          <path d="M25 50 115 20 205 42 290 16 385 42 489 25 505 83 465 119 489 168 438 223 340 237 260 214 165 247 73 208 34 138Z" fill="#d3e7d8" stroke="#91b9a0" strokeWidth="2" />
          <path d="M30 95 137 74 210 91 306 58 421 87 492 73M45 160 151 135 247 155 345 119 473 149M111 35 127 218M223 39 240 224M354 35 330 223M441 39 414 217" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <path d="M34 138 73 208 165 247 260 214 340 237 438 223 489 168" fill="none" stroke="#57a57c" strokeWidth="2" strokeDasharray="5 6" />
          <path d="M59 66 116 45 161 56 149 101 88 116 49 97Z" fill="#82c59b" fillOpacity=".72" />
          <path d="M278 73 351 51 405 67 392 111 320 127 267 107Z" fill="#f2c876" fillOpacity=".78" />
          <path d="M145 154 208 140 251 163 238 201 174 215 129 190Z" fill="#8ec5a1" fillOpacity=".75" />
          <path d="M354 157 414 139 459 157 445 196 391 210 345 187Z" fill="#f2c876" fillOpacity=".78" />
          <circle cx="169" cy="114" r="13" fill="#fff" />
          <circle cx="169" cy="114" r="7" fill="#0f766e" />
          <circle cx="312" cy="180" r="13" fill="#fff" />
          <circle cx="312" cy="180" r="7" fill="#f59e0b" />
          <circle cx="411" cy="105" r="13" fill="#fff" />
          <circle cx="411" cy="105" r="7" fill="#0f766e" />
          <circle cx="103" cy="177" r="13" fill="#fff" />
          <circle cx="103" cy="177" r="7" fill="#0f766e" />
        </svg>
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-2.5 py-2 shadow-sm backdrop-blur">
          <span className="grid size-8 place-items-center rounded-lg bg-adressa-light text-adressa-green"><MapPin size={16} /></span>
          <span><span className="block text-[9px] font-bold">Projet pilote</span><span className="block text-[8px] text-adressa-ink/60">Tanghor · Sébikotane</span></span>
        </div>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-xl border border-white/80 bg-white/90 px-2.5 py-2 text-[8px] font-medium text-adressa-ink/70 shadow-sm sm:text-[9px]">
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-emerald-600" /> Adressé</span>
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-amber-500" /> À vérifier</span>
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-slate-400" /> À inventorier</span>
        </div>
        <span className="absolute bottom-3 right-3 rounded-lg border border-white/80 bg-white/90 px-2 py-1 text-[8px] text-adressa-ink/55 shadow-sm">Carte de démonstration</span>
      </div>
      <p className="px-1 pt-2 text-[9px] leading-4 text-adressa-ink/45">Visualisation illustrative — les zones et statuts présentés ne constituent pas des données communales mesurées.</p>
    </div>
  );
}

export function CollectivitesHero() {
  return (
    <div className="flex flex-wrap gap-3">
      <a href="#contact-mairie" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-adressa-deep shadow-lg transition hover:-translate-y-0.5 hover:bg-adressa-light">
        <Calendar size={18} className="mr-2" aria-hidden="true" /> Demander une démonstration Mairie
      </a>
      <a href="/adressa-brochure.pdf" download className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
        <FileDown size={19} className="mr-2" aria-hidden="true" /> Télécharger la brochure institutionnelle
      </a>
    </div>
  );
}
