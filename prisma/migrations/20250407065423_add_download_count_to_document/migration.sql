-- Add downloadCount to Document model
ALTER TABLE "Document" ADD COLUMN "downloadCount" INTEGER NOT NULL DEFAULT 0;