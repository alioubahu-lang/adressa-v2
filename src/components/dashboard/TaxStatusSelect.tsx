"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  { value: "NON_RENSEIGNE", label: "Non renseigné" },
  { value: "IMPOSE", label: "Imposé" },
  { value: "EXONERE", label: "Exonéré" },
  { value: "IMPAYE", label: "Impayé" }
];

const colors: Record<string, string> = {
  NON_RENSEIGNE: "text-adressa-ink/50",
  IMPOSE: "text-green-700",
  EXONERE: "text-sky-700",
  IMPAYE: "text-red-700"
};

export function TaxStatusSelect({ adresssaId, initialValue }: { adresssaId: string; initialValue: string }) {
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

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className={`rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-semibold ${colors[value] ?? ""}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
