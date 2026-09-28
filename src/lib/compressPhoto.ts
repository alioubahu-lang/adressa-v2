"use client";

const MAX_DIMENSION = 1600;
const TARGET_SIZE = 1_200_000;

export async function compressPhoto(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Choisissez un fichier image.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("La compression de la photo a échoué.");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (let quality = 0.82; quality >= 0.5; quality -= 0.08) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("La compression de la photo a échoué.");
    if (blob.size <= TARGET_SIZE || quality <= 0.5) {
      const basename = file.name.replace(/\.[^.]+$/, "") || "photo";
      return new File([blob], `${basename}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
    }
  }
  throw new Error("La compression de la photo a échoué.");
}
