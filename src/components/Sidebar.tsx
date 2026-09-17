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

export function Sidebar({ role }: { role?: Role }) {
  let items = operationalItems;
  if (role === "MUNICIPAL_ADMIN" || role === "MUNICIPAL") items = municipalItems;
  if (role === "LOGISTICS_PARTNER") items = logisticsItems;

  const extra =
    role === "SUPER_ADMIN"
      ? [
          { href: "/dashboard/fiscal", label: "Vue municipale" },
          { href: "/dashboard/logistics", label: "ADRESSA ROUTE" }
        ]
      : [];

  const settingsItem = { href: "/dashboard/settings", label: "Paramètres" };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-black/5 bg-white px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Image src="/logo-icon-512.png" alt="ADRESSA" width={28} height={28} className="rounded-md" />
        <span className="text-lg font-black tracking-widest text-adressa-deep">ADRESSA</span>
      </div>
      <nav className="flex flex-col gap-1">
        {[...items, ...extra, settingsItem].map((item) => (
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
