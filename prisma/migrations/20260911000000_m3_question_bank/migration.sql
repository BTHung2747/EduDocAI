CREATE TYPE "QuestionSourceType" AS ENUM ('AI', 'IMPORT', 'MANUAL');
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'APPROVED');
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

CREATE TABLE "Question" (
  "id" UUID NOT NULL,
  "ownerId" UUID NOT NULL,
  "subjectId" UUID,
  "sourceType" "QuestionSourceType" NOT NULL,
  "status" "QuestionStatus" NOT NULL DEFAULT 'DRAFT',
  "text" TEXT NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "explanation" TEXT NOT NULL,
  "correctOptionKey" TEXT NOT NULL,
  "sourceDocumentId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionOption" (
  "id" UUID NOT NULL,
  "questionId" UUID NOT NULL,
  "key" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionCitation" (
  "id" UUID NOT NULL,
  "questionId" UUID NOT NULL,
  "documentId" UUID NOT NULL,
  "chunkId" UUID NOT NULL,
  "pageStart" INTEGER,
  "pageEnd" INTEGER,
  "quote" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionCitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuestionOption_questionId_key_key" ON "QuestionOption"("questionId", "key");
CREATE UNIQUE INDEX "QuestionOption_questionId_orderIndex_key" ON "QuestionOption"("questionId", "orderIndex");
CREATE INDEX "Question_ownerId_status_createdAt_idx" ON "Question"("ownerId", "status", "createdAt");
CREATE INDEX "Question_ownerId_subjectId_idx" ON "Question"("ownerId", "subjectId");
CREATE INDEX "Question_sourceDocumentId_idx" ON "Question"("sourceDocumentId");
CREATE INDEX "QuestionCitation_documentId_chunkId_idx" ON "QuestionCitation"("documentId", "chunkId");
CREATE INDEX "QuestionCitation_questionId_idx" ON "QuestionCitation"("questionId");

ALTER TABLE "Question" ADD CONSTRAINT "Question_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionCitation" ADD CONSTRAINT "QuestionCitation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionCitation" ADD CONSTRAINT "QuestionCitation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionCitation" ADD CONSTRAINT "QuestionCitation_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "DocumentChunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
