import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Vue générale" },
  { href: "/dashboard/addresses", label: "Adresses" },
  { href: "/map", label: "Carte" },
  { href: "/dashboard/qr", label: "QR Codes" },
  { href: "/dashboard/settings", label: "Paramètres" }
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-black/5 bg-white px-4 py-6 md:flex">
      <div className="mb-8 px-2 text-lg font-black tracking-widest text-adressa-deep">ADRESSA</div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
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
