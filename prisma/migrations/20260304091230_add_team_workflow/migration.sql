/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `ideas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StartupMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "ideas" ADD COLUMN     "shareToken" TEXT;

-- CreateTable
CREATE TABLE "startup_members" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "StartupMemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "startup_members_startupId_idx" ON "startup_members"("startupId");

-- CreateIndex
CREATE INDEX "startup_members_userId_idx" ON "startup_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "startup_members_startupId_userId_key" ON "startup_members"("startupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ideas_shareToken_key" ON "ideas"("shareToken");

-- AddForeignKey
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
