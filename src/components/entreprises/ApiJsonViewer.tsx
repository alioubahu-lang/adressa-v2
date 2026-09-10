"use client";

import { useState } from "react";
import type { Sector } from "./sectorsData";

export function ApiJsonViewer({ sector }: { sector: Sector }) {
  const [copied, setCopied] = useState(false);
  const jsonText = JSON.stringify(sector.jsonResponse, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // pas grave si le presse-papier est indisponible
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1210] shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-xs font-bold ${
              sector.method === "GET" ? "bg-sky-500/20 text-sky-300" : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {sector.method}
          </span>
          <code className="text-xs text-white/70">{sector.endpoint}</code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-medium text-white/50 hover:text-white"
        >
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
      <pre className="max-h-96 overflow-auto p-4 text-xs leading-relaxed text-emerald-300">
        <code>{jsonText}</code>
      </pre>
      <div className="border-t border-white/10 bg-white/5 px-4 py-2 text-[11px] text-white/40">
        Exemple illustratif — l&apos;accès à l&apos;API réelle s&apos;obtient via une demande d&apos;intégration.
      </div>
    </div>
  );
}
