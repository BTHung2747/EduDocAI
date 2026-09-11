CREATE TYPE "QuestionImportStatus" AS ENUM ('PREVIEW', 'COMMITTED');

ALTER TABLE "Question" ADD COLUMN "deletedAt" TIMESTAMP(3);
DROP INDEX "Question_ownerId_status_createdAt_idx";
CREATE INDEX "Question_ownerId_deletedAt_status_createdAt_idx" ON "Question"("ownerId", "deletedAt", "status", "createdAt");

CREATE TABLE "QuestionImport" (
  "id" UUID NOT NULL,
  "ownerId" UUID NOT NULL,
  "subjectId" UUID,
  "fileName" TEXT NOT NULL,
  "status" "QuestionImportStatus" NOT NULL DEFAULT 'PREVIEW',
  "totalCount" INTEGER NOT NULL DEFAULT 0,
  "validCount" INTEGER NOT NULL DEFAULT 0,
  "invalidCount" INTEGER NOT NULL DEFAULT 0,
  "errorsJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionImport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionImportItem" (
  "id" UUID NOT NULL,
  "importId" UUID NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "text" TEXT,
  "optionsJson" JSONB,
  "correctOptionKey" TEXT,
  "explanation" TEXT,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
  "isValid" BOOLEAN NOT NULL DEFAULT false,
  "errorsJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionImportItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuestionImport_ownerId_status_createdAt_idx" ON "QuestionImport"("ownerId", "status", "createdAt");
CREATE UNIQUE INDEX "QuestionImportItem_importId_orderIndex_key" ON "QuestionImportItem"("importId", "orderIndex");
CREATE INDEX "QuestionImportItem_importId_isValid_idx" ON "QuestionImportItem"("importId", "isValid");

ALTER TABLE "QuestionImport" ADD CONSTRAINT "QuestionImport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionImport" ADD CONSTRAINT "QuestionImport_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuestionImportItem" ADD CONSTRAINT "QuestionImportItem_importId_fkey" FOREIGN KEY ("importId") REFERENCES "QuestionImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
