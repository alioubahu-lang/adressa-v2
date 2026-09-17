"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const roleOptions = [
  { value: "AGENT", label: "Agent terrain" },
  { value: "ADMIN", label: "Administrateur" },
  { value: "MUNICIPAL_ADMIN", label: "Administrateur municipal" },
  { value: "MUNICIPAL", label: "Agent mairie (lecture)" },
  { value: "LOGISTICS_PARTNER", label: "Partenaire logistique" },
  { value: "VIEWER", label: "Lecture seule" },
  { value: "SUPER_ADMIN", label: "Super administrateur" }
];

const roleLabels: Record<string, string> = Object.fromEntries(roleOptions.map((r) => [r.value, r.label]));

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  commune: { id: string; name: string } | null;
};

type Commune = { id: string; name: string };

export function UsersTab({ users, communes, currentUserId }: { users: UserRow[]; communes: Commune[]; currentUserId?: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("AGENT");
  const [communeId, setCommuneId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("AGENT");
    setCommuneId("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(user: UserRow) {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setCommuneId(user.commune?.id ?? "");
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = editingUser
      ? await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, role, communeId: communeId || null })
        })
      : await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role, communeId: communeId || null })
        });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Erreur lors de l'enregistrement.");
      return;
    }
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(user: UserRow) {
    if (!window.confirm(`Supprimer le compte de ${user.name} ?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-adressa-deep">Gestion des utilisateurs</h2>
        <button type="button" onClick={openCreate} className="btn-primary text-sm">
          + Ajouter un utilisateur
        </button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-adressa-light text-adressa-deep">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Commune associée</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/5">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{roleLabels[u.role] ?? u.role}</td>
                <td className="px-4 py-3">{u.commune?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => openEdit(u)} className="text-adressa-green underline">
                      Éditer
                    </button>
                    {u.id !== currentUserId && (
                      <button type="button" onClick={() => handleDelete(u)} className="text-red-600 underline">
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-adressa-deep">
              {editingUser ? `Modifier ${editingUser.name}` : "Ajouter un utilisateur"}
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Nom</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Email</label>
                <input
                  required
                  type="email"
                  disabled={!!editingUser}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 disabled:bg-adressa-gray"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Mot de passe (8 caractères min.)</label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-black/10 px-3 py-2"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Rôle</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2">
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Commune associée (optionnel)</label>
                <select value={communeId} onChange={(e) => setCommuneId(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2">
                  <option value="">— Aucune —</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
