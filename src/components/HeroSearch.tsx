"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Result = {
  adresssaId: string;
  commune: { name: string };
  neighborhood: { name: string };
  landmark: string | null;
};

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/address/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data.items ?? []);
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative mx-auto mt-10 w-full max-w-xl text-left">
      <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xl">
        <span className="pl-3 text-adressa-ink/40">🔎</span>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder="Entrez un identifiant : SN-SBK-001, Sébikotane, Dogar…"
          className="flex-1 bg-transparent px-1 py-3 text-adressa-ink placeholder:text-adressa-ink/40 focus:outline-none"
        />
        <Link
          href={query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search"}
          className="rounded-xl bg-adressa-deep px-5 py-3 text-sm font-semibold text-white hover:bg-adressa-green"
        >
          Localiser
        </Link>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-white text-left shadow-2xl">
          {loading && <div className="px-5 py-4 text-sm text-adressa-ink/50">Recherche en cours…</div>}

          {!loading && results.length === 0 && (
            <div className="px-5 py-4 text-sm text-adressa-ink/50">
              Aucun résultat pour « {query} ». Essayez un identifiant comme SN-SBK-001.
            </div>
          )}

          {!loading &&
            results.slice(0, 6).map((r) => (
              <Link
                key={r.adresssaId}
                href={`/a/${r.adresssaId}`}
                className="flex items-center justify-between border-b border-black/5 px-5 py-3 last:border-0 hover:bg-adressa-light"
              >
                <div>
                  <div className="text-sm font-bold text-adressa-green">{r.adresssaId}</div>
                  <div className="text-xs text-adressa-ink/60">
                    {r.commune.name} · {r.neighborhood.name}
                    {r.landmark ? ` — ${r.landmark}` : ""}
                  </div>
                </div>
                <span className="text-adressa-ink/30">→</span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
