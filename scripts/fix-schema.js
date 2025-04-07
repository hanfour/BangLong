#!/usr/bin/env node
/**
 * 修復 Document 表格結構，自動添加缺少的欄位
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDocumentTable() {
  console.log('嘗試創建 Document 表格...');
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
    console.log('Document 表格創建成功');
    return true;
  } catch (e) {
    console.error('創建 Document 表格時出錯:', e.message);
    if (e.message.includes('already exists')) {
      console.log('表格已存在，繼續檢查欄位');
      return true;
    }
    return false;
  }
}

async function addImageUrlColumn() {
  try {
    // 檢查 imageUrl 欄位是否存在
    const columns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Document' AND column_name = 'imageUrl'
    `;
    
    if (columns.length === 0) {
      console.log('嘗試添加 imageUrl 欄位...');
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "Document" ADD COLUMN "imageUrl" TEXT;
        `);
        console.log('imageUrl 欄位添加成功');
      } catch (e) {
        console.error('添加 imageUrl 欄位時出錯:', e.message);
        if (e.message.includes('already exists')) {
          console.log('imageUrl 欄位已存在');
        }
      }
    } else {
      console.log('imageUrl 欄位已存在');
    }
  } catch (e) {
    console.error('檢查 imageUrl 欄位時出錯:', e.message);
  }
}

async function addProjectIdColumn() {
  try {
    // 檢查 projectId 欄位是否存在
    const columns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Document' AND column_name = 'projectId'
    `;
    
    if (columns.length === 0) {
      console.log('嘗試添加 projectId 欄位...');
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "Document" ADD COLUMN "projectId" TEXT;
        `);
        console.log('projectId 欄位添加成功');
      } catch (e) {
        console.error('添加 projectId 欄位時出錯:', e.message);
        if (e.message.includes('already exists')) {
          console.log('projectId 欄位已存在');
        }
      }
    } else {
      console.log('projectId 欄位已存在');
    }
  } catch (e) {
    console.error('檢查 projectId 欄位時出錯:', e.message);
  }
}

async function addForeignKeyConstraint() {
  try {
    // 檢查外鍵是否存在
    const constraints = await prisma.$queryRaw`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public."Document"'::regclass AND contype = 'f'
    `;
    
    if (constraints.length === 0) {
      console.log('嘗試添加外鍵約束...');
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "Document" 
          ADD CONSTRAINT "Document_projectId_fkey" 
          FOREIGN KEY ("projectId") 
          REFERENCES "Project"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        `);
        console.log('外鍵約束添加成功');
      } catch (e) {
        console.error('添加外鍵約束時出錯:', e.message);
        if (e.message.includes('already exists')) {
          console.log('外鍵約束已存在');
        }
      }
    } else {
      console.log('外鍵約束已存在:', constraints.map(c => c.conname).join(', '));
    }
  } catch (e) {
    console.error('檢查外鍵約束時出錯:', e.message);
  }
}

async function main() {
  console.log('開始修復 Document 表格結構...');
  
  try {
    // 檢查 Document 表格是否存在，如果不存在則創建
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Document'
      )
    `;
    
    if (!tableExists[0].exists) {
      const created = await createDocumentTable();
      if (!created) return;
    } else {
      console.log('Document 表格已存在');
    }
    
    // 添加 imageUrl 欄位
    await addImageUrlColumn();
    
    // 添加 projectId 欄位
    await addProjectIdColumn();
    
    // 添加外鍵約束
    await addForeignKeyConstraint();
    
    console.log('Document 表格結構修復完成');
    
    // 列出所有欄位
    const allColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Document'
      ORDER BY column_name
    `;
    
    console.log('Document 表格當前欄位:');
    allColumns.forEach(column => {
      console.log(`- ${column.column_name}`);
    });
    
  } catch (e) {
    console.error('修復過程中發生錯誤:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('執行修復腳本失敗:', e);
  process.exit(1);
});