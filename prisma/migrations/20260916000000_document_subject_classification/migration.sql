CREATE TYPE "SubjectAssignmentSource" AS ENUM ('MANUAL', 'AI');

ALTER TABLE "Document"
  ADD COLUMN "subjectAssignmentSource" "SubjectAssignmentSource",
  ADD COLUMN "subjectConfidence" DOUBLE PRECISION,
  ADD COLUMN "subjectAssignedAt" TIMESTAMP(3);
