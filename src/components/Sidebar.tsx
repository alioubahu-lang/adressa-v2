import Link from "next/link";
import Image from "next/image";
import type { Role } from "@/lib/permissions";

const operationalItems = [
  { href: "/dashboard", label: "Vue générale" },
  { href: "/dashboard/addresses", label: "Adresses" },
  { href: "/map", label: "Carte" },
  { href: "/dashboard/qr", label: "QR Codes" }
];

const municipalItems = [
  { href: "/dashboard/fiscal", label: "Vue municipale" },
  { href: "/map", label: "Carte" }
];

const logisticsItems = [{ href: "/dashboard/logistics", label: "ADRESSA ROUTE" }];
const agentItems = [
  { href: "/dashboard/terrain", label: "Mon espace terrain" },
  { href: "/dashboard/addresses/new", label: "Nouvelle saisie" },
  { href: "/dashboard/terrain#mes-saisies", label: "Mes saisies" }
];

export function Sidebar({ role }: { role?: Role }) {
  let items = operationalItems;
  if (role === "AGENT") items = agentItems;
  if (role === "MUNICIPAL_ADMIN" || role === "MUNICIPAL") items = municipalItems;
  if (role === "LOGISTICS_PARTNER") items = logisticsItems;

  const extra =
    role === "SUPER_ADMIN"
      ? [
          { href: "/dashboard/fiscal", label: "Vue municipale" },
          { href: "/dashboard/logistics", label: "ADRESSA ROUTE" }
        ]
      : [];

  const settingsItem = role === "AGENT" ? null : { href: "/dashboard/settings", label: "Paramètres" };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-black/5 bg-white px-4 py-6 md:flex">
      <Link
        href="/"
        aria-label="Revenir à l’accueil ADRESSA"
        title="Retour à l’accueil"
        className="mb-8 flex items-center gap-2 rounded-lg px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-adressa-green"
      >
        <Image src="/logo-icon-512.png" alt="" aria-hidden="true" width={32} height={32} />
        <span className="text-lg font-black tracking-widest text-adressa-deep">ADRESSA</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {[...items, ...extra, ...(settingsItem ? [settingsItem] : [])].map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-adressa-ink/70 hover:bg-adressa-light hover:text-adressa-deep"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
