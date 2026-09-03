import { prisma } from "@/lib/prisma";

type QrAddressRow = {
  id: string;
  adresssaId: string;
  commune: { name: string };
};

export default async function DashboardQrPage({ searchParams }: { searchParams: { id?: string } }) {
  const addresses: QrAddressRow[] = await prisma.address.findMany({
    where: searchParams.id ? { adresssaId: searchParams.id.toUpperCase() } : undefined,
    include: { qrCode: true, commune: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-adressa-deep">QR Codes</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {addresses.map((a) => (
          <div key={a.id} className="card text-center">
            <img
              src={`/api/qr/${a.adresssaId}?format=png`}
              alt={`QR code ${a.adresssaId}`}
              className="mx-auto h-40 w-40"
            />
            <div className="mt-3 font-bold text-adressa-deep">{a.adresssaId}</div>
            <div className="text-xs text-adressa-ink/60">{a.commune.name}</div>
            <div className="mt-3 flex justify-center gap-3 text-sm">
              <a href={`/api/qr/${a.adresssaId}?format=png`} download className="text-adressa-green underline">
                PNG
              </a>
              <a href={`/api/qr/${a.adresssaId}?format=svg`} download className="text-adressa-green underline">
                SVG
              </a>
              <a href={`/a/${a.adresssaId}`} className="text-adressa-green underline">
                Fiche
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Maquette de plaque physique */}
      <h2 className="mb-4 mt-10 text-xl font-bold text-adressa-deep">Maquette de plaque</h2>
      <div className="w-64 rounded-xl2 border-4 border-adressa-deep bg-white p-6 text-center shadow-md">
        <div className="text-lg font-black tracking-widest text-adressa-deep">ADRESSA</div>
        <div className="mt-2 text-2xl font-bold text-adressa-green">{addresses[0]?.adresssaId ?? "SN-SBK-001"}</div>
        {addresses[0] && (
          <img src={`/api/qr/${addresses[0].adresssaId}?format=png`} alt="QR" className="mx-auto mt-3 h-24 w-24" />
        )}
        <div className="mt-2 text-xs text-adressa-ink/60">Scanner pour localiser</div>
      </div>
    </div>
  );
}
