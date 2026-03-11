-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'SUPER_RARE', 'SECRET_RARE', 'LEADER');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('RED', 'BLUE', 'GREEN', 'PURPLE', 'BLACK', 'YELLOW', 'MULTICOLOR');

-- CreateEnum
CREATE TYPE "BorrowStatus" AS ENUM ('ACTIVE', 'RETURNED');

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "setCode" TEXT NOT NULL,
    "imageUrl" TEXT,
    "rarity" "Rarity" NOT NULL,
    "color" "Color" NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "availableQuantity" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "status" "BorrowStatus" NOT NULL DEFAULT 'ACTIVE',
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "Borrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowItem" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "borrowId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "BorrowItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_setCode_key" ON "Card"("setCode");

-- AddForeignKey
ALTER TABLE "BorrowItem" ADD CONSTRAINT "BorrowItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowItem" ADD CONSTRAINT "BorrowItem_borrowId_fkey" FOREIGN KEY ("borrowId") REFERENCES "Borrow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
