import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 獲取所有啟用的手冊列表 (前台,不含密碼)
export async function GET(request: NextRequest) {
  try {
    const handbooks = await prisma.handbook.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        description: true,
        order: true,
        projectId: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ handbooks });
  } catch (error) {
    console.error('獲取手冊列表失敗:', error);
    return NextResponse.json(
      { error: '獲取手冊列表失敗' },
      { status: 500 }
    );
  }
}
