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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        <Link href="/" aria-label="ADRESSA — Accueil" className="flex shrink-0 items-center">
          <Image
            src="/logo-full.png"
            alt="ADRESSA — Adressage numérique et physique pour l’Afrique"
            width={2048}
            height={683}
            priority
            className="h-12 w-auto object-contain sm:h-14"
          />
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
