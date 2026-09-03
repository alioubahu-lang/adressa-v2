"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

// Icône par défaut Leaflet (les assets par défaut ne se chargent pas bien avec Next.js)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

type MapAddress = {
  adresssaId: string;
  latitude: number;
  longitude: number;
  commune: { name: string };
  neighborhood: { name: string };
  photoUrl: string | null;
};

export default function MapView() {
  const [addresses, setAddresses] = useState<MapAddress[]>([]);

  useEffect(() => {
    fetch("/api/map?public=true")
      .then((r) => r.json())
      .then((data) => setAddresses(data.items ?? []));
  }, []);

  const center: [number, number] =
    addresses.length > 0 ? [addresses[0].latitude, addresses[0].longitude] : [14.7351698, -17.1439253];

  return (
    <MapContainer center={center} zoom={16} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {addresses.map((a) => (
        <Marker key={a.adresssaId} position={[a.latitude, a.longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-bold">{a.adresssaId}</div>
              <div>{a.commune.name} · {a.neighborhood.name}</div>
              <Link href={`/a/${a.adresssaId}`} className="mt-1 inline-block text-adressa-green underline">
                Voir l&apos;adresse
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
