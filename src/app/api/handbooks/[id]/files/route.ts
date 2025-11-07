import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 獲取手冊的文件列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 驗證手冊是否存在
    const handbook = await prisma.handbook.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!handbook) {
      return NextResponse.json(
        { error: '手冊不存在' },
        { status: 404 }
      );
    }

    // 獲取文件列表
    const files = await prisma.handbookFile.findMany({
      where: { handbookId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('獲取文件列表失敗:', error);
    return NextResponse.json(
      { error: '獲取文件列表失敗' },
      { status: 500 }
    );
  }
}
