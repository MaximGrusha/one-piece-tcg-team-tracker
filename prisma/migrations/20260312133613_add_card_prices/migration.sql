-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "inventoryPrice" DOUBLE PRECISION,
ADD COLUMN     "marketPrice" DOUBLE PRECISION,
ADD COLUMN     "priceUpdatedAt" TIMESTAMP(3);
