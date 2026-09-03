import { prisma } from "./prisma";

/**
 * Génère un identifiant ADRESSA unique du type SN-SBK-001.
 *
 * Règles :
 * - Format : {CODE_PAYS}-{CODE_COMMUNE}-{NUMERO}
 * - Le numéro est complété sur 3 chiffres tant que la commune compte moins de
 *   1000 adresses, puis passe automatiquement à 6 chiffres (ex: SN-DKR-000001)
 *   pour permettre l'échelle sans jamais casser le format existant.
 * - En cas de collision (rare, concurrence), on retente avec le numéro suivant.
 */
export async function generateAdresssaId(countryCode: string, communeCode: string): Promise<string> {
  const prefix = `${countryCode.toUpperCase()}-${communeCode.toUpperCase()}`;

  const count = await prisma.address.count({
    where: { adresssaId: { startsWith: `${prefix}-` } }
  });

  const padLength = count >= 999 ? 6 : 3;

  for (let attempt = 0; attempt < 20; attempt++) {
    const next = count + 1 + attempt;
    const candidate = `${prefix}-${String(next).padStart(padLength, "0")}`;

    const existing = await prisma.address.findUnique({
      where: { adresssaId: candidate },
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error(`Impossible de générer un identifiant ADRESSA unique pour ${prefix} après plusieurs tentatives.`);
}
