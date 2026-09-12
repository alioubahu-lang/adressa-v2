"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Download } from "lucide-react";

type Commune = { id: string; name: string };

const statusOptions = [
  { value: "", label: "Tous les statuts" },
  { value: "BROUILLON", label: "Brouillon" },
  { value: "COLLECTE", label: "Collecté" },
  { value: "A_VERIFIER", label: "En attente" },
  { value: "VERIFIE", label: "Vérifié" },
  { value: "PUBLIE", label: "Publié" }
];

export function AddressesToolbar({ communes }: { communes: Commune[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: q || null });
  }

  const exportParams = new URLSearchParams();
  exportParams.set("format", "csv");
  if (searchParams.get("q")) exportParams.set("q", searchParams.get("q")!);
  if (searchParams.get("commune")) exportParams.set("communeId", searchParams.get("commune")!);
  if (searchParams.get("status")) exportParams.set("status", searchParams.get("status")!);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearchSubmit} className="min-w-[220px] flex-1">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-adressa-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par ID ou quartier…"
            className="w-full rounded-lg border border-black/10 py-2 pl-9 pr-3 text-sm focus:border-adressa-green focus:outline-none"
          />
        </div>
      </form>

      <select
        defaultValue={searchParams.get("commune") ?? ""}
        onChange={(e) => updateParams({ commune: e.target.value || null })}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm"
      >
        <option value="">Toutes les communes</option>
        {communes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateParams({ status: e.target.value || null })}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm"
      >
        {statusOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <a href={`/api/export?${exportParams.toString()}`} className="btn-secondary whitespace-nowrap text-sm">
        <Download size={16} className="mr-2 inline-block" />
        Exporter CSV
      </a>
    </div>
  );
}
