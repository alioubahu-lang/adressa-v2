"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquareText, Send } from "lucide-react";

type Comment = { id: string; message: string; authorName: string; createdAt: string };

export function AddressComments({ adresssaId, canComment }: { adresssaId: string; canComment: boolean }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/address/${encodeURIComponent(adresssaId)}/comments`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Les commentaires n’ont pas pu être chargés.");
      setComments(data.items ?? []);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Les commentaires n’ont pas pu être chargés.");
    } finally {
      setLoading(false);
    }
  }, [adresssaId]);

  useEffect(() => { void loadComments(); }, [loadComments]);

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim().length < 2) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/address/${encodeURIComponent(adresssaId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Le commentaire n’a pas pu être enregistré.");
      setComments((current) => [data, ...current]);
      setMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le commentaire n’a pas pu être enregistré.");
    } finally {
      setSending(false);
    }
  }

  return <section className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-adressa-light text-adressa-green"><MessageSquareText size={18} /></span><div><h2 className="font-bold text-adressa-deep">Commentaires de l’administration</h2><p className="text-xs text-adressa-ink/55">Remarques liées à l’adresse {adresssaId}</p></div></div>
    {canComment && <form onSubmit={submitComment} className="mt-4">
      <label htmlFor="admin-address-comment" className="sr-only">Ajouter une remarque pour l’agent</label>
      <textarea id="admin-address-comment" rows={3} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ex. Reprendre la photo de façade : elle est floue…" className="w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-adressa-green focus:ring-2 focus:ring-adressa-green/15" />
      <div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-adressa-ink/45">{message.length}/2000</span><button type="submit" disabled={sending || message.trim().length < 2} className="btn-primary min-h-10 px-4 py-2 text-sm disabled:opacity-50"><Send size={15} />{sending ? "Envoi…" : "Envoyer à l’agent"}</button></div>
    </form>}
    {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {loading ? <p className="mt-4 text-sm text-adressa-ink/50">Chargement des remarques…</p> : comments.length ? <ul className="mt-4 space-y-3">{comments.map((comment) => <li key={comment.id} className="rounded-xl bg-adressa-light/60 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-adressa-deep">{comment.authorName}</strong><time className="text-xs text-adressa-ink/50" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-adressa-ink/80">{comment.message}</p></li>)}</ul> : <p className="mt-4 rounded-xl border border-dashed border-black/10 p-4 text-sm text-adressa-ink/55">Aucune remarque pour le moment.</p>}
  </section>;
}
