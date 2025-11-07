import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// 批次更新手冊排序
export async function POST(request: NextRequest) {
  try {
    // 驗證認證
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { handbooks } = await request.json();

    if (!Array.isArray(handbooks)) {
      return NextResponse.json(
        { error: '無效的資料格式' },
        { status: 400 }
      );
    }

    // 批次更新
    await Promise.all(
      handbooks.map((handbook) =>
        prisma.handbook.update({
          where: { id: handbook.id },
          data: { order: handbook.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新排序失敗:', error);
    return NextResponse.json(
      { error: '更新排序失敗' },
      { status: 500 }
    );
  }
}
