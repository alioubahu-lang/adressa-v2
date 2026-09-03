"use client";

/**
 * File d'attente hors-ligne pour la création d'adresses.
 *
 * ADRESSA V2 n'implémente pas une synchronisation complète (ce n'était pas requis
 * pour ce MVP), mais prépare l'architecture : lorsqu'un agent terrain crée une
 * adresse sans connexion, la saisie (données + photo en base64) est stockée
 * localement puis synchronisée automatiquement dès le retour du réseau.
 *
 * Stockage : localStorage (simple, suffisant pour quelques dizaines d'adresses
 * en attente). Une vraie synchronisation à grande échelle utiliserait IndexedDB.
 */

const STORAGE_KEY = "adressa:pending-addresses";

export type PendingAddress = {
  localId: string;
  createdAt: string;
  payload: Record<string, unknown>;
  photoBase64?: string;
  photoType?: string;
};

export function getPendingAddresses(): PendingAddress[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function queueAddress(payload: Record<string, unknown>, photoBase64?: string, photoType?: string): void {
  const pending = getPendingAddresses();
  pending.push({
    localId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload,
    photoBase64,
    photoType
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

function removeFromQueue(localId: string): void {
  const pending = getPendingAddresses().filter((p) => p.localId !== localId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

function base64ToFile(base64: string, type: string, filename: string): File {
  const byteString = atob(base64.split(",")[1] ?? base64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
  return new File([bytes], filename, { type });
}

/**
 * Tente de synchroniser toutes les adresses en attente avec le serveur.
 * À appeler au retour de connexion (voir hook useOfflineSync) ou manuellement
 * depuis le dashboard.
 */
export async function syncPendingAddresses(): Promise<{ synced: number; failed: number }> {
  const pending = getPendingAddresses();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      let photoUrl: string | undefined;

      if (item.photoBase64 && item.photoType) {
        const file = base64ToFile(item.photoBase64, item.photoType, `${item.localId}.jpg`);
        const form = new FormData();
        form.append("photo", file);
        form.append("adresssaId", `DRAFT-${item.localId.slice(0, 8).toUpperCase()}`);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        if (uploadRes.ok) {
          photoUrl = (await uploadRes.json()).url;
        }
      }

      const res = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item.payload, photoUrl })
      });

      if (res.ok) {
        removeFromQueue(item.localId);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
