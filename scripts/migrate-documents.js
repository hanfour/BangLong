#!/usr/bin/env node
/**
 * 執行 Document 表格遷移
 * 用於手動檢查和修復數據庫結構
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('開始檢查 Document 表格結構...');
  
  try {
    // 檢查表是否存在
    try {
      await prisma.$executeRawUnsafe(`SELECT * FROM "Document" LIMIT 1`);
      console.log('✅ Document 表格存在');
    } catch (e) {
      console.error('❌ Document 表格不存在:', e.message);
      console.log('嘗試創建表...');
      
      // 嘗試執行遷移
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Document" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "fileUrl" TEXT NOT NULL,
            "imageUrl" TEXT,
            "fileType" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            "order" INTEGER NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "projectId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
          );
        `);
        console.log('✅ Document 表格已創建');
      } catch (createErr) {
        console.error('❌ 無法創建 Document 表格:', createErr.message);
        return;
      }
    }
    
    // 檢查欄位
    console.log('檢查 Document 表格欄位...');
    
    // 檢查 imageUrl 欄位
    try {
      await prisma.$executeRawUnsafe(`SELECT "imageUrl" FROM "Document" LIMIT 1`);
      console.log('✅ imageUrl 欄位存在');
    } catch (e) {
      console.error('❌ imageUrl 欄位不存在:', e.message);
      console.log('嘗試添加 imageUrl 欄位...');
      
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`);
        console.log('✅ imageUrl 欄位已添加');
      } catch (alterErr) {
        console.error('❌ 無法添加 imageUrl 欄位:', alterErr.message);
      }
    }
    
    // 檢查 projectId 欄位
    try {
      await prisma.$executeRawUnsafe(`SELECT "projectId" FROM "Document" LIMIT 1`);
      console.log('✅ projectId 欄位存在');
      
      // 檢查外鍵約束
      const constraints = await prisma.$queryRaw`
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public."Document"'::regclass AND contype = 'f';
      `;
      
      if (constraints.length > 0) {
        console.log(`✅ Document 表格有 ${constraints.length} 個外鍵約束`);
      } else {
        console.log('⚠️ Document 表格沒有外鍵約束，嘗試添加...');
        
        try {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" 
            FOREIGN KEY ("projectId") REFERENCES "Project"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE;
          `);
          console.log('✅ 外鍵約束已添加');
        } catch (fkErr) {
          console.error('❌ 無法添加外鍵約束:', fkErr.message);
        }
      }
    } catch (e) {
      console.error('❌ projectId 欄位不存在:', e.message);
      console.log('嘗試添加 projectId 欄位及外鍵約束...');
      
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "projectId" TEXT`);
        console.log('✅ projectId 欄位已添加');
        
        try {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" 
            FOREIGN KEY ("projectId") REFERENCES "Project"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE;
          `);
          console.log('✅ 外鍵約束已添加');
        } catch (fkErr) {
          console.error('❌ 無法添加外鍵約束:', fkErr.message);
        }
      } catch (alterErr) {
        console.error('❌ 無法添加 projectId 欄位:', alterErr.message);
      }
    }
    
    console.log('Document 表格檢查完成');
  } catch (e) {
    console.error('檢查過程中發生錯誤:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('執行遷移腳本失敗:', e);
  process.exit(1);
});
