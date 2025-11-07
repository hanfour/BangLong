import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// 批次更新文件排序
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證認證
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { files } = await request.json();

    if (!Array.isArray(files)) {
      return NextResponse.json(
        { error: '無效的資料格式' },
        { status: 400 }
      );
    }

    // 批次更新
    await Promise.all(
      files.map((file) =>
        prisma.handbookFile.update({
          where: { id: file.id },
          data: { order: file.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新文件排序失敗:', error);
    return NextResponse.json(
      { error: '更新文件排序失敗' },
      { status: 500 }
    );
  }
}
