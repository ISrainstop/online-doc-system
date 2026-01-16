-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_createdById_fkey";

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
