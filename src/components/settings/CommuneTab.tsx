"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Commune = {
  id: string;
  name: string;
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

export function CommuneTab({ communes }: { communes: Commune[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(communes[0]?.id ?? "");
  const selected = communes.find((c) => c.id === selectedId) ?? communes[0];

  const [name, setName] = useState(selected?.name ?? "");
  const [contactEmail, setContactEmail] = useState(selected?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(selected?.contactPhone ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(selected?.logoUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSelectCommune(id: string) {
    const c = communes.find((c) => c.id === id);
    setSelectedId(id);
    setName(c?.name ?? "");
    setContactEmail(c?.contactEmail ?? "");
    setContactPhone(c?.contactPhone ?? "");
    setLogoPreview(c?.logoUrl ?? null);
    setLogoFile(null);
    setSuccess(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    let logoUrl = selected.logoUrl;
    if (logoFile) {
      const form = new FormData();
      form.append("logo", logoFile);
      form.append("communeId", selected.id);
      const uploadRes = await fetch("/api/upload-commune-logo", { method: "POST", body: form });
      if (uploadRes.ok) {
        logoUrl = (await uploadRes.json()).url;
      } else {
        setError("Le logo n'a pas pu être envoyé — les autres informations vont quand même être enregistrées.");
      }
    }

    const res = await fetch(`/api/communes/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logoUrl, contactEmail: contactEmail || null, contactPhone: contactPhone || null })
    });

    setSaving(false);
    if (!res.ok) {
      setError((prev) => prev ?? "Erreur lors de l'enregistrement.");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  if (!selected) {
    return <p className="text-sm text-adressa-ink/50">Aucune commune enregistrée pour l&apos;instant.</p>;
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-adressa-deep">Configuration de la mairie / commune</h2>

      {communes.length > 1 && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Commune</label>
          <select value={selectedId} onChange={(e) => handleSelectCommune(e.target.value)} className="w-full max-w-xs rounded-lg border border-black/10 px-3 py-2">
            {communes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Logo</label>
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="Logo de la commune" className="mb-2 h-20 w-20 rounded-lg object-contain" />
          ) : (
            <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-lg bg-adressa-gray text-xs text-adressa-ink/40">
              Aucun logo
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Nom de la commune</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Email de contact</label>
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Téléphone de contact</label>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-adressa-green">Informations enregistrées.</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
