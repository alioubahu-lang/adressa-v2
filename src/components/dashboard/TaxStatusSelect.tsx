"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  { value: "NON_RENSEIGNE", label: "Non renseigné" },
  { value: "IMPOSE", label: "Imposé" },
  { value: "EXONERE", label: "Exonéré" },
  { value: "IMPAYE", label: "Impayé" }
];

// Badges colorés alignés avec la colonne "Statut adresse" : fond + texte, pas juste le texte.
const styles: Record<string, string> = {
  NON_RENSEIGNE: "bg-amber-50 text-amber-800 border-2 border-amber-300 ring-1 ring-amber-200",
  IMPOSE: "bg-green-100 text-green-700 border border-green-200",
  EXONERE: "bg-sky-100 text-sky-700 border border-sky-200",
  IMPAYE: "bg-red-100 text-red-700 border border-red-200"
};

export type TaxStatusMeta = { lastModifiedAt: string | null; lastModifiedBy: string | null };

export function TaxStatusSelect({
  adresssaId,
  initialValue,
  meta
}: {
  adresssaId: string;
  initialValue: string;
  meta?: TaxStatusMeta;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function handleChange(newValue: string) {
    setValue(newValue);
    setSaving(true);
    const res = await fetch(`/api/address/${adresssaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taxStatus: newValue })
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  const tooltip =
    meta?.lastModifiedAt && meta?.lastModifiedBy
      ? `Modifié le ${new Date(meta.lastModifiedAt).toLocaleDateString("fr-FR")} par ${meta.lastModifiedBy}`
      : "Pas encore modifié";

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      title={tooltip}
      className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${styles[value] ?? ""}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
