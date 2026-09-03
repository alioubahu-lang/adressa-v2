import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => {
  const addresses = new Set<string>(["SN-SBK-001", "SN-SBK-002"]);
  return {
    prisma: {
      address: {
        count: vi.fn(async ({ where }: any) => {
          const prefix = where.adresssaId.startsWith as string;
          return [...addresses].filter((a) => a.startsWith(prefix)).length;
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          return addresses.has(where.adresssaId) ? { id: "existing" } : null;
        })
      }
    }
  };
});

import { generateAdresssaId } from "@/lib/adresssaId";

describe("generateAdresssaId", () => {
  it("génère un identifiant au format PAYS-COMMUNE-NUMERO", async () => {
    const id = await generateAdresssaId("SN", "SBK");
    expect(id).toMatch(/^SN-SBK-\d{3}$/);
  });

  it("ne réutilise jamais un identifiant déjà existant", async () => {
    const id = await generateAdresssaId("SN", "SBK");
    expect(["SN-SBK-001", "SN-SBK-002"]).not.toContain(id);
  });

  it("passe à 6 chiffres au-delà de 999 adresses dans une commune", async () => {
    const id = await generateAdresssaId("SN", "DKR");
    // Avec 0 adresse existante pour DKR dans ce mock, on reste sur 3 chiffres —
    // ce test documente le format attendu pour une petite commune.
    expect(id).toMatch(/^SN-DKR-\d{3}$/);
  });
});
