CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

CREATE TABLE "Test" (
  "id" UUID NOT NULL,
  "ownerId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "durationMinutes" INTEGER,
  "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
  "shuffleOptions" BOOLEAN NOT NULL DEFAULT false,
  "showAnswers" BOOLEAN NOT NULL DEFAULT false,
  "status" "TestStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TestQuestion" (
  "id" UUID NOT NULL,
  "testId" UUID NOT NULL,
  "questionId" UUID NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 1,
  "snapshotJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Test_ownerId_deletedAt_status_createdAt_idx" ON "Test"("ownerId", "deletedAt", "status", "createdAt");
CREATE UNIQUE INDEX "TestQuestion_testId_questionId_key" ON "TestQuestion"("testId", "questionId");
CREATE UNIQUE INDEX "TestQuestion_testId_orderIndex_key" ON "TestQuestion"("testId", "orderIndex");
CREATE INDEX "TestQuestion_questionId_idx" ON "TestQuestion"("questionId");
ALTER TABLE "Test" ADD CONSTRAINT "Test_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
