-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_branchId_fkey";

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
