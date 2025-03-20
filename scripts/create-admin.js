const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Bang1ong@2025', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: '管理員',
      email: 'hanfourhuang@gmail.com',
      password: hashedPassword,
      role: 'admin'
    }
  });
  
  console.log('管理員帳戶已創建:', admin);
}

main()
  .catch(e => {
    console.error('創建管理員時出錯:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });