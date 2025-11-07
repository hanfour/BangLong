-- CreateTable
CREATE TABLE "Handbook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Handbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandbookFile" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "order" INTEGER NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "handbookId" TEXT NOT NULL,

    CONSTRAINT "HandbookFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Handbook_projectId_idx" ON "Handbook"("projectId");

-- CreateIndex
CREATE INDEX "Handbook_order_idx" ON "Handbook"("order");

-- CreateIndex
CREATE INDEX "Handbook_isActive_idx" ON "Handbook"("isActive");

-- CreateIndex
CREATE INDEX "HandbookFile_handbookId_idx" ON "HandbookFile"("handbookId");

-- CreateIndex
CREATE INDEX "HandbookFile_order_idx" ON "HandbookFile"("order");

-- AddForeignKey
ALTER TABLE "Handbook" ADD CONSTRAINT "Handbook_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandbookFile" ADD CONSTRAINT "HandbookFile_handbookId_fkey" FOREIGN KEY ("handbookId") REFERENCES "Handbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
