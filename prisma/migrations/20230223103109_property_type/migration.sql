-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RENT', 'SALE');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "type" "PropertyType" NOT NULL DEFAULT 'RENT';
