// 測試腳本：設置測試用的進階設定
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('開始設置測試用的進階設定...');
  
  // 設置 Google Analytics 測量 ID
  await prisma.siteSettings.upsert({
    where: {
      type_key: {
        type: 'advanced',
        key: 'googleAnalytics'
      }
    },
    update: {
      value: 'G-TESTCODE123',
      description: 'Google Analytics 4 ID'
    },
    create: {
      type: 'advanced',
      key: 'googleAnalytics',
      value: 'G-TESTCODE123',
      description: 'Google Analytics 4 ID'
    }
  });
  
  // 設置頭部腳本
  await prisma.siteSettings.upsert({
    where: {
      type_key: {
        type: 'advanced',
        key: 'headScripts'
      }
    },
    update: {
      value: '<script>console.log("測試頭部腳本");</script>',
      description: '頭部腳本'
    },
    create: {
      type: 'advanced',
      key: 'headScripts',
      value: '<script>console.log("測試頭部腳本");</script>',
      description: '頭部腳本'
    }
  });
  
  // 設置內容開始處腳本
  await prisma.siteSettings.upsert({
    where: {
      type_key: {
        type: 'advanced',
        key: 'bodyStartScripts'
      }
    },
    update: {
      value: '<script>console.log("測試內容開始處腳本");</script>',
      description: '內容開始處腳本'
    },
    create: {
      type: 'advanced',
      key: 'bodyStartScripts',
      value: '<script>console.log("測試內容開始處腳本");</script>',
      description: '內容開始處腳本'
    }
  });
  
  // 設置內容結束處腳本
  await prisma.siteSettings.upsert({
    where: {
      type_key: {
        type: 'advanced',
        key: 'bodyEndScripts'
      }
    },
    update: {
      value: '<script>console.log("測試內容結束處腳本");</script>',
      description: '內容結束處腳本'
    },
    create: {
      type: 'advanced',
      key: 'bodyEndScripts',
      value: '<script>console.log("測試內容結束處腳本");</script>',
      description: '內容結束處腳本'
    }
  });
  
  console.log('測試設定已成功設置！');
}

main()
  .catch(e => {
    console.error('設定過程中發生錯誤:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });