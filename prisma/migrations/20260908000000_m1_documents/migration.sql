CREATE TYPE "DocumentStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

CREATE TABLE "Subject" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "ownerId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subject_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Subject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Subject_owner_name_active_key" ON "Subject" ("ownerId", "name") WHERE "deletedAt" IS NULL;
CREATE INDEX "Subject_ownerId_deletedAt_idx" ON "Subject" ("ownerId", "deletedAt");

CREATE TABLE "Document" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(), "ownerId" UUID NOT NULL, "subjectId" UUID,
  "displayName" TEXT NOT NULL, "originalName" TEXT NOT NULL, "mimeType" TEXT NOT NULL,
  "extension" TEXT NOT NULL, "sizeBytes" INTEGER NOT NULL, "storageKey" TEXT NOT NULL,
  "checksum" TEXT NOT NULL, "pageCount" INTEGER, "status" "DocumentStatus" NOT NULL DEFAULT 'PROCESSING',
  "errorCode" TEXT, "errorMessage" TEXT, "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id"), CONSTRAINT "Document_storageKey_key" UNIQUE ("storageKey"),
  CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Document_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL
);
CREATE INDEX "Document_ownerId_deletedAt_createdAt_idx" ON "Document" ("ownerId", "deletedAt", "createdAt");
CREATE INDEX "Document_ownerId_checksum_idx" ON "Document" ("ownerId", "checksum");
CREATE INDEX "Document_subjectId_idx" ON "Document" ("subjectId");

CREATE TABLE "DocumentSection" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(), "documentId" UUID NOT NULL, "title" TEXT,
  "orderIndex" INTEGER NOT NULL, "pageStart" INTEGER, "pageEnd" INTEGER, "contentText" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentSection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DocumentSection_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "DocumentSection_documentId_orderIndex_key" ON "DocumentSection" ("documentId", "orderIndex");
CREATE INDEX "DocumentSection_documentId_pageStart_idx" ON "DocumentSection" ("documentId", "pageStart");

ALTER TABLE "AiJob" ADD COLUMN "documentId" UUID;
ALTER TABLE "AiJob" ADD CONSTRAINT "AiJob_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE;
CREATE INDEX "AiJob_documentId_createdAt_idx" ON "AiJob" ("documentId", "createdAt");
