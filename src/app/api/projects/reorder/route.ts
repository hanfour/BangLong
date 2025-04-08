import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// 重新排序專案
export async function POST(request: NextRequest) {
  try {
    // 檢查管理員身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { items, category } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '無效的排序資料' },
        { status: 400 }
      );
    }

    // 開始事務
    const updates = await prisma.$transaction(
      items.map((item, index) => {
        return prisma.project.update({
          where: { id: item.id },
          data: { order: index + 1 }
        });
      })
    );

    // 取得更新後的專案列表
    const updatedProjects = await prisma.project.findMany({
      where: { category },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ success: true, projects: updatedProjects });
  } catch (error) {
    console.error('重新排序專案失敗:', error);
    return NextResponse.json(
      { error: '重新排序專案失敗' },
      { status: 500 }
    );
  }
}
