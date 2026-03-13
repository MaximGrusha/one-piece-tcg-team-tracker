-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('BOOSTER', 'STARTER_DECK', 'PROMO');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "attribute" TEXT,
ADD COLUMN     "cardText" TEXT,
ADD COLUMN     "cardType" TEXT,
ADD COLUMN     "cost" INTEGER,
ADD COLUMN     "counter" INTEGER,
ADD COLUMN     "power" INTEGER,
ADD COLUMN     "setId" TEXT;

-- CreateTable
CREATE TABLE "CardSet" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SetType" NOT NULL DEFAULT 'BOOSTER',
    "releaseDate" TIMESTAMP(3),
    "imageUrl" TEXT,
    "cardCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CardSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardSet_code_key" ON "CardSet"("code");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "CardSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
