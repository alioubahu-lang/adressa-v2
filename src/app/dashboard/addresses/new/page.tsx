"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Commune = {
  id: string;
  name: string;
  department: { id: string; region: { id: string; country: { id: string } } };
};
type Neighborhood = { id: string; name: string; streets: { id: string; name: string }[] };

export default function NewAddressPage() {
  const router = useRouter();
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [communeId, setCommuneId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [streetId, setStreetId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [plusCode, setPlusCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  // La photo est envoyée dès sa sélection, sous un identifiant provisoire,
  // afin de disposer de son URL avant même la création de l'adresse
  // (l'identifiant ADRESSA définitif n'est généré que côté serveur).
  async function uploadPhoto(): Promise<string | undefined> {
    if (!photoFile) return undefined;
    setUploadingPhoto(true);
    try {
      const draftId = `DRAFT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const body = new FormData();
      body.append("photo", photoFile);
      body.append("adresssaId", draftId);
      const res = await fetch("/api/upload", { method: "POST", body });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      return data.url as string;
    } finally {
      setUploadingPhoto(false);
    }
  }

  useEffect(() => {
    fetch("/api/geo/communes")
      .then((r) => r.json())
      .then((data) => setCommunes(data.items ?? []));
  }, []);

  useEffect(() => {
    if (!communeId) {
      setNeighborhoods([]);
      return;
    }
    fetch(`/api/geo/communes/${communeId}/neighborhoods`)
      .then((r) => r.json())
      .then((data) => setNeighborhoods(data.items ?? []));
  }, [communeId]);

  function useMyPosition() {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(7));
        setLongitude(pos.coords.longitude.toFixed(7));
      },
      () => setError("Impossible d'obtenir la position GPS. Vérifiez les permissions.")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const commune = communes.find((c) => c.id === communeId);
    if (!commune || !neighborhoodId || !latitude || !longitude) {
      setError("Commune, quartier, latitude et longitude sont obligatoires.");
      return;
    }

    setLoading(true);

    if (!navigator.onLine) {
      const { queueAddress } = await import("@/lib/offlineQueue");
      const payload = {
        countryId: commune.department.region.country.id,
        regionId: commune.department.region.id,
        departmentId: commune.department.id,
        communeId,
        neighborhoodId,
        streetId: streetId || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        plusCode: plusCode || undefined,
        landmark: landmark || undefined,
        description: description || undefined
      };

      if (photoFile) {
        const reader = new FileReader();
        const photoBase64: string = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photoFile);
        });
        queueAddress(payload, photoBase64, photoFile.type);
      } else {
        queueAddress(payload);
      }

      setLoading(false);
      router.push("/dashboard/addresses?queued=1");
      return;
    }

    const photoUrl = await uploadPhoto().catch(() => {
      setError("La photo n'a pas pu être envoyée, mais l'adresse va être créée sans elle.");
      return undefined;
    });

    const res = await fetch("/api/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryId: commune.department.region.country.id,
        regionId: commune.department.region.id,
        departmentId: commune.department.id,
        communeId,
        neighborhoodId,
        streetId: streetId || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        plusCode: plusCode || undefined,
        landmark: landmark || undefined,
        description: description || undefined,
        photoUrl
      })
    });
    setLoading(false);

    if (!res.ok) {
      setError("Erreur lors de la création de l'adresse.");
      return;
    }
    router.push("/dashboard/addresses");
  }

  const selectedNeighborhood = neighborhoods.find((n) => n.id === neighborhoodId);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-adressa-deep">Nouvelle adresse</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Commune</label>
          <select
            value={communeId}
            onChange={(e) => {
              setCommuneId(e.target.value);
              setNeighborhoodId("");
              setStreetId("");
            }}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          >
            <option value="">— Sélectionner —</option>
            {communes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Quartier</label>
          <select
            value={neighborhoodId}
            onChange={(e) => setNeighborhoodId(e.target.value)}
            disabled={!communeId}
            className="w-full rounded-lg border border-black/10 px-3 py-2 disabled:bg-adressa-gray"
          >
            <option value="">— Sélectionner —</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        {selectedNeighborhood && selectedNeighborhood.streets.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Rue (optionnel)</label>
            <select value={streetId} onChange={(e) => setStreetId(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2">
              <option value="">— Aucune —</option>
              {selectedNeighborhood.streets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Latitude</label>
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Longitude</label>
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </div>
        </div>

        <button type="button" onClick={useMyPosition} className="btn-secondary w-full">
          📍 Utiliser ma position
        </button>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Plus Code (optionnel)</label>
          <input value={plusCode} onChange={(e) => setPlusCode(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Repère (optionnel)</label>
          <input value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Description (optionnel)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2" rows={3} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-adressa-ink/70">Photo du bâtiment</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Aperçu" className="mt-3 aspect-video w-full rounded-lg object-cover" />
          )}
          {uploadingPhoto && <p className="mt-1 text-xs text-adressa-ink/50">Envoi de la photo…</p>}
          <p className="mt-1 text-xs text-adressa-ink/50">
            La photo est automatiquement compressée avant envoi pour rester légère sur les connexions lentes.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Création…" : "Créer l'adresse"}
        </button>
      </form>
    </div>
  );
}
