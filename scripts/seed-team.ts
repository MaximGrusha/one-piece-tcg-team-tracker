import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const USERS = [
  { email: "maxim.h@crew.local", displayName: "Максим Г.", role: "ADMIN" as const, password: "Admin1234" },
  { email: "maxim.k@crew.local", displayName: "Максим", role: "MEMBER" as const, password: "Member1234" },
  { email: "victor@crew.local", displayName: "Віктор", role: "MEMBER" as const, password: "Member1234" },
  { email: "vlad@crew.local", displayName: "Влад", role: "MEMBER" as const, password: "Member1234" },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  try {
    for (const u of USERS) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (existing) {
        console.log(`⏭  ${u.email} вже існує (${existing.role})`);
        continue;
      }

      const passwordHash = await bcrypt.hash(u.password, 12);
      const created = await prisma.user.create({
        data: {
          email: u.email,
          passwordHash,
          displayName: u.displayName,
          role: u.role,
        },
      });

      console.log(`✓ ${created.role === "ADMIN" ? "Admin" : "Member"}: ${created.displayName} — ${u.email} / ${u.password}`);
    }

    console.log("\nГотово! Всі акаунти створено.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
