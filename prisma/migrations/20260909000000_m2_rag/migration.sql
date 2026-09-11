CREATE TABLE "DocumentChunk" (
 "id" UUID NOT NULL DEFAULT uuid_generate_v4(), "documentId" UUID NOT NULL, "sectionId" UUID,
 "chunkIndex" INTEGER NOT NULL, "contentText" TEXT NOT NULL, "pageStart" INTEGER, "pageEnd" INTEGER,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
 CONSTRAINT "DocumentChunk_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "DocumentSection"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX "DocumentChunk_documentId_chunkIndex_key" ON "DocumentChunk"("documentId", "chunkIndex");
CREATE INDEX "DocumentChunk_documentId_sectionId_idx" ON "DocumentChunk"("documentId", "sectionId");
ALTER TABLE "DocumentChunk" ADD COLUMN embedding DOUBLE PRECISION[] NOT NULL;
