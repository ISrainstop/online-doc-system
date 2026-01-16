/*
  Warnings:

  - The `content` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `versionNumber` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - Changed the type of `permission` on the `DocumentCollaborator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `content` on the `DocumentVersion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `passwordHash` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DocumentCollaborator" DROP CONSTRAINT "DocumentCollaborator_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentCollaborator" DROP CONSTRAINT "DocumentCollaborator_userId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentVersion" DROP CONSTRAINT "DocumentVersion_documentId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "content",
ADD COLUMN     "content" JSONB;

-- AlterTable
ALTER TABLE "DocumentCollaborator" DROP COLUMN "permission",
ADD COLUMN     "permission" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DocumentVersion" DROP COLUMN "versionNumber",
ADD COLUMN     "versionName" TEXT,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER',
ALTER COLUMN "passwordHash" SET NOT NULL;

-- DropEnum
DROP TYPE "Role";

-- AddForeignKey
ALTER TABLE "DocumentCollaborator" ADD CONSTRAINT "DocumentCollaborator_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentCollaborator" ADD CONSTRAINT "DocumentCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
