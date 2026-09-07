"use client";

import { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

type SingleAddressMapProps = {
  latitude: number;
  longitude: number;
  label: string;
  landmark?: string | null;
};

export default function SingleAddressMap({ latitude, longitude, label, landmark }: SingleAddressMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  function recenter() {
    mapRef.current?.setView([latitude, longitude], 17, { animate: true });
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[latitude, longitude]} zoom={17} style={{ height: "100%", width: "100%" }} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-bold">{label}</div>
              {landmark && <div>{landmark}</div>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      <button
        type="button"
        onClick={recenter}
        className="absolute bottom-4 right-4 z-[1000] rounded-full bg-white px-3 py-2 text-xs font-semibold text-adressa-deep shadow-md hover:bg-adressa-light focus:outline-none focus-visible:ring-2 focus-visible:ring-adressa-green"
        aria-label="Recentrer la carte sur le bâtiment"
      >
        🎯 Recentrer
      </button>
    </div>
  );
}
