"use client";

import { useState } from "react";

export function MairieContactForm() {
  const [representativeName, setRepresentativeName] = useState("");
  const [role, setRole] = useState("");
  const [communeName, setCommuneName] = useState("");
  const [region, setRegion] = useState("");
  const [contact, setContact] = useState("");
  const [estimatedPopulation, setEstimatedPopulation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/mairie-contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ representativeName, role, communeName, region, contact, estimatedPopulation })
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-2xl">✓</p>
        <h3 className="mt-2 text-lg font-bold text-adressa-deep">Demande envoyée</h3>
        <p className="mt-2 text-sm text-adressa-ink/60">
          Notre équipe vous recontactera pour organiser une présentation ou une démonstration.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-lg text-left">
      <h3 className="text-lg font-bold text-adressa-deep">Déployer ADRESSA dans votre commune</h3>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Nom du représentant</label>
          <input
            required
            value={representativeName}
            onChange={(e) => setRepresentativeName(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">
            Titre (Maire, Adjoint, Directeur Technique…)
          </label>
          <input
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Nom de la commune / collectivité</label>
          <input
            required
            value={communeName}
            onChange={(e) => setCommuneName(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Région / Département</label>
          <input
            required
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Téléphone / Email officiel</label>
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Population estimée (optionnel)</label>
          <input
            value={estimatedPopulation}
            onChange={(e) => setEstimatedPopulation(e.target.value)}
            placeholder="ex : 50 000"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>
      </div>

      {status === "error" && <p className="mt-3 text-sm text-red-600">Une erreur est survenue, réessayez.</p>}

      <button type="submit" disabled={status === "loading"} className="btn-primary mt-6 w-full">
        {status === "loading" ? "Envoi…" : "Solliciter une rencontre / Présentation en Conseil Municipal"}
      </button>
    </form>
  );
}
