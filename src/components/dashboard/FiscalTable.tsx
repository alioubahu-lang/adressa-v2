"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Search } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { TaxStatusSelect, type TaxStatusMeta } from "./TaxStatusSelect";

export type FiscalRow = {
  id: string;
  adresssaId: string;
  status: string;
  taxStatus: string;
  neighborhood: { name: string };
  commune: { name: string };
  taxMeta: TaxStatusMeta;
};

const taxFilterOptions = [
  { value: "", label: "Tous les statuts fiscaux" },
  { value: "NON_RENSEIGNE", label: "Non renseigné" },
  { value: "IMPOSE", label: "Imposé" },
  { value: "EXONERE", label: "Exonéré" },
  { value: "IMPAYE", label: "Impayé" }
];

const bulkOptions = [
  { value: "IMPOSE", label: "Imposé" },
  { value: "EXONERE", label: "Exonéré" },
  { value: "IMPAYE", label: "Impayé" },
  { value: "NON_RENSEIGNE", label: "Non renseigné" }
];

type TaxCounts = Record<string, number>;

export function FiscalTable({ rows, initialTaxCounts }: { rows: FiscalRow[]; initialTaxCounts: TaxCounts }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [taxFilter, setTaxFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tableRows, setTableRows] = useState(rows);
  const [applying, setApplying] = useState(false);
  const [taxCounts, setTaxCounts] = useState(initialTaxCounts);

  function updateTaxCount(previous: string, next: string, amount = 1) {
    if (previous === next) return;
    setTaxCounts((current) => ({
      ...current,
      [previous]: Math.max(0, (current[previous] ?? 0) - amount),
      [next]: (current[next] ?? 0) + amount
    }));
  }

  function exportHref(format: "csv" | "geojson") {
    const params = new URLSearchParams({ format, ids: filtered.map((row) => row.id).join(",") });
    if (query.trim()) params.set("q", query.trim());
    if (neighborhoodFilter) params.set("neighborhood", neighborhoodFilter);
    if (taxFilter) params.set("taxStatus", taxFilter);
    return `/api/export?${params.toString()}`;
  }

  const neighborhoods = useMemo(
    () => Array.from(new Set(tableRows.map((r) => r.neighborhood.name))).sort(),
    [tableRows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tableRows.filter((r) => {
      const matchesQuery =
        !q ||
        r.adresssaId.toLowerCase().includes(q) ||
        r.neighborhood.name.toLowerCase().includes(q) ||
        r.commune.name.toLowerCase().includes(q);
      const matchesNeighborhood = !neighborhoodFilter || r.neighborhood.name === neighborhoodFilter;
      const matchesTax = !taxFilter || r.taxStatus === taxFilter;
      return matchesQuery && matchesNeighborhood && matchesTax;
    });
  }, [tableRows, query, neighborhoodFilter, taxFilter]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected((prev) => {
      if (allFilteredSelected) return new Set();
      return new Set(filtered.map((r) => r.id));
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function applyBulkFor(taxStatus: string) {
    if (selected.size === 0) return;
    setApplying(true);
    try {
      const res = await fetch("/api/address/bulk-tax-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), taxStatus })
      });
      if (res.ok) {
        const ids = new Set(selected);
        const changes = tableRows.filter((row) => ids.has(row.id) && row.taxStatus !== taxStatus);
        for (const row of changes) updateTaxCount(row.taxStatus, taxStatus);
        setTableRows((current) => current.map((row) => ids.has(row.id) ? { ...row, taxStatus } : row));
        setSelected(new Set());
        router.refresh();
      }
    } finally {
      setApplying(false);
    }
  }

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["IMPOSE", "Imposées", "text-green-700"],
          ["IMPAYE", "Impayées", "text-red-700"],
          ["EXONERE", "Exonérées", "text-sky-700"],
          ["NON_RENSEIGNE", "Non renseignées", "text-amber-700"]
        ].map(([key, label, color]) => (
          <div key={key} className="card text-center">
            <div className={`text-2xl font-black ${color}`}>{taxCounts[key] ?? 0}</div>
            <div className="mt-1 text-xs text-adressa-ink/60">{label}</div>
          </div>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-adressa-ink/50">Compteurs à l’échelle de la commune, actualisés après chaque modification.</p>
        <div className="flex gap-2">
          <a href={exportHref("csv")} className="btn-secondary text-sm">Export CSV</a>
          <a href={exportHref("geojson")} className="btn-secondary text-sm">Export GeoJSON</a>
        </div>
      </div>
      {/* Avertissement légal */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Le statut fiscal est renseigné manuellement par les services municipaux — ADRESSA n&apos;a pas accès à
          votre système de recouvrement et n&apos;émet aucun avis d&apos;imposition.
        </p>
      </div>

      {/* Barre d'outils */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-adressa-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par ID, rue ou quartier…"
            className="w-full rounded-lg border border-black/10 py-2 pl-9 pr-3 text-sm focus:border-adressa-green focus:outline-none"
          />
        </div>
        <select
          value={neighborhoodFilter}
          onChange={(e) => setNeighborhoodFilter(e.target.value)}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">Tous les quartiers</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={taxFilter}
          onChange={(e) => setTaxFilter(e.target.value)}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          {taxFilterOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Barre d'action groupée */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-adressa-green/15 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <span className="text-sm font-semibold text-adressa-deep">{selected.size} sélectionnée(s)</span>
          <span className="text-sm text-adressa-ink/70">Passer la sélection en :</span>
          {bulkOptions.map((o) => (
            <button key={o.value} type="button" onClick={() => void applyBulkFor(o.value)} disabled={applying} className="btn-secondary text-sm disabled:opacity-50">
              {o.label}
            </button>
          ))}
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-sm text-adressa-ink/50 underline">
            Annuler
          </button>
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-adressa-light text-adressa-deep">
            <tr>
              <th className="w-12 px-3 py-3 text-center">
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3">ID ADRESSA</th>
              <th className="px-4 py-3">Commune</th>
              <th className="px-4 py-3">Quartier</th>
              <th className="px-4 py-3">Statut adresse</th>
              <th className="px-4 py-3">Statut fiscal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-black/5">
                <td className="px-3 py-3 text-center align-middle">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-adressa-green">{r.adresssaId}</td>
                <td className="px-4 py-3">{r.commune.name}</td>
                <td className="px-4 py-3">{r.neighborhood.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <TaxStatusSelect adresssaId={r.adresssaId} initialValue={r.taxStatus} meta={r.taxMeta} onSaved={(value) => { updateTaxCount(r.taxStatus, value); setTableRows((current) => current.map((row) => row.id === r.id ? { ...row, taxStatus: value } : row)); }} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-adressa-ink/40">
                  Aucune adresse ne correspond à ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
