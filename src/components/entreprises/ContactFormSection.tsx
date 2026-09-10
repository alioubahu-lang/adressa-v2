"use client";

import { useState } from "react";
import { sectors } from "./sectorsData";

export function ContactFormSection() {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState(sectors[0].title);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/api-access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, companyName, email, sector, message })
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
          Notre équipe vous recontactera pour la mise en place de votre accès API.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-lg text-left">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Nom complet</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

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
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Message ou besoin (optionnel)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>
      </div>

      {status === "error" && <p className="mt-3 text-sm text-red-600">Une erreur est survenue, réessayez.</p>}

      <button type="submit" disabled={status === "loading"} className="btn-primary mt-6 w-full">
        {status === "loading" ? "Envoi…" : "Envoyer ma demande d'accès API"}
      </button>

      <a href="#apercu-api" className="btn-secondary mt-3 block w-full text-center">
        Consulter la documentation API
      </a>
    </form>
  );
}
