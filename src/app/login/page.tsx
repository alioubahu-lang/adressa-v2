"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-adressa-deep px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl2 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center text-2xl font-black tracking-widest text-adressa-deep">ADRESSA</div>
        <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-black/10 px-3 py-2 focus:border-adressa-green focus:outline-none"
        />
        <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-black/10 px-3 py-2 focus:border-adressa-green focus:outline-none"
        />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
