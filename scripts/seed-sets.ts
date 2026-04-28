import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const SETS = [
  // Booster Packs
  { code: "OP01", name: "Romance Dawn",                    type: "BOOSTER" as const, releaseDate: "2022-12-02", cardCount: 121 },
  { code: "OP02", name: "Paramount War",                   type: "BOOSTER" as const, releaseDate: "2023-03-10", cardCount: 154 },
  { code: "OP03", name: "Pillars of Strength",             type: "BOOSTER" as const, releaseDate: "2023-06-30", cardCount: 154 },
  { code: "OP04", name: "Kingdoms of Intrigue",            type: "BOOSTER" as const, releaseDate: "2023-09-22", cardCount: 149 },
  { code: "OP05", name: "Awakening of the New Era",        type: "BOOSTER" as const, releaseDate: "2023-12-08", cardCount: 154 },
  { code: "OP06", name: "Wings of the Captain",            type: "BOOSTER" as const, releaseDate: "2024-03-15", cardCount: 151 },
  { code: "OP07", name: "500 Years in the Future",         type: "BOOSTER" as const, releaseDate: "2024-06-28", cardCount: 151 },
  { code: "OP08", name: "Two Legends",                     type: "BOOSTER" as const, releaseDate: "2024-09-13", cardCount: 151 },
  { code: "OP09", name: "Emperors in the New World",       type: "BOOSTER" as const, releaseDate: "2024-12-13", cardCount: 159 },
  { code: "OP10", name: "Royal Blood",                     type: "BOOSTER" as const, releaseDate: "2025-03-21", cardCount: 151 },
  { code: "OP11", name: "A Fist of Divine Speed",          type: "BOOSTER" as const, releaseDate: "2025-06-06", cardCount: 156 },
  { code: "OP12", name: "Legacy of the Master",            type: "BOOSTER" as const, releaseDate: "2025-08-22", cardCount: 155 },
  { code: "OP13", name: "Carrying on His Will",            type: "BOOSTER" as const, releaseDate: "2025-11-07", cardCount: 175 },
  { code: "OP14", name: "The Azure Sea's Seven",           type: "BOOSTER" as const, releaseDate: "2026-01-16", cardCount: 199 },
  { code: "OP15", name: "Adventure on Kami's Island",      type: "BOOSTER" as const, releaseDate: "2026-04-03", cardCount: 195 },
  // Extra Boosters
  { code: "EB01", name: "Memorial Collection",             type: "BOOSTER" as const, releaseDate: "2024-05-03", cardCount: 80 },
  { code: "EB02", name: "Anime 25th Collection",           type: "BOOSTER" as const, releaseDate: "2025-05-09", cardCount: 105 },
  { code: "EB03", name: "One Piece Heroines Edition",      type: "BOOSTER" as const, releaseDate: "2026-02-20", cardCount: 90 },
  // Premium Boosters
  { code: "PRB01", name: "One Piece Card The Best",        type: "PROMO" as const,   releaseDate: "2024-11-08", cardCount: 319 },
  { code: "PRB02", name: "One Piece Card The Best Vol.2",  type: "PROMO" as const,   releaseDate: "2025-10-03", cardCount: 316 },
  // Starter Decks
  { code: "ST01", name: "Straw Hat Crew",                  type: "STARTER_DECK" as const, releaseDate: "2022-12-02" },
  { code: "ST02", name: "Worst Generation",                type: "STARTER_DECK" as const, releaseDate: "2022-12-02" },
  { code: "ST03", name: "The Seven Warlords of the Sea",   type: "STARTER_DECK" as const, releaseDate: "2022-12-02" },
  { code: "ST04", name: "Animal Kingdom Pirates",          type: "STARTER_DECK" as const, releaseDate: "2023-03-10" },
  { code: "ST05", name: "Film Edition",                    type: "STARTER_DECK" as const, releaseDate: "2023-03-10" },
  { code: "ST06", name: "Absolute Justice",                type: "STARTER_DECK" as const, releaseDate: "2023-06-30" },
  { code: "ST07", name: "Big Mom Pirates",                 type: "STARTER_DECK" as const, releaseDate: "2023-09-22" },
  { code: "ST08", name: "Monkey D. Luffy",                 type: "STARTER_DECK" as const, releaseDate: "2023-12-08" },
  { code: "ST09", name: "Yamato",                          type: "STARTER_DECK" as const, releaseDate: "2023-12-08" },
  { code: "ST10", name: "Royal Pirates",                   type: "STARTER_DECK" as const, releaseDate: "2024-03-15" },
  { code: "ST11", name: "Uta",                             type: "STARTER_DECK" as const, releaseDate: "2024-03-15" },
  { code: "ST12", name: "Zoro and Sanji",                  type: "STARTER_DECK" as const, releaseDate: "2024-06-28" },
  { code: "ST13", name: "The Three Brothers",              type: "STARTER_DECK" as const, releaseDate: "2024-09-13" },
  { code: "ST14", name: "3D2Y",                            type: "STARTER_DECK" as const, releaseDate: "2024-09-13" },
  { code: "ST15", name: "RED Edward Newgate",              type: "STARTER_DECK" as const, releaseDate: "2024-12-13" },
  { code: "ST16", name: "BLUE Monkey D. Luffy",            type: "STARTER_DECK" as const, releaseDate: "2024-12-13" },
  { code: "ST17", name: "GREEN Roronoa Zoro",              type: "STARTER_DECK" as const, releaseDate: "2024-12-13" },
  { code: "ST18", name: "PURPLE Boa Hancock",              type: "STARTER_DECK" as const, releaseDate: "2024-12-13" },
  { code: "ST19", name: "BLACK Smoker",                    type: "STARTER_DECK" as const, releaseDate: "2025-03-21" },
  { code: "ST20", name: "YELLOW Charlotte Katakuri",       type: "STARTER_DECK" as const, releaseDate: "2025-03-21" },
  { code: "ST21", name: "MULTICOLOR Sakazuki",             type: "STARTER_DECK" as const, releaseDate: "2025-06-06" },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  let created = 0, skipped = 0;

  try {
    for (const s of SETS) {
      const existing = await prisma.cardSet.findUnique({ where: { code: s.code } });
      if (existing) { skipped++; continue; }
      await prisma.cardSet.create({
        data: {
          code: s.code,
          name: s.name,
          type: s.type,
          releaseDate: s.releaseDate ? new Date(s.releaseDate) : null,
          cardCount: s.cardCount ?? 0,
        },
      });
      console.log(`✓ ${s.code} — ${s.name}`);
      created++;
    }
    console.log(`\n✅ Готово: ${created} сетів додано, ${skipped} вже існували`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
