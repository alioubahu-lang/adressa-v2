import { put } from "@vercel/blob";
import sharp from "sharp";

/**
 * Stockage des photos de bâtiments.
 *
 * Implémentation par défaut : Vercel Blob (aligné avec le déploiement cible du projet).
 * Pour changer de fournisseur en production (S3, Cloudinary, Supabase Storage…),
 * il suffit de remplacer le corps de `uploadAddressPhoto` — le reste de l'application
 * ne dépend que de l'URL publique retournée.
 *
 * Important pour l'Afrique : on compresse systématiquement l'image avant upload
 * (redimensionnement + conversion WebP) pour rester léger sur les connexions lentes.
 */
export async function uploadAddressPhoto(file: Buffer, adresssaId: string): Promise<string> {
  const compressed = await sharp(file)
    .rotate() // corrige l'orientation EXIF (photos prises au téléphone)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  const filename = `addresses/${adresssaId}/${Date.now()}.webp`;

  const blob = await put(filename, compressed, {
    access: "public",
    contentType: "image/webp",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return blob.url;
}

export const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo avant compression
