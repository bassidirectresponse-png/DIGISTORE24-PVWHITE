import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await db.user.upsert({
    where: { email: "demo@digistore-forge.local" },
    update: {},
    create: {
      email: "demo@digistore-forge.local",
      passwordHash,
      name: "Demo User",
    },
  });

  await db.companyProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      legalName: "Vanguard Group Ltda",
      tradingName: "Vanguard Group",
      taxIdType: "CNPJ",
      taxIdNumber: "63.373.434/0001-57",
      addressStreet: "Rua Jose Maria Resende",
      addressNumber: "728",
      addressComplement: "Loja 4 Quadra sem Saida",
      addressDistrict: "Centro",
      addressCity: "São Sebastião da Vargem Alegre",
      addressState: "MG",
      addressZip: "36797-000",
      addressCountry: "Brasil",
      contactEmail: "vanguardgroup.10m@gmail.com",
      supportEmail: "vanguardgroup.10m@gmail.com",
      legalRepName: "Guilherme Augusto Bassi",
    },
  });

  console.log("Seed complete:");
  console.log("  email: demo@digistore-forge.local");
  console.log("  password: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
