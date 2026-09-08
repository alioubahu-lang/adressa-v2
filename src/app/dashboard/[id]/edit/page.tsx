"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AddressDetail = {
  adresssaId: string;
  plusCode: string | null;
  landmark: string | null;
  buildingType: string | null;
  description: string | null;
  photoUrl: string | null;
  status: string;
  verified: boolean;
  commune: { name: string };
  neighborhood: { name: string };
};

export default function EditAddressPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [address, setAddress] = useState<AddressDetail | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);

  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [plusCode, setPlusCode] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [status, setStatus] = useState("PUBLIE");
  const [verified, setVerified] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/address/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("introuvable");
        return r.json();
      })
      .then((data: AddressDetail) => {
        setAddress(data);
        setLandmark(data.landmark ?? "");
        setDescription(data.description ?? "");
        setPlusCode(data.plusCode ?? "");
        setBuildingType(data.buildingType ?? "");
        setStatus(data.status);
        setVerified(data.verified);
        setPhotoPreview(data.photoUrl);
      })
      .catch(() => setNotFoundError(true));
  }, [params.id]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    setError(null);

    let photoUrl = address.photoUrl;

    if (photoFile) {
      const form = new FormData();
      form.append("photo", photoFile);
      form.append("adresssaId", address.adresssaId);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      if (!uploadRes.ok) {
        setError("La photo n'a pas pu être envoyée — les autres modifications vont quand même être enregistrées.");
      } else {
        photoUrl = (await uploadRes.json()).url;
      }
    }

    const res = await fetch(`/api/address/${address.adresssaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        landmark: landmark || null,
        description: description || null,
        plusCode: plusCode || null,
        buildingType: buildingType || null,
        status,
        verified,
        photoUrl
      })
    });

    setLoading(false);
    if (!res.ok) {
      setError((prev) => prev ?? "Erreur lors de l'enregistrement des modifications.");
      return;
    }
    router.push("/dashboard/addresses");
  }

  if (notFoundError) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-red-600">Adresse introuvable.</p>
        <Link href="/dashboard/addresses" className="mt-4 inline-block text-adressa-green underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  if (!address) {
    return <div className="mx-auto max-w-2xl text-adressa-ink/50">Chargement…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-adressa-deep">Modifier {address.adresssaId}</h1>
      <p className="mb-6 text-sm text-adressa-ink/60">
        {address.commune.name} · {address.neighborhood.name}
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Photo du bâtiment</label>
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Aperçu" className="mb-3 aspect-video w-full rounded-lg object-cover" />
          ) : (
            <div className="mb-3 flex aspect-video w-full items-center justify-center rounded-lg bg-adressa-gray text-sm text-adressa-ink/40">
              Aucune photo pour l&apos;instant
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-adressa-ink/50">
            Sélectionner une nouvelle photo remplace l&apos;actuelle. La compression est automatique.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Repère</label>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Plus Code</label>
          <input
            value={plusCode}
            onChange={(e) => setPlusCode(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Type de bâtiment (optionnel)</label>
          <input
            value={buildingType}
            onChange={(e) => setBuildingType(e.target.value)}
            placeholder="ex : Maison individuelle, Commerce, Immeuble…"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            >
              <option value="BROUILLON">Brouillon</option>
              <option value="COLLECTE">Collecté</option>
              <option value="A_VERIFIER">À vérifier</option>
              <option value="VERIFIE">Vérifié</option>
              <option value="PUBLIE">Publié</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-adressa-ink/70">
              <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
              Adresse vérifiée
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
          <Link href={`/a/${address.adresssaId}`} className="btn-secondary">
            Voir la fiche
          </Link>
        </div>
      </form>
    </div>
  );
}
