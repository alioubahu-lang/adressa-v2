import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PILOT_ADDRESSES = [
  { id: "SN-SBK-001", plusCode: "PVP4+3C8", lat: 14.7351698, lng: -17.1439253 },
  { id: "SN-SBK-002", plusCode: "PVP4+3C9", lat: 14.7351691, lng: -17.1438918 },
  { id: "SN-SBK-003", plusCode: "PVM4+R8M", lat: 14.7345829, lng: -17.144212 },
  { id: "SN-SBK-004", plusCode: "PVM4+PC5", lat: 14.734268, lng: -17.1439012 },
  { id: "SN-SBK-005", plusCode: "PVM4+GC9", lat: 14.7337752, lng: -17.1438948 }
];

async function main() {
  console.log("Seed ADRESSA — démarrage…");

  const country = await prisma.country.upsert({
    where: { code: "SN" },
    update: {},
    create: { name: "Sénégal", code: "SN" }
  });

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
    update: {},
    create: { id: "neighborhood-dogar-seed", name: "Dogar", communeId: commune.id }
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
      update: {},
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
        landmark: "À proximité de TotalEnergies Sébikotane",
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
