"use client";

const DB_NAME = "adressa-field-queue";
const DB_VERSION = 1;
const STORE_NAME = "addresses";
const LEGACY_STORAGE_KEY = "adressa:pending-addresses";

export type PendingPhoto = { field: string; file: File };
export type PendingAddress = {
  localId: string;
  createdAt: string;
  payload: Record<string, unknown>;
  photos: PendingPhoto[];
};

function openQueueDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "localId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Impossible d'ouvrir la file hors ligne."));
  });
}

function base64ToFile(base64: string, type: string, filename: string): File {
  const bytesString = atob(base64.split(",")[1] ?? base64);
  const bytes = new Uint8Array(bytesString.length);
  for (let index = 0; index < bytesString.length; index++) bytes[index] = bytesString.charCodeAt(index);
  return new File([bytes], filename, { type });
}

async function migrateLegacyQueue(db: IDBDatabase): Promise<void> {
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) return;

  try {
    const records = JSON.parse(legacy) as Array<{
      localId: string;
      createdAt: string;
      payload: Record<string, unknown>;
      photoBase64?: string;
      photoType?: string;
    }>;
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    for (const record of records) {
      store.put({
        localId: record.localId,
        createdAt: record.createdAt,
        payload: { ...record.payload, clientRequestId: record.payload.clientRequestId ?? record.localId },
        photos: record.photoBase64
          ? [{ field: "photoUrl", file: base64ToFile(record.photoBase64, record.photoType ?? "image/jpeg", `${record.localId}.jpg`) }]
          : []
      } satisfies PendingAddress);
    }
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Keep the legacy data intact if it cannot be converted on this device.
  }
}

export async function getPendingAddresses(): Promise<PendingAddress[]> {
  const db = await openQueueDb();
  await migrateLegacyQueue(db);
  const transaction = db.transaction(STORE_NAME, "readonly");
  const request = transaction.objectStore(STORE_NAME).getAll();
  const rows = await new Promise<PendingAddress[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as PendingAddress[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function queueAddress(
  payload: Record<string, unknown>,
  photos: PendingPhoto[]
): Promise<string> {
  const db = await openQueueDb();
  const localId = crypto.randomUUID();
  const record: PendingAddress = {
    localId,
    createdAt: new Date().toISOString(),
    payload: { ...payload, clientRequestId: payload.clientRequestId ?? localId },
    photos
  };
  const transaction = db.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).add(record);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  db.close();
  return localId;
}

async function updateQueuedPayload(localId: string, payload: Record<string, unknown>): Promise<void> {
  const db = await openQueueDb();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(localId);
  request.onsuccess = () => {
    if (request.result) store.put({ ...request.result, payload });
  };
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  db.close();
}

async function removeFromQueue(localId: string): Promise<void> {
  const db = await openQueueDb();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(localId);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  db.close();
}

export async function syncPendingAddresses(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingAddresses();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      let payload: Record<string, unknown> = { ...item.payload, clientRequestId: item.payload.clientRequestId ?? item.localId };
      for (const photo of item.photos ?? []) {
        if (typeof payload[photo.field] === "string" && payload[photo.field]) continue;
        const form = new FormData();
        form.append("photo", photo.file, photo.file.name || `${item.localId}.jpg`);
        form.append("adresssaId", `DRAFT-${item.localId.slice(0, 8).toUpperCase()}`);
        const upload = await fetch("/api/upload", { method: "POST", body: form });
        if (!upload.ok) throw new Error("Échec d'envoi d'une photo.");
        const { url } = (await upload.json()) as { url: string };
        payload = { ...payload, [photo.field]: url };
        await updateQueuedPayload(item.localId, payload);
      }

      const response = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Échec de synchronisation de l'adresse.");
      await removeFromQueue(item.localId);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
