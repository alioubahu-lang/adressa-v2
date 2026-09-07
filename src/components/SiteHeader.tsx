"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/search", label: "Rechercher" },
  { href: "/map", label: "Carte" },
  { href: "/entreprises", label: "Entreprises" },
  { href: "/collectivites", label: "Collectivités" },
  { href: "/login", label: "Dashboard" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon-512.png" alt="ADRESSA" width={36} height={36} className="rounded-lg" />
          <span className="text-xl font-black tracking-widest text-adressa-deep">ADRESSA</span>
        </Link>

        <nav className="hidden gap-6 text-sm font-medium text-adressa-ink/70 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-adressa-deep">
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-2xl leading-none text-adressa-deep md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-black/5 bg-white px-6 py-3 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2 text-sm font-medium text-adressa-ink/70 hover:bg-adressa-light hover:text-adressa-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
