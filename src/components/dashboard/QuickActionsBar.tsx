"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Download, Bell, ChevronDown } from "lucide-react";

export function QuickActionsBar({ communes }: { communes: { id: string; name: string }[] }) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-adressa-ink/60">
        <span>Commune active :</span>
        <div className="relative">
          <select className="appearance-none rounded-lg border border-black/10 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-adressa-deep">
            {communes.length === 0 && <option>Sébikotane</option>}
            {communes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-adressa-ink/40" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2 text-adressa-ink/50 hover:bg-adressa-light hover:text-adressa-deep"
          aria-label="Notifications"
          title="Notifications (à venir)"
        >
          <Bell size={18} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            className="btn-secondary text-sm"
          >
            <Download size={16} className="mr-2 inline-block" />
            Exporter
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-lg border border-black/5 bg-white shadow-lg">
              <a href="/api/export?format=csv" className="block px-4 py-2 text-sm hover:bg-adressa-light">
                CSV
              </a>
              <a href="/api/export?format=geojson" className="block px-4 py-2 text-sm hover:bg-adressa-light">
                GeoJSON
              </a>
            </div>
          )}
        </div>

        <Link href="/dashboard/addresses/new" className="btn-primary text-sm">
          <Plus size={16} className="mr-2 inline-block" />
          Créer une adresse
        </Link>
      </div>
    </div>
  );
}
