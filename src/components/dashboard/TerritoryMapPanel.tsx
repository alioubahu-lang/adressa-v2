"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

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
  verified: boolean;
  createdAt: string; // ISO
};

type Filter = "all" | "recent" | "unverified";

export function TerritoryMapPanel({ addresses }: { addresses: DashboardAddress[] }) {
  const [filter, setFilter] = useState<Filter>("all");

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
    <div className="card p-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 p-4">
        <h2 className="text-sm font-bold text-adressa-deep">Vue territoriale</h2>
        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      <div className="relative h-96">
        <MapContainer center={center} zoom={16} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((a) => (
            <Marker key={a.adresssaId} position={[a.latitude, a.longitude]} icon={a.verified ? verifiedIcon : markerIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{a.adresssaId}</div>
                  <div>
                    {a.commune} · {a.neighborhood}
                  </div>
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
