"use client";

import { useState } from "react";

export function SecurityTab({ name, email }: { name?: string; email?: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Erreur lors du changement de mot de passe.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-adressa-deep">Sécurité & profil</h2>

      <div className="card mb-6 max-w-lg">
        <h3 className="mb-2 text-sm font-bold text-adressa-deep">Profil</h3>
        <p className="text-sm text-adressa-ink/70">
          {name} — {email}
        </p>
        <p className="mt-1 text-xs text-adressa-ink/40">
          La modification du nom ou de l&apos;email se fait par un administrateur, depuis l&apos;onglet Utilisateurs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-lg space-y-4">
        <h3 className="text-sm font-bold text-adressa-deep">Changer le mot de passe</h3>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Mot de passe actuel</label>
          <input
            required
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Nouveau mot de passe (8 caractères min.)</label>
          <input
            required
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Confirmer le nouveau mot de passe</label>
          <input
            required
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-adressa-green">Mot de passe mis à jour.</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Enregistrement…" : "Changer le mot de passe"}
        </button>
      </form>
    </div>
  );
}
