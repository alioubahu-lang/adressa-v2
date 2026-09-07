"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyButton({ value, label, copiedLabel = "Copié !", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "text-xs font-semibold text-adressa-green underline underline-offset-2 hover:text-adressa-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-adressa-green"
      }
    >
      {copied ? copiedLabel : failed ? "Échec de la copie" : label}
    </button>
  );
}
