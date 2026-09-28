import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/SiteHeader";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
  return (
    <main>
      <SiteHeader />
      <h1 className="sr-only">Carte des adresses ADRESSA</h1>
      <div className="h-[calc(100vh-73px)] min-h-[480px]">
        <MapView />
      </div>
    </main>
  );
}
