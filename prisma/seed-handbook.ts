import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 開始建立交屋手冊測試數據...');

  // 獲取一個現有專案 (如果有的話)
  const project = await prisma.project.findFirst({
    where: { isActive: true },
  });

  // 建立測試手冊
  const handbook1 = await prisma.handbook.create({
    data: {
      title: '測試手冊A',
      coverImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
      password: await bcrypt.hash('123456', 10), // 密碼: 123456
      description: '這是第一本測試用交屋手冊',
      order: 0,
      isActive: true,
      projectId: project?.id || null,
    },
  });

  console.log('✅ 建立手冊:', handbook1.title);

  // 為手冊新增測試文件
  await prisma.handbookFile.createMany({
    data: [
      {
        handbookId: handbook1.id,
        title: '交屋流程說明.pdf',
        fileUrl: 'https://example.com/sample.pdf',
        fileType: 'pdf',
        fileSize: 1024000,
        order: 0,
      },
      {
        handbookId: handbook1.id,
        title: '設備使用手冊.docx',
        fileUrl: 'https://example.com/manual.docx',
        fileType: 'docx',
        fileSize: 512000,
        order: 1,
      },
    ],
  });

  console.log('✅ 新增 2 個測試文件');

  // 建立第二本手冊 (獨立手冊,無專案關聯)
  const handbook2 = await prisma.handbook.create({
    data: {
      title: '通用交屋指南',
      coverImageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
      password: await bcrypt.hash('888888', 10), // 密碼: 888888
      description: '適用於所有專案的通用指南',
      order: 1,
      isActive: true,
      projectId: null, // 獨立手冊
    },
  });

  console.log('✅ 建立獨立手冊:', handbook2.title);

  await prisma.handbookFile.create({
    data: {
      handbookId: handbook2.id,
      title: '保固說明.pdf',
      fileUrl: 'https://example.com/warranty.pdf',
      fileType: 'pdf',
      fileSize: 768000,
      order: 0,
    },
  });

  console.log('✅ 新增 1 個測試文件');
  console.log('\n🎉 測試數據建立完成!');
  console.log('\n📝 測試帳號:');
  console.log('  手冊1: 密碼 123456');
  console.log('  手冊2: 密碼 888888');
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
