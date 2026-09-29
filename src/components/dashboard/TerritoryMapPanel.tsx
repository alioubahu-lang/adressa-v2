"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip as MapTooltip, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { Maximize2, Minimize2 } from "lucide-react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const verifiedIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:#0E7C50;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export type DashboardAddress = {
  adresssaId: string;
  latitude: number;
  longitude: number;
  commune: string;
  neighborhood: string;
  landmark: string | null;
  verified: boolean;
  createdAt: string; // ISO
};

type Filter = "all" | "recent" | "unverified";

function InvalidateMapSize({ active }: { active: boolean }) {
  const map = useMap();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => window.cancelAnimationFrame(frame);
  }, [active, map]);

  return null;
}

export function TerritoryMapPanel({ addresses }: { addresses: DashboardAddress[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(document.fullscreenElement === panelRef.current);
    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  async function toggleFullscreen() {
    if (!panelRef.current) return;
    if (document.fullscreenElement === panelRef.current) {
      await document.exitFullscreen();
    } else {
      await panelRef.current.requestFullscreen();
    }
  }

  const filtered = useMemo(() => {
    if (filter === "unverified") return addresses.filter((a) => !a.verified);
    if (filter === "recent") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return addresses.filter((a) => new Date(a.createdAt).getTime() >= sevenDaysAgo);
    }
    return addresses;
  }, [addresses, filter]);

  const center: [number, number] =
    filtered.length > 0
      ? [filtered[0].latitude, filtered[0].longitude]
      : addresses.length > 0
        ? [addresses[0].latitude, addresses[0].longitude]
        : [14.7351698, -17.1439253];

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: `Toutes (${addresses.length})` },
    { id: "recent", label: "Récentes (7j)" },
    { id: "unverified", label: "Non vérifiées" }
  ];

  return (
    <div ref={panelRef} className={`card flex flex-col overflow-hidden p-0 ${isFullscreen ? "h-screen bg-white p-4" : ""}`}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-black/5 p-4">
        <h2 className="text-sm font-bold text-adressa-deep">Vue territoriale</h2>
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === c.id ? "bg-adressa-deep text-white" : "bg-adressa-gray text-adressa-ink/60 hover:bg-adressa-light"
              }`}
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Quitter le plein écran" : "Afficher la carte en plein écran"}
            aria-pressed={isFullscreen}
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            className="ml-1 grid size-9 place-items-center rounded-lg border border-black/10 bg-white text-adressa-ink/70 transition hover:bg-adressa-light hover:text-adressa-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-adressa-green"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>

      <div className={`relative min-h-80 ${isFullscreen ? "flex-1" : "h-96"}`}>
        <MapContainer center={center} zoom={16} zoomControl={false} style={{ height: "100%", width: "100%" }}>
          <InvalidateMapSize active={isFullscreen} />
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((a) => (
            <Marker key={a.adresssaId} position={[a.latitude, a.longitude]} icon={a.verified ? verifiedIcon : markerIcon}>
              <MapTooltip direction="top" offset={[0, -10]} sticky>
                <div className="text-xs">
                  <div className="font-bold">{a.adresssaId}</div>
                  <div>{a.landmark || "Repère non renseigné"}</div>
                </div>
              </MapTooltip>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{a.adresssaId}</div>
                  <div>
                    {a.commune} · {a.neighborhood}
                  </div>
                  <div className="mt-1 text-adressa-ink/65">{a.landmark || "Repère non renseigné"}</div>
                  <Link href={`/dashboard/addresses/${a.adresssaId}/edit`} className="mt-1 inline-block text-adressa-green underline">
                    Modifier
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-[11px] text-adressa-ink/70 shadow">
          🟢 Vérifiée &nbsp; 🔵 En attente
        </div>
      </div>
    </div>
  );
}
