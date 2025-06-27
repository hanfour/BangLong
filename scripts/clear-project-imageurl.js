#!/usr/bin/env node
/**
 * 將 Project.imageUrl 的資料設定為 NULL
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('開始清除專案 imageUrl...');

  try {
    const result = await prisma.project.updateMany({
      where: {
        imageUrl: {
          not: null,
        },
      },
      data: {
        imageUrl: null,
      },
    });

    console.log(`已將 ${result.count} 個專案的 imageUrl 設定為 NULL。`);
    console.log('專案 imageUrl 清除完成。');
  } catch (e) {
    console.error('清除過程中發生錯誤:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('執行清除腳本失敗:', e);
  process.exit(1);
});