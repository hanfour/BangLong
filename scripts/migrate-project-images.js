#!/usr/bin/env node
/**
 * 將 Project.imageUrl 的資料遷移到 ProjectImage 表格
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('開始專案圖片資料遷移...');

  try {
    const projects = await prisma.project.findMany({
      where: {
        imageUrl: {
          not: null,
        },
      },
    });

    if (projects.length === 0) {
      console.log('沒有需要遷移的專案圖片。');
      return;
    }

    console.log(`找到 ${projects.length} 個專案需要遷移圖片...`);

    for (const project of projects) {
      // 檢查是否已存在相同的圖片
      const existingImage = await prisma.projectImage.findFirst({
        where: {
          projectId: project.id,
          imageUrl: project.imageUrl,
        },
      });

      if (existingImage) {
        console.log(`專案 ${project.id} 的圖片 ${project.imageUrl} 已存在，跳過。`);
        continue;
      }

      await prisma.projectImage.create({
        data: {
          projectId: project.id,
          imageUrl: project.imageUrl,
          order: 1, // 預設順序為 1
        },
      });
      console.log(`已將專案 ${project.id} 的圖片 ${project.imageUrl} 遷移至 ProjectImage。`);
    }

    console.log('專案圖片資料遷移完成。');
  } catch (e) {
    console.error('資料遷移過程中發生錯誤:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('執行遷移腳本失敗:', e);
  process.exit(1);
});