import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
type TerritorialData = { regions: { name: string; departments: { name: string; communes: string[] }[] }[] };

function slug(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function seedSenegalTerritory(countryId: string) {
  const raw = readFileSync(join(process.cwd(), "prisma", "senegal-territorial.json"), "utf8").replace(/^\uFEFF/, "");
  const data = JSON.parse(raw) as TerritorialData;
  for (const regionData of data.regions) {
    const regionSlug = slug(regionData.name);
    const regionId = regionSlug === "dakar" ? "region-dakar-seed" : `sn-region-${regionSlug}`;
    await prisma.region.upsert({ where: { id: regionId }, update: { name: regionData.name, countryId }, create: { id: regionId, name: regionData.name, countryId } });
    for (const departmentData of regionData.departments) {
      const departmentSlug = slug(departmentData.name);
      const departmentId = regionSlug === "dakar" && departmentSlug === "rufisque" ? "dept-rufisque-seed" : `sn-dept-${regionSlug}-${departmentSlug}`;
      await prisma.department.upsert({ where: { id: departmentId }, update: { name: departmentData.name, regionId }, create: { id: departmentId, name: departmentData.name, regionId } });
      const occurrences = new Map<string, number>();
      for (const sourceName of departmentData.communes) {
        const name = sourceName.startsWith("Thiès (subdivisée en :") ? "Thiès Est" : sourceName;
        const communeSlug = slug(name);
        if (regionSlug === "dakar" && departmentSlug === "rufisque" && communeSlug === "sebikhotane") {
          const id = "commune-sebikotane-seed";
          await prisma.commune.upsert({ where: { id }, update: { name: "Sébikotane", departmentId, code: "SBK" }, create: { id, name: "Sébikotane", departmentId, code: "SBK" } });
          continue;
        }
        const ordinal = (occurrences.get(communeSlug) ?? 0) + 1;
        occurrences.set(communeSlug, ordinal);
        const id = `sn-commune-${regionSlug}-${departmentSlug}-${communeSlug}-${ordinal}`;
        const code = `${communeSlug.replace(/-/g, "")}${departmentSlug.replace(/-/g, "")}`.slice(0, 6).toUpperCase();
        await prisma.commune.upsert({ where: { id }, update: { name, departmentId, code }, create: { id, name, departmentId, code } });
      }
    }
  }
  console.log("Référentiel territorial du Sénégal chargé.");
}

const PILOT_ADDRESSES = [
  { id: "SN-SBK-001", plusCode: "PVP4+3C8", lat: 14.7351698, lng: -17.1439253, landmark: "À proximité de TotalEnergies Sébikotane" },
  { id: "SN-SBK-002", plusCode: "PVP4+3C9", lat: 14.7351691, lng: -17.1438918, landmark: "Face à la mosquée centrale de Tanghor" },
  { id: "SN-SBK-003", plusCode: "PVM4+R8M", lat: 14.7345829, lng: -17.144212, landmark: "Près de l’école primaire de Tanghor" },
  { id: "SN-SBK-004", plusCode: "PVM4+PC5", lat: 14.734268, lng: -17.1439012, landmark: "À l’angle de la route principale et de la rue du marché" },
  { id: "SN-SBK-005", plusCode: "PVM4+GC9", lat: 14.7337752, lng: -17.1438948, landmark: "Derrière le poste de santé de Sébikotane" }
];

async function main() {
  console.log("Seed ADRESSA — démarrage…");

  const country = await prisma.country.upsert({
    where: { code: "SN" },
    update: {},
    create: { name: "Sénégal", code: "SN" }
  });

  await seedSenegalTerritory(country.id);

  const region = await prisma.region.upsert({
    where: { id: "region-dakar-seed" },
    update: {},
    create: { id: "region-dakar-seed", name: "Dakar", countryId: country.id }
  });

  const department = await prisma.department.upsert({
    where: { id: "dept-rufisque-seed" },
    update: {},
    create: { id: "dept-rufisque-seed", name: "Rufisque", regionId: region.id }
  });

  const commune = await prisma.commune.upsert({
    where: { id: "commune-sebikotane-seed" },
    update: {},
    create: { id: "commune-sebikotane-seed", name: "Sébikotane", code: "SBK", departmentId: department.id }
  });

  const neighborhood = await prisma.neighborhood.upsert({
    where: { id: "neighborhood-dogar-seed" },
    update: { name: "Tanghor" },
    create: { id: "neighborhood-dogar-seed", name: "Tanghor", communeId: commune.id }
  });

  // Compte administrateur de démonstration — mot de passe fourni via variable d'environnement,
  // jamais codé en dur.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@adressa.sn";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.warn(
      "⚠️  SEED_ADMIN_PASSWORD n'est pas défini dans .env — le compte admin de démonstration ne sera pas créé."
    );
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: "Administrateur ADRESSA",
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN"
      }
    });
    console.log(`Compte admin de démonstration créé : ${adminEmail}`);
  }

  for (const [index, a] of PILOT_ADDRESSES.entries()) {
    const address = await prisma.address.upsert({
      where: { adresssaId: a.id },
      update: { buildingType: "Maison individuelle", landmark: a.landmark },
      create: {
        adresssaId: a.id,
        countryId: country.id,
        regionId: region.id,
        departmentId: department.id,
        communeId: commune.id,
        neighborhoodId: neighborhood.id,
        latitude: a.lat,
        longitude: a.lng,
        plusCode: a.plusCode,
        landmark: a.landmark,
        buildingType: "Maison individuelle",
        status: "PUBLIE",
        verified: true
      }
    });

    await prisma.qrCode.upsert({
      where: { addressId: address.id },
      update: {},
      create: {
        addressId: address.id,
        code: a.id,
        targetUrl: `/a/${a.id}`
      }
    });

    console.log(`Adresse pilote créée : ${a.id} (${index + 1}/${PILOT_ADDRESSES.length})`);
  }

  console.log("Seed ADRESSA — terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
