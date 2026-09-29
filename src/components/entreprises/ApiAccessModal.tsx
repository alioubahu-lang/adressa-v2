"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { sectors } from "./sectorsData";

export function ApiAccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState(sectors[0].title);
  const [email, setEmail] = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "unavailable">("idle");

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/api-access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, sector, email, monthlyVolume })
      });
      setStatus(res.ok ? "success" : res.status === 503 ? "unavailable" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-8 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="enterprise-demo-title" className="relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-adressa-ink/40 hover:text-adressa-ink"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        {status === "success" ? (
          <div className="py-6 text-center">
            <p className="text-2xl">✓</p>
            <h3 id="enterprise-demo-title" className="mt-2 text-lg font-bold text-adressa-deep">Demande envoyée</h3>
            <p className="mt-2 text-sm text-adressa-ink/60">
              Notre équipe vous recontactera pour la mise en place de votre accès API.
            </p>
            <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 id="enterprise-demo-title" className="text-lg font-bold text-adressa-deep">Planifier une démonstration métier</h3>
            <p className="mt-1 text-sm text-adressa-ink/60">
              Présentez votre contexte ; notre équipe vous recontactera pour cadrer la démonstration et les modalités d&apos;accès de test.
            </p>

            {status === "unavailable" && (
              <p role="alert" className="mt-3 text-sm text-amber-800">
                Ce formulaire n&apos;est pas encore activé. Votre demande n&apos;a pas été transmise.
              </p>
            )}
            {status === "error" && <p role="alert" className="mt-3 text-sm text-red-600">Une erreur est survenue, réessayez.</p>}

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Nom de l&apos;entreprise</label>
                <input
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-black/10 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Secteur d&apos;activité</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-lg border border-black/10 px-3 py-2"
                >
                  {sectors.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Email professionnel</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-black/10 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-adressa-ink/70">
                  Volume mensuel d&apos;adresses traitées
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  placeholder="ex. 200"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-adressa-green focus:ring-2 focus:ring-adressa-green/15"
                />
              </div>
            </div>

            {status === "error" && (
              <p className="mt-3 text-sm text-red-600">Une erreur est survenue, réessayez.</p>
            )}

            <button type="submit" disabled={status === "loading"} className="btn-primary mt-6 w-full">
              {status === "loading" ? "Envoi…" : "Demander la démonstration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
