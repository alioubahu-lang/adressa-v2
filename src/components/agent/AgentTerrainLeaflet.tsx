"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AgentMapAddress } from "@/components/agent/AgentTerrainMap";

const temporaryIcon = (color: string) => L.divIcon({
  className: "agent-map-marker",
  html: `<span style="display:block;width:15px;height:15px;border:3px solid white;border-radius:50%;background:${color};box-shadow:0 1px 6px #0005"></span>`,
  iconSize: [15, 15],
  iconAnchor: [7, 7]
});

const pendingIcon = temporaryIcon("#f59e0b");
const correctionIcon = temporaryIcon("#e11d48");
const gpsIcon = L.divIcon({
  className: "agent-gps-marker",
  html: `<span style="display:block;width:19px;height:19px;border:4px solid white;border-radius:50%;background:#0284c7;box-shadow:0 0 0 7px #0284c733,0 2px 8px #0005"></span>`,
  iconSize: [19, 19],
  iconAnchor: [9, 9]
});

function Recenter({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 17, { duration: 0.8 }); }, [map, position]);
  return null;
}

export default function AgentTerrainLeaflet({ addresses }: { addresses: AgentMapAddress[] }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const center: [number, number] = [14.7351698, -17.1439253];

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (p) => setPosition([p.coords.latitude, p.coords.longitude]),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
    <Recenter position={position} />
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {position && <Marker position={position} icon={gpsIcon}><Popup>Votre position GPS</Popup></Marker>}
    {addresses.map((address) => <Marker key={address.id} position={[address.latitude, address.longitude]} icon={address.status === "BROUILLON" ? correctionIcon : pendingIcon}>
      <Popup><div className="text-sm"><strong>{address.code}</strong><div>{address.neighborhood} · {address.landmark || "Sans repère"}</div><div className="mt-1 font-medium">{address.status === "BROUILLON" ? "À corriger" : "En attente"}</div></div></Popup>
    </Marker>)}
  </MapContainer>;
}
