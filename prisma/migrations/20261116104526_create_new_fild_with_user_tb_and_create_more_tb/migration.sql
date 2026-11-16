/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('owner', 'branch_manager', 'stock_clerk');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branch_id" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Roles" NOT NULL;

-- CreateTable
CREATE TABLE "Branches" (
    "id" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branches_id_key" ON "Branches"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Branches_branch_name_key" ON "Branches"("branch_name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_id_key" ON "Organization"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_user_id_key" ON "Organization"("user_id");

-- AddForeignKey
ALTER TABLE "Branches" ADD CONSTRAINT "Branches_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
