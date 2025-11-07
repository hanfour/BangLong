import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 獲取單一手冊資訊 (前台,不含密碼)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const handbook = await prisma.handbook.findUnique({
      where: { id },
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

    if (!handbook) {
      return NextResponse.json(
        { error: '手冊不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ handbook });
  } catch (error) {
    console.error('獲取手冊失敗:', error);
    return NextResponse.json(
      { error: '獲取手冊失敗' },
      { status: 500 }
    );
  }
}
