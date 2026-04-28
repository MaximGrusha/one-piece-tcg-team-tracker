import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const UPDATES = [
  { email: "maxim.h@crew.local",  password: "Seas@Admiral!9k2" },
  { email: "maxim.k@crew.local",  password: "Wave#MaxK$7pL" },
  { email: "victor@crew.local",   password: "Tide&Victor@4mQ" },
  { email: "vlad@crew.local",     password: "Storm#Vlad!8xR" },
  // also update the original admin if exists
  { email: "maximhrusha@gmail.com", password: "Seas@Admiral!9k2" },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  try {
    for (const u of UPDATES) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (!existing) {
        console.log(`⏭  ${u.email} — не знайдено, пропускаємо`);
        continue;
      }

      const passwordHash = await bcrypt.hash(u.password, 12);
      await prisma.user.update({ where: { email: u.email }, data: { passwordHash } });
      console.log(`✓ ${existing.displayName} (${u.email}) — пароль оновлено`);
    }

    console.log("\n✅ Готово! Нові паролі:");
    console.log("┌─────────────────────────────────────────────────────────────────┐");
    for (const u of UPDATES.slice(0, 4)) {
      const existing = await prisma.user.findUnique({ where: { email: u.email }, select: { displayName: true } });
      if (existing) {
        console.log(`│  ${existing.displayName.padEnd(14)} ${u.email.padEnd(26)} ${u.password}`);
      }
    }
    console.log("└─────────────────────────────────────────────────────────────────┘");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
