"use client";

import { useState } from "react";
import { AddressCard } from "@/components/AddressCard";

type Result = {
  adresssaId: string;
  commune: { name: string };
  neighborhood: { name: string };
  plusCode: string | null;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search(q: string) {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/address/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-black text-adressa-deep">Rechercher une adresse</h1>
      <p className="mt-2 text-adressa-ink/60">
        Par identifiant (SN-SBK-001), ville, quartier ou nom de rue.
      </p>

      <form
        className="mt-6 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) search(query.trim());
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SN-SBK-001, Sébikotane, Dogar…"
          className="flex-1 rounded-xl border border-black/10 px-4 py-3 focus:border-adressa-green focus:outline-none"
        />
        <button type="submit" className="btn-primary">
          Rechercher
        </button>
      </form>

      {loading && <p className="mt-8 text-adressa-ink/50">Recherche en cours…</p>}

      {!loading && searched && results.length === 0 && (
        <p className="mt-8 text-adressa-ink/50">Aucune adresse trouvée pour « {query} ».</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {results.map((r) => (
          <AddressCard
            key={r.adresssaId}
            adresssaId={r.adresssaId}
            communeName={r.commune.name}
            neighborhoodName={r.neighborhood.name}
            plusCode={r.plusCode}
          />
        ))}
      </div>
    </main>
  );
}
