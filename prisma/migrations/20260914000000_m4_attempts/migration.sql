CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED');

CREATE TABLE "Attempt" (
  "id" UUID NOT NULL,
  "testId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "score" INTEGER,
  "totalPoints" INTEGER,
  "correctCount" INTEGER,
  "incorrectCount" INTEGER,
  "unansweredCount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttemptAnswer" (
  "id" UUID NOT NULL,
  "attemptId" UUID NOT NULL,
  "testQuestionId" UUID NOT NULL,
  "selectedOptionKey" TEXT,
  "markedForReview" BOOLEAN NOT NULL DEFAULT false,
  "isCorrect" BOOLEAN,
  "answeredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Attempt_userId_createdAt_idx" ON "Attempt"("userId", "createdAt");
CREATE INDEX "Attempt_testId_status_idx" ON "Attempt"("testId", "status");
CREATE UNIQUE INDEX "AttemptAnswer_attemptId_testQuestionId_key" ON "AttemptAnswer"("attemptId", "testQuestionId");
CREATE INDEX "AttemptAnswer_testQuestionId_idx" ON "AttemptAnswer"("testQuestionId");
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_testQuestionId_fkey" FOREIGN KEY ("testQuestionId") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
