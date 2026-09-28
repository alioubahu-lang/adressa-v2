"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Camera, Check, ClipboardList, MapPin, Navigation, WifiOff } from "lucide-react";
import { compressPhoto } from "@/lib/compressPhoto";
import { encodePlusCode } from "@/lib/plusCode";

type Commune = {
  id: string;
  name: string;
  department: { id: string; name: string; region: { id: string; name: string; country: { id: string } } };
};
type Neighborhood = { id: string; name: string; streets: { id: string; name: string }[] };
type OccupancyType = "RESIDENTIEL" | "COMMERCIAL" | "PUBLIC";
type PhotoState = { file: File; preview: string } | null;

const inputClass = "mt-1 min-h-12 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-base outline-none focus:border-adressa-green focus:ring-2 focus:ring-adressa-green/15";
const SingleAddressMap = dynamic(() => import("@/components/SingleAddressMap"), { ssr: false });
const categories = [
  ["ALIMENTATION", "Alimentation / boutique"],
  ["BTP_QUINCAILLERIE", "BTP / quincaillerie"],
  ["RESTAURATION", "Restauration"],
  ["SERVICE", "Services"],
  ["ATELIER", "Atelier / artisanat"],
  ["AUTRE", "Autre activité"]
];

export default function NewAddressPage() {
  const router = useRouter();
  const requestId = useRef(crypto.randomUUID());
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [communeId, setCommuneId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [neighborhoodName, setNeighborhoodName] = useState("");
  const [streetId, setStreetId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [plusCode, setPlusCode] = useState("");
  const [occupancyType, setOccupancyType] = useState<OccupancyType>("RESIDENTIEL");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessNinea, setBusinessNinea] = useState("");
  const [businessRegister, setBusinessRegister] = useState("");
  const [plateStatus, setPlateStatus] = useState<"POSEE" | "EN_ATTENTE">("EN_ATTENTE");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [storefrontPhoto, setStorefrontPhoto] = useState<PhotoState>(null);
  const [platePhoto, setPlatePhoto] = useState<PhotoState>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState<"storefront" | "plate" | null>(null);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    const cached = localStorage.getItem("adressa:communes");
    if (cached) {
      try { setCommunes(JSON.parse(cached) as Commune[]); } catch { localStorage.removeItem("adressa:communes"); }
    }
    fetch("/api/geo/communes")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        const items = (data.items ?? []) as Commune[];
        setCommunes(items);
        localStorage.setItem("adressa:communes", JSON.stringify(items));
      })
      .catch(() => undefined);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!communeId) {
      setNeighborhoods([]);
      return;
    }
    const cacheKey = `adressa:neighborhoods:${communeId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setNeighborhoods(JSON.parse(cached) as Neighborhood[]); } catch { localStorage.removeItem(cacheKey); }
    } else {
      setNeighborhoods([]);
    }
    fetch(`/api/geo/communes/${communeId}/neighborhoods`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        const items = (data.items ?? []) as Neighborhood[];
        setNeighborhoods(items);
        localStorage.setItem(cacheKey, JSON.stringify(items));
      })
      .catch(() => undefined);
  }, [communeId]);

  useEffect(() => {
    if (!navigator.geolocation || latitude) return;
    capturePosition(false);
    // Initial GPS capture is intentional for the field-agent workflow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (storefrontPhoto) URL.revokeObjectURL(storefrontPhoto.preview);
    if (platePhoto) URL.revokeObjectURL(platePhoto.preview);
  }, [storefrontPhoto, platePhoto]);

  function capturePosition(showError = true) {
    if (!navigator.geolocation) {
      if (showError) setError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat.toFixed(7));
        setLongitude(lon.toFixed(7));
        setAccuracy(position.coords.accuracy);
        setPlusCode(encodePlusCode(lat, lon));
        setError(null);
        setGpsLoading(false);
      },
      () => {
        if (showError) setError("Position GPS indisponible. Autorisez la localisation ou renseignez les coordonnées.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 18000, maximumAge: 30000 }
    );
  }

  async function selectPhoto(kind: "storefront" | "plate", file?: File) {
    if (!file) return;
    setError(null);
    setPhotoLoading(kind);
    try {
      const compressed = await compressPhoto(file);
      const next = { file: compressed, preview: URL.createObjectURL(compressed) };
      if (kind === "storefront") setStorefrontPhoto(next);
      else setPlatePhoto(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de préparer cette photo.");
    } finally {
      setPhotoLoading(null);
    }
  }

  const selectedNeighborhood = neighborhoods.find((item) => item.id === neighborhoodId);
  const selectedCommune = communes.find((item) => item.id === communeId);
  const communeGroups = communes.reduce<Map<string, Commune[]>>((groups, commune) => {
    const label = `${commune.department.region.name} · ${commune.department.name}`;
    groups.set(label, [...(groups.get(label) ?? []), commune]);
    return groups;
  }, new Map());

  async function saveOffline(payload: Record<string, unknown>) {
    const { queueAddress } = await import("@/lib/offlineQueue");
    await queueAddress(payload, [
      ...(storefrontPhoto ? [{ field: "businessPhotoUrl", file: storefrontPhoto.file }] : []),
      ...(plateStatus === "POSEE" && platePhoto ? [{ field: "platePhotoUrl", file: platePhoto.file }] : [])
    ]);
    router.push("/dashboard/addresses?queued=1");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!selectedCommune || (!neighborhoodId && !neighborhoodName.trim())) {
      setError("Choisissez la commune et indiquez le quartier.");
      return;
    }
    if (!latitude || !longitude) {
      setError("Ajoutez une position GPS pour enregistrer cette adresse.");
      return;
    }
    if (!storefrontPhoto) {
      setError("La photo de la façade est obligatoire.");
      return;
    }
    if (occupancyType === "COMMERCIAL" && (!businessName.trim() || !businessCategory)) {
      setError("Pour un commerce, renseignez l’enseigne et la catégorie d’activité.");
      return;
    }
    if (plateStatus === "POSEE" && !platePhoto) {
      setError("Ajoutez la photo de la plaque posée.");
      return;
    }

    const payload: Record<string, unknown> = {
      clientRequestId: requestId.current,
      countryId: selectedCommune.department.region.country.id,
      regionId: selectedCommune.department.region.id,
      departmentId: selectedCommune.department.id,
      communeId,
      neighborhoodId: neighborhoodId || undefined,
      neighborhoodName: neighborhoodId ? undefined : neighborhoodName.trim(),
      streetId: streetId || undefined,
      latitude: Number(latitude),
      longitude: Number(longitude),
      plusCode: plusCode || undefined,
      gpsAccuracyMeters: accuracy ?? undefined,
      landmark: landmark.trim() || undefined,
      description: description.trim() || undefined,
      buildingType: occupancyType === "COMMERCIAL" ? "Commerce" : occupancyType === "PUBLIC" ? "Équipement public" : "Habitation",
      occupancyType,
      businessName: occupancyType === "COMMERCIAL" ? businessName.trim() : undefined,
      businessCategory: occupancyType === "COMMERCIAL" ? businessCategory : undefined,
      businessNinea: occupancyType === "COMMERCIAL" ? businessNinea.trim() || undefined : undefined,
      businessRegister: occupancyType === "COMMERCIAL" ? businessRegister.trim() || undefined : undefined,
      plateStatus
    };

    setLoading(true);
    if (!navigator.onLine) {
      try {
        await saveOffline(payload);
      } catch {
        setError("La saisie hors ligne n’a pas pu être conservée sur cet appareil. Libérez de l’espace puis réessayez.");
        setLoading(false);
      }
      return;
    }

    try {
      const uploaded: Record<string, string> = {};
      const photos = [
        { field: "businessPhotoUrl", photo: storefrontPhoto },
        ...(plateStatus === "POSEE" ? [{ field: "platePhotoUrl", photo: platePhoto }] : [])
      ];
      for (const item of photos) {
        if (!item.photo) continue;
        setPhotoLoading(item.field === "businessPhotoUrl" ? "storefront" : "plate");
        const form = new FormData();
        form.append("photo", item.photo.file);
        form.append("adresssaId", `DRAFT-${requestId.current.slice(0, 8).toUpperCase()}`);
        const upload = await fetch("/api/upload", { method: "POST", body: form });
        if (!upload.ok) throw new Error("L’envoi d’une photo a échoué. Vérifiez le réseau puis réessayez.");
        uploaded[item.field] = (await upload.json() as { url: string }).url;
      }
      setPhotoLoading(null);

      const response = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          photoUrl: uploaded.businessPhotoUrl,
          businessPhotoUrl: uploaded.businessPhotoUrl,
          platePhotoUrl: uploaded.platePhotoUrl
        })
      });
      if (response.ok) {
        router.push("/dashboard/addresses?created=1");
        return;
      }
      if (response.status >= 500) {
        await saveOffline({ ...payload, ...uploaded });
        return;
      }
      const result = await response.json().catch(() => ({}));
      setError(result.error ?? "L’adresse n’a pas été enregistrée. Vérifiez vos droits et réessayez.");
    } catch (cause) {
      if (!navigator.onLine) {
        try {
          await saveOffline(payload);
          return;
        } catch {
          setError("La connexion a été interrompue et la saisie n’a pas pu être mise en attente.");
        }
      } else {
        setError(cause instanceof Error ? cause.message : "Une erreur est survenue pendant l’enregistrement.");
      }
    } finally {
      setLoading(false);
      setPhotoLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-24 md:pb-0">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-adressa-green">Collecte terrain</p>
          <h1 className="text-2xl font-bold text-adressa-deep">Nouvelle adresse</h1>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${online ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
          {online ? <Check size={14} /> : <WifiOff size={14} />}
          {online ? "Connecté" : "Hors ligne"}
        </span>
      </header>

      {!online && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          La saisie et les photos resteront sur cet appareil. Elles seront synchronisées au retour du réseau.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="card space-y-4 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-adressa-light font-bold text-adressa-deep">1</span>
            <div><h2 className="font-bold text-adressa-deep">Localiser le bâtiment</h2><p className="text-sm text-adressa-ink/60">La position GPS aide à retrouver l’adresse.</p></div>
          </div>

          <button type="button" onClick={() => capturePosition()} disabled={gpsLoading} className="btn-primary flex min-h-12 w-full items-center justify-center gap-2">
            <Navigation size={18} />{gpsLoading ? "Recherche de la position…" : "Utiliser ma position GPS"}
          </button>

          {latitude && longitude && (
            <div className="rounded-xl bg-adressa-light p-3 text-sm">
              <div className="flex items-center gap-2 font-semibold text-adressa-deep"><MapPin size={16} />{latitude}, {longitude}</div>
              <div className="mt-1 flex flex-wrap gap-x-4 text-adressa-ink/70">
                <span>Précision : {accuracy ? `± ${Math.round(accuracy)} m` : "coordonnées saisies"}</span>
                {plusCode && <span>Plus Code : {plusCode}</span>}
              </div>
              {accuracy !== null && accuracy > 50 && <p className="mt-2 text-amber-800">Précision faible : rapprochez-vous du bâtiment et actualisez la position.</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">Latitude<input inputMode="decimal" required value={latitude} onChange={(e) => { setLatitude(e.target.value); setAccuracy(null); const value = Number(e.target.value); if (e.target.value && Number.isFinite(value) && longitude) setPlusCode(encodePlusCode(value, Number(longitude))); }} className={inputClass} /></label>
            <label className="text-sm font-medium">Longitude<input inputMode="decimal" required value={longitude} onChange={(e) => { setLongitude(e.target.value); setAccuracy(null); const value = Number(e.target.value); if (e.target.value && Number.isFinite(value) && latitude) setPlusCode(encodePlusCode(Number(latitude), value)); }} className={inputClass} /></label>
          </div>
          {latitude && longitude && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) && (
            <div className="h-52 overflow-hidden rounded-xl border border-black/10">
              <SingleAddressMap latitude={Number(latitude)} longitude={Number(longitude)} label={plusCode || "Nouvelle adresse"} landmark={landmark || null} />
            </div>
          )}

          {!communes.length && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Les listes de communes ne sont pas encore disponibles sur cet appareil. Connectez-vous une fois au réseau puis rechargez cette page pour préparer les saisies hors ligne.</p>}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Commune<select required value={communeId} onChange={(e) => { setCommuneId(e.target.value); setNeighborhoodId(""); setNeighborhoodName(""); setStreetId(""); }} className={inputClass}>
              <option value="">Choisir une commune</option>{Array.from(communeGroups.entries()).sort(([a], [b]) => a.localeCompare(b, "fr")).map(([department, items]) => <optgroup key={department} label={department}>{items.sort((a, b) => a.name.localeCompare(b.name, "fr")).map((commune) => <option key={commune.id} value={commune.id}>{commune.name}</option>)}</optgroup>)}
            </select></label>
            <div className="text-sm font-medium">
              {neighborhoods.length > 0 && <label className="block">Quartier enregistré<select value={neighborhoodId} onChange={(e) => { setNeighborhoodId(e.target.value); if (e.target.value) setNeighborhoodName(""); setStreetId(""); }} disabled={!communeId} className={inputClass}>
                <option value="">Choisir ou saisir un quartier</option>{neighborhoods.map((neighborhood) => <option key={neighborhood.id} value={neighborhood.id}>{neighborhood.name}</option>)}
              </select></label>}
              {(!neighborhoodId || neighborhoods.length === 0) && <label className="mt-2 block">{neighborhoods.length ? "Ou ajouter un quartier" : "Quartier"}<input required={!neighborhoodId} maxLength={120} value={neighborhoodName} onChange={(e) => setNeighborhoodName(e.target.value)} disabled={!communeId} placeholder="Ex. Tanghor, Centre-ville…" className={inputClass} /><span className="mt-1 block text-xs font-normal text-adressa-ink/60">Le quartier sera ajouté au référentiel lors de l’enregistrement.</span></label>}
            </div>
          </div>
          {selectedNeighborhood?.streets.length ? (
            <label className="block text-sm font-medium">Rue ou voie<select value={streetId} onChange={(e) => setStreetId(e.target.value)} className={inputClass}>
              <option value="">Aucune rue référencée</option>{selectedNeighborhood.streets.map((street) => <option key={street.id} value={street.id}>{street.name}</option>)}
            </select></label>
          ) : null}
          <label className="block text-sm font-medium">Repère à proximité <span className="font-normal text-adressa-ink/50">(facultatif)</span><input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Ex. près du marché" className={inputClass} /></label>
        </section>

        <section className="card space-y-4 p-4 md:p-6">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-adressa-light font-bold text-adressa-deep">2</span><div><h2 className="font-bold text-adressa-deep">Caractériser le bâtiment</h2><p className="text-sm text-adressa-ink/60">Choisissez l’usage principal observé.</p></div></div>
          <div className="grid gap-2 sm:grid-cols-3">
            {([["RESIDENTIEL", "Habitation"], ["COMMERCIAL", "Commerce / activité"], ["PUBLIC", "Équipement public"]] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={occupancyType === value} onClick={() => setOccupancyType(value)} className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-semibold ${occupancyType === value ? "border-adressa-green bg-adressa-light text-adressa-deep ring-1 ring-adressa-green" : "border-black/10 bg-white"}`}>{label}</button>
            ))}
          </div>

          {occupancyType === "COMMERCIAL" && <div className="space-y-3 rounded-xl border border-adressa-green/20 bg-adressa-light/50 p-3 sm:p-4">
            <label className="block text-sm font-medium">Enseigne ou nom du commerce<input required maxLength={160} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ex. Boutique Awa" className={inputClass} /></label>
            <label className="block text-sm font-medium">Catégorie d’activité<select required value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} className={inputClass}><option value="">Sélectionner une activité</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">NINEA <span className="font-normal text-adressa-ink/50">(facultatif)</span><input maxLength={80} value={businessNinea} onChange={(e) => setBusinessNinea(e.target.value)} className={inputClass} /></label>
              <label className="text-sm font-medium">Registre du commerce <span className="font-normal text-adressa-ink/50">(facultatif)</span><input maxLength={80} value={businessRegister} onChange={(e) => setBusinessRegister(e.target.value)} className={inputClass} /></label>
            </div>
          </div>}

          <label className="block text-sm font-medium">Description complémentaire <span className="font-normal text-adressa-ink/50">(facultatif)</span><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} /></label>
        </section>

        <section className="card space-y-4 p-4 md:p-6">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-adressa-light font-bold text-adressa-deep">3</span><div><h2 className="font-bold text-adressa-deep">Plaque et photos</h2><p className="text-sm text-adressa-ink/60">Les photos sont compressées pour économiser les données.</p></div></div>
          <div>
            <p className="mb-2 text-sm font-medium">Statut de la plaque d’adresse</p>
            <div className="grid grid-cols-2 gap-2">
              {([["POSEE", "Plaque posée"], ["EN_ATTENTE", "En attente"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={plateStatus === value} onClick={() => { setPlateStatus(value); if (value === "EN_ATTENTE") setPlatePhoto(null); }} className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-semibold ${plateStatus === value ? "border-adressa-green bg-adressa-light text-adressa-deep" : "border-black/10 bg-white"}`}>{label}</button>)}
            </div>
          </div>

          <PhotoPicker title="Photo de la façade / enseigne" required value={storefrontPhoto} loading={photoLoading === "storefront"} onChange={(file) => selectPhoto("storefront", file)} />
          {plateStatus === "POSEE" && <PhotoPicker title="Photo de la plaque posée" required value={platePhoto} loading={photoLoading === "plate"} onChange={(file) => selectPhoto("plate", file)} />}
        </section>

        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

        <button type="submit" disabled={loading || !!photoLoading || !communes.length} className="btn-primary min-h-14 w-full text-base disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? (photoLoading ? "Préparation des photos…" : "Enregistrement…") : online ? "Enregistrer l’adresse" : "Enregistrer sur cet appareil"}
        </button>
      </form>

      <nav aria-label="Navigation terrain" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-black/10 bg-white/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <Link href="/map" className="flex flex-col items-center gap-1 py-1 text-xs text-adressa-ink/70"><MapPin size={18} />Carte</Link>
        <span aria-current="page" className="flex flex-col items-center gap-1 py-1 text-xs font-semibold text-adressa-green"><Camera size={18} />Nouvelle</span>
        <Link href="/dashboard/addresses" className="flex flex-col items-center gap-1 py-1 text-xs text-adressa-ink/70"><ClipboardList size={18} />Adresses</Link>
      </nav>
    </div>
  );
}

function PhotoPicker({ title, required, value, loading, onChange }: {
  title: string;
  required: boolean;
  value: PhotoState;
  loading: boolean;
  onChange: (file?: File) => void;
}) {
  return (
    <label className="block cursor-pointer rounded-xl border border-dashed border-black/20 p-3">
      <span className="flex items-center gap-2 text-sm font-semibold"><Camera size={17} />{title}{required && <span className="text-red-600">*</span>}</span>
      <input type="file" required={required} accept="image/*" capture="environment" onChange={(event) => onChange(event.target.files?.[0])} className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-adressa-light file:px-3 file:py-2 file:font-semibold file:text-adressa-deep" />
      {loading && <span className="mt-2 block text-xs text-adressa-ink/60">Compression de la photo…</span>}
      {value && <><span className="mt-2 block text-xs text-emerald-800">Photo prête · {(value.file.size / 1024).toFixed(0)} Ko</span>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={value.preview} alt={`Aperçu : ${title}`} className="mt-3 aspect-video w-full rounded-lg object-cover" /></>}
    </label>
  );
}
