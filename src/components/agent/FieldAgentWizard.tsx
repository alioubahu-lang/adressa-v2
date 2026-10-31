"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Camera, Check, CheckCircle2, LoaderCircle, MapPin, Mic, QrCode, RefreshCw, WifiOff, X } from "lucide-react";
import { compressPhoto } from "@/lib/compressPhoto";
import { encodePlusCode } from "@/lib/plusCode";
import type { PendingPhoto } from "@/lib/offlineQueue";

type Commune = {
  id: string;
  name: string;
  department: { id: string; name: string; region: { id: string; name: string; country: { id: string; code?: string } } };
};
type Neighborhood = { id: string; name: string; streets: { id: string; name: string }[] };
type BuildingKind = "RESIDENTIEL" | "COMMERCIAL" | "PUBLIC" | "TERRAIN_NU";
type PlateState = "POSEE" | "INACCESSIBLE" | "A_REFAIRE";
type PhotoPick = { file: File; preview: string } | null;
type ExistingAddress = {
  adresssaId: string;
  communeId: string;
  neighborhoodId: string;
  latitude: number;
  longitude: number;
  plusCode: string | null;
  landmark: string | null;
  description: string | null;
  buildingType: string | null;
  occupancyType: BuildingKind | null;
  businessName: string | null;
  businessCategory: string | null;
  photoUrl: string | null;
  businessPhotoUrl: string | null;
  platePhotoUrl: string | null;
  plateStatus: string | null;
  neighborhood: { id: string; name: string };
  commune: { id: string; name: string };
};

const inputClass = "mt-1 min-h-12 w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-900 px-3 py-3 text-base text-adressa-ink outline-none transition placeholder:text-adressa-ink/40 focus:border-adressa-green focus:ring-2 focus:ring-adressa-green/15 dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]";
const stepLabels = ["Localisation", "Bâtiment", "Photo & statut"];
const buildingOptions: { id: BuildingKind; label: string; detail: string }[] = [
  { id: "RESIDENTIEL", label: "Habitation", detail: "Maison, immeuble, logement" },
  { id: "COMMERCIAL", label: "Commerce", detail: "Boutique, atelier, service" },
  { id: "PUBLIC", label: "Bâtiment public", detail: "École, poste de santé, mairie" },
  { id: "TERRAIN_NU", label: "Terrain nu", detail: "Parcelle non bâtie" }
];
const plateOptions: { id: PlateState; label: string }[] = [
  { id: "POSEE", label: "Plaque posée" },
  { id: "INACCESSIBLE", label: "Inaccessible" },
  { id: "A_REFAIRE", label: "À refaire" }
];

export function FieldAgentWizard({ agentName, zone }: { agentName: string; zone: string }) {
  const router = useRouter();
  const requestId = useRef(crypto.randomUUID());
  const [step, setStep] = useState(0);
  const [online, setOnline] = useState(true);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [communeId, setCommuneId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [buildingKind, setBuildingKind] = useState<BuildingKind>("RESIDENTIEL");
  const [buildingName, setBuildingName] = useState("");
  const [buildingCategory, setBuildingCategory] = useState("");
  const [addressId, setAddressId] = useState("");
  const [existingAddress, setExistingAddress] = useState<ExistingAddress | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [plusCode, setPlusCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [photo, setPhoto] = useState<PhotoPick>(null);
  const [platePhoto, setPlatePhoto] = useState<PhotoPick>(null);
  const [plateState, setPlateState] = useState<PlateState>("POSEE");
  const [comment, setComment] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const cached = localStorage.getItem("adressa:communes");
    if (cached) {
      try {
        const items = JSON.parse(cached) as Commune[];
        setCommunes(items);
        if (items.length === 1) setCommuneId(items[0].id);
      } catch { localStorage.removeItem("adressa:communes"); }
    }
    fetch("/api/geo/communes").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        const items = (data.items ?? []) as Commune[];
        setCommunes(items);
        setCommuneId((current) => current || (items.length === 1 ? items[0].id : ""));
        localStorage.setItem("adressa:communes", JSON.stringify(items));
      }).catch(() => undefined);
    if (navigator.geolocation) capturePosition(false);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
    // The first GPS request is intentionally made when the capture view opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!communeId) { setNeighborhoods([]); return; }
    const cacheKey = `adressa:neighborhoods:${communeId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setNeighborhoods(JSON.parse(cached) as Neighborhood[]); } catch { localStorage.removeItem(cacheKey); }
    } else setNeighborhoods([]);
    fetch(`/api/geo/communes/${communeId}/neighborhoods`).then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { const items = (data.items ?? []) as Neighborhood[]; setNeighborhoods(items); localStorage.setItem(cacheKey, JSON.stringify(items)); })
      .catch(() => undefined);
  }, [communeId]);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.preview);
    if (platePhoto) URL.revokeObjectURL(platePhoto.preview);
  }, [photo, platePhoto]);

  const selectedCommune = communes.find((item) => item.id === communeId);
  const selectedNeighborhood = neighborhoods.find((item) => item.id === neighborhoodId);
  const communeGroups = useMemo(() => communes.reduce<Map<string, Commune[]>>((groups, commune) => {
    const label = `${commune.department.region.name} · ${commune.department.name}`;
    groups.set(label, [...(groups.get(label) ?? []), commune]);
    return groups;
  }, new Map()), [communes]);
  const currentPhotoUrl = existingAddress?.businessPhotoUrl || existingAddress?.photoUrl || null;

  function capturePosition(showError = true) {
    setError("");
    if (!navigator.geolocation) { if (showError) setError("La géolocalisation n’est pas disponible sur cet appareil."); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setLatitude(lat.toFixed(7));
      setLongitude(lon.toFixed(7));
      setAccuracy(position.coords.accuracy);
      setPlusCode(encodePlusCode(lat, lon));
      setGpsLoading(false);
    }, () => {
      if (showError) setError("Position GPS indisponible. Autorisez la localisation et réessayez.");
      setGpsLoading(false);
    }, { enableHighAccuracy: true, timeout: 18000, maximumAge: 20000 });
  }

  async function pickPhoto(file: File | undefined, target: "front" | "plate") {
    if (!file) return;
    setPhotoLoading(true);
    setError("");
    try {
      const compressed = await compressPhoto(file);
      const picked = { file: compressed, preview: URL.createObjectURL(compressed) };
      if (target === "front") setPhoto(picked);
      else setPlatePhoto(picked);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de préparer cette photo.");
    } finally { setPhotoLoading(false); }
  }

  function resetToCreate() {
    setExistingAddress(null);
    setAddressId("");
    setNeighborhoodId("");
    setNewNeighborhood("");
    setBuildingKind("RESIDENTIEL");
    setBuildingName("");
    setBuildingCategory("");
    setComment("");
    setPhoto(null);
    setPlatePhoto(null);
    setPlateState("POSEE");
    setError("");
  }

  async function loadAddress(code = addressId) {
    const normalized = code.trim().toUpperCase();
    if (!/^SN-[A-Z0-9]+-\d{3,}$/.test(normalized)) { setError("Saisissez un identifiant au format SN-SBK-001."); return; }
    setLookupLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/address/${encodeURIComponent(normalized)}`);
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Adresse introuvable ou non modifiable par votre compte.");
      const address = data as ExistingAddress;
      setExistingAddress(address);
      setAddressId(address.adresssaId);
      setCommuneId(address.communeId);
      setNeighborhoodId(address.neighborhoodId);
      setNewNeighborhood("");
      setLatitude(String(address.latitude));
      setLongitude(String(address.longitude));
      setPlusCode(address.plusCode ?? "");
      setLandmark(address.landmark ?? "");
      setComment(address.description ?? "");
      setBuildingKind(address.occupancyType ?? "RESIDENTIEL");
      setBuildingName(address.businessName ?? "");
      setBuildingCategory(address.businessCategory ?? "");
      setPlateState(address.plateStatus === "INACCESSIBLE" || address.plateStatus === "A_REFAIRE" ? address.plateStatus : "POSEE");
      setStep(0);
      setSuccess(`Saisie ${address.adresssaId} chargée. Vous pouvez la mettre à jour.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de retrouver cette adresse.");
    } finally { setLookupLoading(false); }
  }

  function transcribeVoiceNote() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("La dictée vocale n’est pas prise en charge par ce navigateur. Vous pouvez saisir la note au clavier."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.onstart = () => { setListening(true); setError(""); };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) setComment((current) => [current.trim(), transcript].filter(Boolean).join(" "));
    };
    recognition.onerror = () => setError("La dictée n’a pas abouti. Vérifiez l’accès au microphone.");
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  function validateStep(): boolean {
    setError("");
    if (step === 0) {
      if (addressId.trim() && !existingAddress) { setError("Chargez cet identifiant avant de continuer, ou effacez-le pour une nouvelle adresse."); return false; }
      if (!latitude || !longitude) { setError("Ajoutez la position GPS du bâtiment."); return false; }
    }
    if (step === 1 && (!selectedCommune || (!neighborhoodId && !newNeighborhood.trim()))) {
      setError("Choisissez un quartier ou saisissez son nom."); return false;
    }
    return true;
  }

  async function uploadOne(file: File, code: string): Promise<string> {
    const form = new FormData();
    form.append("photo", file);
    form.append("adresssaId", code);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    if (!response.ok) throw new Error("L’envoi d’une photo a échoué. Réessayez lorsque le réseau est stable.");
    return (await response.json() as { url: string }).url;
  }

  async function saveOffline(payload: Record<string, unknown>) {
    const { queueAddress } = await import("@/lib/offlineQueue");
    const photos: PendingPhoto[] = [
      ...(!existingAddress && photo ? [{ field: "photoUrl", file: photo.file }] : []),
      ...(existingAddress && photo ? [{ field: "photoUrl", file: photo.file }] : []),
      ...(platePhoto ? [{ field: "platePhotoUrl", file: platePhoto.file }] : [])
    ];
    await queueAddress(payload, photos, existingAddress ? { addressId: existingAddress.adresssaId } : undefined);
    router.push("/dashboard/terrain?queued=1");
  }

  async function saveRecord() {
    setError("");
    if (!validateStep()) return;
    if (!selectedCommune || (!neighborhoodId && !newNeighborhood.trim())) { setError("Le quartier est obligatoire."); return; }
    if (!photo && !currentPhotoUrl) { setError("Ajoutez une photo de façade ou de plaque."); return; }
    if (buildingKind === "COMMERCIAL" && !buildingName.trim()) { setError("Indiquez le nom ou l’enseigne du commerce."); return; }

    const payload: Record<string, unknown> = {
      ...(existingAddress ? {} : {
        clientRequestId: requestId.current,
        countryId: selectedCommune.department.region.country.id,
        regionId: selectedCommune.department.region.id,
        departmentId: selectedCommune.department.id,
        communeId,
        neighborhoodId: neighborhoodId || undefined,
        neighborhoodName: neighborhoodId ? undefined : newNeighborhood.trim()
      }),
      latitude: Number(latitude),
      longitude: Number(longitude),
      plusCode: plusCode || undefined,
      gpsAccuracyMeters: accuracy ?? undefined,
      landmark: landmark.trim() || undefined,
      description: comment.trim() || undefined,
      buildingType: buildingKind === "COMMERCIAL" ? "Commerce" : buildingKind === "PUBLIC" ? "Équipement public" : buildingKind === "TERRAIN_NU" ? "Terrain nu" : "Habitation",
      occupancyType: buildingKind,
      businessName: buildingKind === "COMMERCIAL" ? buildingName.trim() : null,
      businessCategory: buildingKind === "COMMERCIAL" ? buildingCategory.trim() || "AUTRE" : null,
      plateStatus: plateState,
      ...(photo ? {} : { photoUrl: currentPhotoUrl ?? undefined, businessPhotoUrl: existingAddress?.businessPhotoUrl ?? currentPhotoUrl ?? undefined }),
      ...(platePhoto ? {} : { platePhotoUrl: existingAddress?.platePhotoUrl ?? undefined })
    };

    setSaving(true);
    if (!navigator.onLine) {
      try { await saveOffline(payload); }
      catch { setError("La saisie n’a pas pu être conservée sur cet appareil. Vérifiez l’espace de stockage disponible."); setSaving(false); }
      return;
    }
    try {
      const photoUrl = photo ? await uploadOne(photo.file, existingAddress?.adresssaId ?? `DRAFT-${requestId.current.slice(0, 8).toUpperCase()}`) : undefined;
      const platePhotoUrl = platePhoto ? await uploadOne(platePhoto.file, existingAddress?.adresssaId ?? `DRAFT-${requestId.current.slice(0, 8).toUpperCase()}`) : undefined;
      if (photoUrl) { payload.photoUrl = photoUrl; payload.businessPhotoUrl = photoUrl; }
      if (platePhotoUrl) payload.platePhotoUrl = platePhotoUrl;

      const response = await fetch(existingAddress ? `/api/address/${encodeURIComponent(existingAddress.adresssaId)}` : "/api/address", {
        method: existingAddress ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        if (response.status >= 500 || !navigator.onLine) { await saveOffline(payload); return; }
        throw new Error(result.error?.formErrors?.[0] ?? result.error ?? "Enregistrement impossible. Vérifiez les informations et réessayez.");
      }
      router.push(`/dashboard/terrain?${existingAddress ? "updated=1" : "created=1"}`);
    } catch (cause) {
      if (!navigator.onLine) {
        try { await saveOffline(payload); return; }
        catch { setError("Réseau interrompu et sauvegarde locale impossible. Ne fermez pas la page et réessayez."); }
      } else setError(cause instanceof Error ? cause.message : "Une erreur est survenue pendant l’enregistrement.");
    } finally { setSaving(false); }
  }

  return <div className="min-h-screen bg-adressa-gray px-4 py-5 text-adressa-ink dark:bg-slate-950 dark:text-slate-100 sm:px-6">
  <div className="mx-auto max-w-2xl space-y-4 pb-24 md:pb-8">
    <header className="flex items-start justify-between gap-3">
      <div><p className="text-sm font-semibold text-adressa-green dark:text-emerald-400">Agent Terrain · FIELD_AGENT</p><h1 className="mt-1 text-2xl font-black text-adressa-deep dark:text-slate-100">{existingAddress ? "Mettre à jour une saisie" : "Nouvelle saisie terrain"}</h1><p className="mt-1 text-sm text-adressa-ink/60 dark:text-slate-400">{agentName} · {zone}</p></div>
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${online ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"}`}>{online ? <Check size={14} /> : <WifiOff size={14} />}{online ? "En ligne" : "Hors ligne"}</span>
    </header>

    {!online && <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/50 p-3 text-sm text-amber-950 dark:text-amber-100"><WifiOff size={17} className="mt-0.5 shrink-0" /><span>Vous pouvez continuer la saisie. Elle sera stockée sur cet appareil et envoyée au retour du réseau.</span></div>}
    {success && <p role="status" className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-3 text-sm text-emerald-900 dark:text-emerald-200">{success}</p>}

    <ol aria-label="Étapes de saisie" className="grid grid-cols-3 gap-2">
      {stepLabels.map((label, index) => <li key={label}><button type="button" onClick={() => { if (index <= step) setStep(index); }} aria-current={step === index ? "step" : undefined} className={`flex min-h-12 w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold sm:px-3 sm:text-sm ${step === index ? "bg-adressa-deep text-white" : index < step ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300" : "bg-white dark:bg-slate-900 text-adressa-ink/50 dark:text-slate-400"}`}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/20 dark:bg-white/10">{index < step ? <Check size={14} /> : index + 1}</span>{label}</button></li>)}
    </ol>

    <section className="card space-y-4 border-black/5 bg-white p-4 text-adressa-ink shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 sm:p-6" aria-labelledby="step-title">
      <div><p className="text-xs font-bold uppercase tracking-wider text-adressa-green dark:text-emerald-400">Étape {step + 1} sur 3</p><h2 id="step-title" className="mt-1 text-lg font-bold text-adressa-deep dark:text-slate-100">{step === 0 ? "Localiser et identifier" : step === 1 ? "Qualifier le bâtiment" : "Photo, état et commentaire"}</h2></div>

      {step === 0 && <div className="space-y-4">
        <button type="button" onClick={() => capturePosition()} disabled={gpsLoading} className="btn-primary min-h-14 w-full text-base disabled:opacity-60">{gpsLoading ? <LoaderCircle size={19} className="animate-spin" /> : <MapPin size={19} />}{gpsLoading ? "Localisation…" : "Récupérer ma position GPS"}</button>
        {latitude && longitude && <div className="rounded-xl bg-adressa-light/40 dark:bg-emerald-950/30 p-3 text-sm"><p className="font-semibold text-adressa-deep dark:text-slate-100">{latitude}, {longitude}</p><div className="mt-1 flex flex-wrap gap-x-4 text-xs text-adressa-ink/60 dark:text-slate-400"><span>Précision : ±{accuracy ? Math.round(accuracy) : "—"} m</span>{plusCode && <span>Plus Code : {plusCode}</span>}</div></div>}
        <label className="block text-sm font-medium">Coordonnées <span className="font-normal text-adressa-ink/50 dark:text-slate-400">(ajustables)</span><span className="mt-1 grid grid-cols-2 gap-2"><input aria-label="Latitude" inputMode="decimal" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" className={inputClass} /><input aria-label="Longitude" inputMode="decimal" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" className={inputClass} /></span></label>
        <div className="rounded-xl border border-black/5 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-3">
          <p className="text-sm font-semibold text-adressa-deep dark:text-slate-100">Vous mettez à jour une adresse existante ?</p>
          <div className="mt-2 flex gap-2"><input value={addressId} onChange={(e) => { setAddressId(e.target.value.toUpperCase()); setExistingAddress(null); }} placeholder="SN-SBK-001" autoCapitalize="characters" className={`${inputClass} mt-0 min-w-0`} /><button type="button" onClick={() => void loadAddress()} disabled={lookupLoading || !addressId.trim()} className="btn-secondary min-h-12 shrink-0 border border-adressa-deep/10 px-3 py-2 text-sm disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100">{lookupLoading ? <LoaderCircle size={16} className="animate-spin" /> : "Charger"}</button><button type="button" onClick={() => setScannerOpen(true)} aria-label="Scanner le QR de la plaque" className="grid min-h-12 min-w-12 place-items-center rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-900 text-adressa-deep dark:text-slate-100"><QrCode size={19} /></button></div>
          {existingAddress ? <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300"><CheckCircle2 size={14} />{existingAddress.adresssaId} chargé · saisie non validée</p> : <p className="mt-2 text-xs leading-5 text-adressa-ink/55 dark:text-slate-400">Laissez vide pour créer une nouvelle adresse. Un identifiant déjà validé ou hors de votre zone ne sera pas accessible.</p>}
          {existingAddress && <button type="button" onClick={resetToCreate} className="mt-2 text-xs font-semibold text-adressa-green dark:text-emerald-400 underline">Annuler et créer une nouvelle saisie</button>}
        </div>
      </div>}

      {step === 1 && <div className="space-y-4">
        {!communes.length ? <p className="rounded-xl bg-amber-50 dark:bg-amber-950/50 p-3 text-sm text-amber-900 dark:text-amber-200">Aucune commune n’est affectée à ce compte. Contactez l’administration pour accéder à votre zone.</p> : <label className="block text-sm font-medium">Commune<select value={communeId} disabled={!!existingAddress || communes.length === 1} onChange={(e) => { setCommuneId(e.target.value); setNeighborhoodId(""); }} className={inputClass}><option value="">Choisir une commune</option>{Array.from(communeGroups.entries()).map(([group, items]) => <optgroup key={group} label={group}>{items.map((commune) => <option key={commune.id} value={commune.id}>{commune.name}</option>)}</optgroup>)}</select></label>}
        {existingAddress ? <label className="block text-sm font-medium">Quartier<select value={neighborhoodId} disabled className={inputClass}><option value={neighborhoodId}>{existingAddress.neighborhood.name}</option></select></label> : <div className="space-y-3"><label className="block text-sm font-medium">Quartier<select value={neighborhoodId} onChange={(e) => { setNeighborhoodId(e.target.value); if (e.target.value) setNewNeighborhood(""); }} disabled={!communeId} className={inputClass}><option value="">Choisir un quartier existant</option>{neighborhoods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{!neighborhoodId && <label className="block text-sm font-medium">Ou saisir un quartier<input value={newNeighborhood} onChange={(e) => setNewNeighborhood(e.target.value)} disabled={!communeId} placeholder="Ex. Tanghor" maxLength={120} className={inputClass} /></label>}</div>}
        <fieldset><legend className="mb-2 text-sm font-semibold text-adressa-deep dark:text-slate-100">Type de bâtiment</legend><div className="grid gap-2 sm:grid-cols-3">{buildingOptions.map((option) => <button key={option.id} type="button" aria-pressed={buildingKind === option.id} onClick={() => setBuildingKind(option.id)} className={`min-h-[76px] rounded-xl border p-3 text-left ${buildingKind === option.id ? "border-adressa-green bg-adressa-light/40 dark:bg-emerald-950/30 ring-1 ring-adressa-green" : "border-black/10 dark:border-white/15 bg-white dark:bg-slate-900"}`}><span className="block text-sm font-bold text-adressa-deep dark:text-slate-100">{option.label}</span><span className="mt-1 block text-xs leading-4 text-adressa-ink/55 dark:text-slate-400">{option.detail}</span></button>)}</div></fieldset>
        {buildingKind === "COMMERCIAL" && <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Enseigne / nom du commerce<input value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="Ex. Boutique Awa" className={inputClass} /></label><label className="text-sm font-medium">Activité <span className="font-normal text-adressa-ink/50 dark:text-slate-400">(facultatif)</span><input value={buildingCategory} onChange={(e) => setBuildingCategory(e.target.value)} placeholder="Alimentation, atelier…" className={inputClass} /></label></div>}
        <label className="block text-sm font-medium">Repère à proximité <span className="font-normal text-adressa-ink/50 dark:text-slate-400">(facultatif)</span><input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Près du marché, face à l’école…" className={inputClass} /></label>
      </div>}

      {step === 2 && <div className="space-y-4">
        <PhotoInput title="Photo de la façade ou de la plaque" file={photo} currentUrl={currentPhotoUrl} loading={photoLoading} onPick={(file) => void pickPhoto(file, "front")} onRemove={() => setPhoto(null)} />
        <fieldset><legend className="mb-2 text-sm font-semibold text-adressa-deep dark:text-slate-100">État de la plaque</legend><div className="grid gap-2 sm:grid-cols-3">{plateOptions.map((option) => <button key={option.id} type="button" aria-pressed={plateState === option.id} onClick={() => setPlateState(option.id)} className={`min-h-12 rounded-xl border px-3 py-2 text-sm font-semibold ${plateState === option.id ? "border-adressa-green bg-adressa-light/40 dark:bg-emerald-950/30 text-adressa-deep dark:text-slate-100 ring-1 ring-adressa-green" : "border-black/10 dark:border-white/15 bg-white dark:bg-slate-900 text-adressa-ink/70 dark:text-slate-300"}`}>{option.label}</button>)}</div></fieldset>
        {plateState === "POSEE" && <PhotoInput title="Photo rapprochée de la plaque" file={platePhoto} currentUrl={existingAddress?.platePhotoUrl ?? null} loading={photoLoading} onPick={(file) => void pickPhoto(file, "plate")} onRemove={() => setPlatePhoto(null)} optional />}
        <div><div className="mb-1 flex items-center justify-between gap-3"><label htmlFor="field-comment" className="text-sm font-semibold text-adressa-deep dark:text-slate-100">Commentaire terrain <span className="font-normal text-adressa-ink/50 dark:text-slate-400">(texte ou dictée vocale)</span></label><button type="button" onClick={transcribeVoiceNote} disabled={listening} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-adressa-green/20 px-3 text-xs font-semibold text-adressa-green dark:text-emerald-400 disabled:opacity-50"><Mic size={15} />{listening ? "Écoute…" : "Dicter"}</button></div><textarea id="field-comment" rows={4} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Décrivez l’accès, la pose ou le problème constaté…" className={inputClass} /><p className="mt-1 text-right text-xs text-adressa-ink/45 dark:text-slate-400">{comment.length}/1000 · la dictée vocale est transcrite en texte</p></div>
        {existingAddress && <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs text-adressa-ink/60 dark:text-slate-400">Mise à jour de <strong className="text-adressa-deep dark:text-slate-100">{existingAddress.adresssaId}</strong>. L’identifiant et le statut de validation restent contrôlés par l’administration.</div>}
      </div>}

      {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-sm text-rose-800 dark:text-rose-300"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
      <div className="flex gap-2 border-t border-black/5 dark:border-white/10 pt-4">
        {step > 0 && <button type="button" onClick={() => { setError(""); setStep((current) => current - 1); }} className="btn-secondary min-h-12 flex-1 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"><ArrowLeft size={17} />Retour</button>}
        {step < 2 ? <button type="button" onClick={() => { if (validateStep()) setStep((current) => current + 1); }} className="btn-primary min-h-12 flex-1">Continuer<ArrowRight size={17} /></button> : <button type="button" onClick={() => void saveRecord()} disabled={saving || photoLoading || !communes.length} className="btn-primary min-h-12 flex-1 disabled:cursor-wait disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={17} /> : online ? <CheckCircle2 size={17} /> : <WifiOff size={17} />}{saving ? "Enregistrement…" : online ? existingAddress ? "Enregistrer la mise à jour" : "Envoyer pour validation" : "Enregistrer hors ligne"}</button>}
      </div>
    </section>

    {scannerOpen && <QrScanner onClose={() => setScannerOpen(false)} onCode={(value) => { setAddressId(value); setScannerOpen(false); void loadAddress(value); }} />}
  </div>
  </div>;
}

function PhotoInput({ title, file, currentUrl, loading, onPick, onRemove, optional = false }: { title: string; file: PhotoPick; currentUrl: string | null; loading: boolean; onPick: (file?: File) => void; onRemove: () => void; optional?: boolean }) {
  const preview = file?.preview ?? currentUrl;
  return <div><div className="mb-2 flex items-center justify-between gap-2"><p className="text-sm font-semibold text-adressa-deep dark:text-slate-100">{title}{optional && <span className="ml-1 font-normal text-adressa-ink/45 dark:text-slate-400">(facultatif)</span>}</p>{preview && <button type="button" onClick={onRemove} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"><X size={14} />Retirer</button>}</div><label className="block cursor-pointer overflow-hidden rounded-xl border border-dashed border-black/20 bg-slate-50 dark:bg-slate-800 text-center transition hover:border-adressa-green">{preview ? <span role="img" aria-label={`Aperçu : ${title}`} className="block h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url("${preview}")` }} /> : <span className="flex min-h-36 flex-col items-center justify-center gap-2 p-4 text-sm text-adressa-ink/60 dark:text-slate-400"><Camera size={25} className="text-adressa-green dark:text-emerald-400" />{loading ? "Préparation de la photo…" : "Toucher pour prendre une photo ou choisir un fichier"}</span>}<input type="file" accept="image/*" capture="environment" onChange={(event) => { onPick(event.target.files?.[0]); event.target.value = ""; }} className="sr-only" />{file && <span className="block bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">Photo prête · {(file.file.size / 1024).toFixed(0)} Ko</span>}</label></div>;
}

function QrScanner({ onClose, onCode }: { onClose: () => void; onCode: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("Pointez la caméra vers le QR code de la plaque.");
  const [error, setError] = useState("");
  useEffect(() => {
    let stream: MediaStream | undefined;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function start() {
      try {
        const Detector = (window as any).BarcodeDetector;
        if (!Detector) { setError("Le scan QR n’est pas disponible sur cet appareil. Saisissez le code ADRESSA manuellement."); return; }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ["qr_code"] });
        const scan = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const result = await detector.detect(videoRef.current);
            const value = result?.[0]?.rawValue as string | undefined;
            const code = value?.match(/SN-[A-Z0-9]+-\d{3,}/i)?.[0]?.toUpperCase();
            if (code) { stopped = true; onCode(code); return; }
            if (value) setMessage("QR lu. Aucun identifiant ADRESSA n’a été trouvé dans ce code.");
          } catch { /* Continuer les essais caméra. */ }
          timer = setTimeout(scan, 350);
        };
        scan();
      } catch { setError("Caméra indisponible ou autorisation refusée. Vous pouvez saisir le code manuellement."); }
    }
    void start();
    return () => { stopped = true; if (timer) clearTimeout(timer); stream?.getTracks().forEach((track) => track.stop()); };
  }, [onCode]);
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label="Scanner une adresse ADRESSA"><div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl"><div className="flex items-center justify-between p-4"><div><h2 className="font-bold text-adressa-deep dark:text-slate-100">Scanner la plaque</h2><p className="text-xs text-adressa-ink/55 dark:text-slate-400">Adresse non validée de votre zone uniquement</p></div><button onClick={onClose} type="button" aria-label="Fermer" className="grid size-10 place-items-center rounded-full bg-slate-100 dark:bg-slate-800"><X size={18} /></button></div><div className="relative aspect-video bg-slate-950"><video ref={videoRef} muted playsInline className="h-full w-full object-cover" /><div className="pointer-events-none absolute inset-[18%] rounded-xl border-2 border-emerald-400" /></div><p className={`p-4 text-sm ${error ? "text-rose-700" : "text-adressa-ink/70 dark:text-slate-300"}`}>{error || message}</p></div></div>;
}
