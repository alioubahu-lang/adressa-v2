"use client";

import { useState } from "react";

type ShareButtonProps = {
  url: string;
  title: string;
  text: string;
  className?: string;
};

export function ShareButton({ url, title, text, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // L'utilisateur a annulé le partage natif, ou l'appareil ne le supporte pas
        // vraiment malgré la détection — on retente via la copie ci-dessous.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copie impossible (permissions navigateur) — on ne bloque pas l'utilisateur.
    }
  }

  return (
    <button type="button" onClick={handleShare} className={className}>
      {copied ? "✓ Adresse copiée" : "↗ Partager"}
    </button>
  );
}
