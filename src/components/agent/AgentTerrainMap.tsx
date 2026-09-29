"use client";

import dynamic from "next/dynamic";

export type AgentMapAddress = {
  id: string;
  code: string;
  latitude: number;
  longitude: number;
  status: string;
  landmark: string | null;
  neighborhood: string;
};

const AgentTerrainLeaflet = dynamic(() => import("@/components/agent/AgentTerrainLeaflet"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-slate-100 text-sm text-slate-500">Chargement de la carte…</div>
});

export default function AgentTerrainMap({ addresses }: { addresses: AgentMapAddress[] }) {
  return <AgentTerrainLeaflet addresses={addresses} />;
}
