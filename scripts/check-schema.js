#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('檢查 Document 表格結構...');
    
    // 檢查 imageUrl 欄位
    try {
      const imageUrlColumns = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Document' 
        AND column_name = 'imageUrl'
      `;
      console.log('imageUrl 欄位存在:', imageUrlColumns.length > 0);
      
      if (imageUrlColumns.length === 0) {
        console.log('嘗試添加 imageUrl 欄位...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Document" ADD COLUMN "imageUrl" TEXT`);
        console.log('✅ imageUrl 欄位已添加');
      }
    } catch (e) {
      console.error('檢查/添加 imageUrl 欄位時發生錯誤:', e.message);
    }
    
    // 檢查 Document 表格中所有欄位
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Document'
    `;
    
    console.log('Document 表格所有欄位:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}`);
    });
    
  } catch (e) {
    console.error('檢查過程中發生錯誤:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('執行檢查腳本失敗:', e);
  process.exit(1);
});