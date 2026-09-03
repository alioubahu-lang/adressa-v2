import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
        <span className="text-lg font-black tracking-widest text-adressa-deep">ADRESSA — Carte</span>
      </header>
      <div className="flex-1">
        <MapView />
      </div>
    </main>
  );
}
