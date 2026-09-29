"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Database, MapPin, Wifi, WifiOff, X } from "lucide-react";
import { getPendingAddresses } from "@/lib/offlineQueue";

export function AgentNetworkStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);
  return <span className="inline-flex items-center gap-2">{online ? <Wifi size={15} className="text-emerald-300" /> : <WifiOff size={15} className="text-amber-300" />}{online ? "En ligne" : "Hors ligne"}</span>;
}

export function TerrainActions() {
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  useEffect(() => { getPendingAddresses().then((rows) => setOfflineCount(rows.length)).catch(() => setOfflineCount(0)); }, []);

  function locate() {
    setError("");
    if (!navigator.geolocation) { setError("Géolocalisation indisponible sur cet appareil."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPosition(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)} · précision ±${Math.round(coords.accuracy)} m`),
      () => setError("Position indisponible. Vérifiez l’autorisation de localisation."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  return <>
    <section aria-label="Actions terrain" className="grid gap-3 sm:grid-cols-3">
      <button type="button" onClick={locate} className="flex min-h-[68px] items-center gap-3 rounded-2xl bg-adressa-deep px-4 py-3 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-adressa-green hover:shadow-md">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10"><MapPin size={21} /></span><span><strong className="block text-sm">Géolocaliser ma position</strong><span className="text-xs text-white/65">{position || "Démarrer une collecte GPS"}</span></span>
      </button>
      <button type="button" onClick={() => setScanOpen(true)} className="flex min-h-[68px] items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><Camera size={21} /></span><span><strong className="block text-sm text-adressa-deep">Scanner un QR Code / plaque</strong><span className="text-xs text-adressa-ink/55">Lecture par la caméra</span></span><ArrowRight className="ml-auto text-adressa-ink/30" size={17} />
      </button>
      <Link href="/dashboard/addresses/new" className="flex min-h-[68px] items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700"><Database size={21} /></span><span><strong className="block text-sm text-adressa-deep">Saisie rapide hors ligne</strong><span className="text-xs text-adressa-ink/55">{offlineCount ? `${offlineCount} en attente de synchro` : "Enregistrement local disponible"}</span></span><ArrowRight className="ml-auto text-adressa-ink/30" size={17} />
      </Link>
    </section>
    {(error || position) && <p role={error ? "alert" : undefined} className={`-mt-3 text-xs ${error ? "text-rose-700" : "text-adressa-ink/60"}`}>{error || `Position obtenue : ${position}`}</p>}
    {scanOpen && <QrScanner onClose={() => setScanOpen(false)} />}
  </>;
}

function QrScanner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("Placez le QR code dans le cadre.");
  const [cameraError, setCameraError] = useState("");
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    let stream: MediaStream | undefined;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function start() {
      try {
        const Detector = (window as any).BarcodeDetector;
        if (!Detector) { setCameraError("Le scan QR n’est pas pris en charge par ce navigateur. Vous pouvez ouvrir une saisie manuelle."); return; }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ["qr_code"] });
        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            const raw = results?.[0]?.rawValue as string | undefined;
            if (raw) {
              const code = raw.match(/[A-Z]{2}-[A-Z0-9]+-\d{3,}/i)?.[0]?.toUpperCase();
              if (code) { stopped = true; router.push(`/dashboard/addresses/${encodeURIComponent(code)}/edit`); onCloseRef.current(); return; }
              setMessage("QR détecté, mais aucun code ADRESSA n’a été trouvé.");
            }
          } catch { /* Le scan continue pendant que la caméra ajuste son image. */ }
          timer = setTimeout(tick, 350);
        };
        tick();
      } catch {
        setCameraError("Accès caméra refusé ou indisponible. Autorisez la caméra puis réessayez.");
      }
    }
    start();
    return () => { stopped = true; if (timer) clearTimeout(timer); stream?.getTracks().forEach((track) => track.stop()); };
  }, [router]);

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label="Scanner un QR Code">
    <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between px-5 py-4"><div><h2 className="font-bold text-adressa-deep">Scanner une plaque ADRESSA</h2><p className="text-xs text-adressa-ink/55">Le scan vérifie si la saisie est modifiable par votre compte.</p></div><button type="button" onClick={onClose} aria-label="Fermer le scanner" className="grid size-10 place-items-center rounded-full bg-slate-100"><X size={19} /></button></div><div className="relative aspect-video bg-slate-950"><video ref={videoRef} muted playsInline className="h-full w-full object-cover" /><div className="pointer-events-none absolute inset-[18%] rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_999px_rgba(2,6,23,0.24)]" /></div><div className="p-5"><p className={`text-sm ${cameraError ? "text-rose-700" : "text-adressa-ink/70"}`}>{cameraError || message}</p>{cameraError && <Link href="/dashboard/addresses/new" onClick={onClose} className="btn-primary mt-4 w-full">Saisir une adresse manuellement</Link>}</div></div>
  </div>;
}
