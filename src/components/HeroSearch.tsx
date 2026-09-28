"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  function startDemo() {
    setQuery("SN-SBK-001");
    setOpen(true);
    inputRef.current?.focus();
  }

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
    <div ref={boxRef} className="relative mt-8 w-full max-w-xl text-left">
      <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white p-2 shadow-[0_24px_60px_-24px_rgba(2,22,14,0.7)] ring-1 ring-black/5">
        <Search aria-hidden="true" className="ml-3 shrink-0 text-adressa-green" size={20} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          aria-label="Rechercher une adresse ADRESSA"
          placeholder="Entrez un identifiant : SN-SBK-001, Sébikotane, Dogar…"
          className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-adressa-ink placeholder:text-adressa-ink/40 focus:outline-none sm:text-base"
        />
        <Link
          href={query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search"}
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-adressa-deep px-4 py-3 text-sm font-semibold text-white transition hover:bg-adressa-green sm:px-5"
        >
          <span className="hidden sm:inline">Localiser</span><ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      <button
        type="button"
        onClick={startDemo}
        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-medium text-white/90 transition hover:border-white/40 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
        Essayer la démo · <span className="font-mono text-white">SN-SBK-001</span>
      </button>

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
