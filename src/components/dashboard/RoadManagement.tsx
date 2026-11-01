"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowUpRight, Building2, Check, ChevronDown, Clock3,
  MapPin, Plus, Route, Search, X
} from "lucide-react";

type Road = {
  id: string;
  code: string;
  name: string;
  neighborhoodId: string;
  neighborhood: string;
  commune: string;
  addressCount: number;
  lengthKm: number | null;
  status: string;
};
type Neighborhood = { id: string; name: string; commune: string };
type RoadManagementProps = { initialRoads: Road[]; neighborhoods: Neighborhood[] };
type RoadForm = { name: string; code: string; neighborhoodId: string; lengthKm: string };

const emptyForm: RoadForm = { name: "", code: "", neighborhoodId: "", lengthKm: "" };

export function RoadManagement({ initialRoads, neighborhoods }: RoadManagementProps) {
  const [roads, setRoads] = useState(initialRoads);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [activeRoadId, setActiveRoadId] = useState<string | null>(null);
  const [form, setForm] = useState<RoadForm>(emptyForm);
  const [error, setError] = useState("");

  const activeRoad = roads.find((road) => road.id === activeRoadId) ?? null;
  const filteredRoads = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr-FR");
    if (!normalized) return roads;
    return roads.filter((road) => `${road.code} ${road.name} ${road.neighborhood}`.toLocaleLowerCase("fr-FR").includes(normalized));
  }, [roads, query]);
  const linkedAddresses = roads.reduce((sum, road) => sum + road.addressCount, 0);

  function openAdd() {
    setForm({ ...emptyForm, neighborhoodId: neighborhoods[0]?.id ?? "" });
    setActiveRoadId(null);
    setError("");
    setModal("add");
  }

  function openEdit(road: Road) {
    setActiveRoadId(road.id);
    setForm({ name: road.name, code: road.code, neighborhoodId: road.neighborhoodId, lengthKm: road.lengthKm?.toString() ?? "" });
    setError("");
    setModal("edit");
  }

  function saveRoad(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return setError("Saisissez le nom de l’axe routier.");
    if (!form.neighborhoodId) return setError("Sélectionnez un quartier.");
    const neighborhood = neighborhoods.find((item) => item.id === form.neighborhoodId);
    if (!neighborhood) return setError("Le quartier sélectionné est introuvable.");
    const length = form.lengthKm ? Number(form.lengthKm.replace(",", ".")) : null;
    if (length !== null && (!Number.isFinite(length) || length <= 0)) return setError("La longueur doit être un nombre supérieur à zéro.");

    if (modal === "edit" && activeRoad) {
      setRoads((current) => current.map((road) => road.id === activeRoad.id ? {
        ...road, name, code: form.code.trim() || road.code, neighborhoodId: neighborhood.id,
        neighborhood: neighborhood.name, commune: neighborhood.commune, lengthKm: length
      } : road));
    } else {
      const code = form.code.trim() || `SN-SBK-R${String(Date.now()).slice(-5)}`;
      const newRoad: Road = {
        id: `local-${Date.now()}`, code, name, neighborhoodId: neighborhood.id,
        neighborhood: neighborhood.name, commune: neighborhood.commune,
        addressCount: 0, lengthKm: length, status: "À cartographier"
      };
      setRoads((current) => [newRoad, ...current]);
    }
    setModal(null);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[36px] border-white/5" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              <Route size={14} /> PILOTE VOIRIE · SÉBIKOTANE
            </span>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">ADRESSA ROUTE</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/80 sm:text-base">
              Cartographiez les axes routiers et reliez chaque voie aux adresses de la commune.
            </p>
          </div>
          <button onClick={openAdd} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-950 shadow-sm transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <Plus size={18} /> Ajouter un axe routier
          </button>
        </div>
      </section>

      <section aria-label="Statistiques des axes routiers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={<Route size={19} />} label="Total axes routiers" value={roads.length.toLocaleString("fr-FR")} note="Axes recensés dans ADRESSA" tone="emerald" />
        <StatCard icon={<MapPin size={19} />} label="Commune active" value="Sébikotane" note="Quartier pilote : Tanghor" tone="blue" />
        <StatCard icon={<Activity size={19} />} label="Statut du pilote" value="En déploiement" note={`${linkedAddresses} adresses reliées aux axes`} tone="amber" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Axes routiers</h2>
            <p className="mt-1 text-sm text-slate-500">Consultez les voies recensées et les adresses qui leur sont rattachées.</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un nom ou un code…" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5">Code route</th><th className="px-4 py-3.5">Nom de l’axe</th><th className="px-4 py-3.5">Zone / quartier</th><th className="px-4 py-3.5">Longueur</th><th className="px-4 py-3.5">Adresses liées</th><th className="px-4 py-3.5">Statut</th><th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoads.map((road) => (
                <tr key={road.id} className="transition hover:bg-emerald-50/30">
                  <td className="px-6 py-4"><span className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-xs font-bold text-emerald-800">{road.code}</span></td>
                  <td className="px-4 py-4"><span className="font-semibold text-slate-800">{road.name}</span><span className="mt-1 block text-xs text-slate-400">{road.commune}</span></td>
                  <td className="px-4 py-4 text-sm text-slate-600">{road.neighborhood}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{road.lengthKm ? `${road.lengthKm.toLocaleString("fr-FR")} km` : <span className="text-slate-400">À mesurer</span>}</td>
                  <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700"><Building2 size={15} className="text-slate-400" />{road.addressCount}</span></td>
                  <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><span className="size-1.5 rounded-full bg-amber-500" />{road.status}</span></td>
                  <td className="px-6 py-4"><div className="flex justify-end gap-2">
                    <button onClick={() => { setActiveRoadId(road.id); setModal("view"); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700">Voir</button>
                    <button onClick={() => openEdit(road)} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800">Éditer</button>
                  </div></td>
                </tr>
              ))}
              {filteredRoads.length === 0 && <tr><td colSpan={7} className="px-6 py-14 text-center"><div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400"><Route size={20} /></div><p className="font-semibold text-slate-700">Aucun axe trouvé</p><p className="mt-1 text-sm text-slate-500">Modifiez votre recherche ou ajoutez un nouvel axe.</p></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-xs text-slate-500 sm:px-6">
          <span>{filteredRoads.length} axe{filteredRoads.length > 1 ? "s" : ""} affiché{filteredRoads.length > 1 ? "s" : ""}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> Données de la commune</span>
        </div>
      </section>

      {modal && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="road-modal-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div><span className="mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Route size={20} /></span><h2 id="road-modal-title" className="text-xl font-bold text-slate-900">{modal === "add" ? "Ajouter un axe routier" : modal === "edit" ? "Modifier l’axe" : "Détail de l’axe"}</h2><p className="mt-1 text-sm text-slate-500">Commune pilote de Sébikotane</p></div>
            <button onClick={() => setModal(null)} aria-label="Fermer" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={19} /></button>
          </div>
          {modal === "view" && activeRoad ? <div className="space-y-3">
            <DetailRow label="Code route" value={activeRoad.code} /><DetailRow label="Nom de l’axe" value={activeRoad.name} /><DetailRow label="Zone / quartier" value={activeRoad.neighborhood} /><DetailRow label="Commune" value={activeRoad.commune} /><DetailRow label="Longueur" value={activeRoad.lengthKm ? `${activeRoad.lengthKm} km` : "À mesurer"} /><DetailRow label="Adresses liées" value={String(activeRoad.addressCount)} /><DetailRow label="Statut" value={activeRoad.status} />
            <button onClick={() => openEdit(activeRoad)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800">Modifier cet axe <ArrowUpRight size={16} /></button>
          </div> : <form onSubmit={saveRoad} className="space-y-4">
            <Field label="Nom de l’axe *"><input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex. Route de Tanghor" className={inputClass} /></Field>
            <Field label="Code route"><input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="Généré automatiquement si vide" className={inputClass} /></Field>
            <Field label="Zone / quartier *"><div className="relative"><select required value={form.neighborhoodId} onChange={(event) => setForm({ ...form, neighborhoodId: event.target.value })} className={`${inputClass} appearance-none pr-10`}><option value="">Choisir un quartier</option>{neighborhoods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" /></div></Field>
            <Field label="Longueur estimée (km)"><input type="number" min="0.01" step="0.01" value={form.lengthKm} onChange={(event) => setForm({ ...form, lengthKm: event.target.value })} placeholder="Ex. 2,5" className={inputClass} /></Field>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModal(null)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Annuler</button><button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800"><Check size={17} />{modal === "add" ? "Ajouter l’axe" : "Enregistrer"}</button></div>
            <p className="text-xs leading-5 text-slate-400">La longueur reste une estimation et pourra être ajustée après le relevé cartographique.</p>
          </form>}
        </section>
      </div>}
    </div>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm text-slate-500">{label}</span><span className="text-right text-sm font-semibold text-slate-800">{value}</span></div>;
}

function StatCard({ icon, label, value, note, tone }: { icon: React.ReactNode; label: string; value: string; note: string; tone: "emerald" | "blue" | "amber" }) {
  const tones = { emerald: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700" };
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`mb-4 grid size-10 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{value}</p><p className="mt-1.5 text-xs text-slate-500">{note}</p></article>;
}
