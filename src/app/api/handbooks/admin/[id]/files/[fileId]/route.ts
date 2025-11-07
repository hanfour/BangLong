import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// 更新文件資訊
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { fileId } = await params;
    // 驗證認證
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const data = await request.json();
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;

    const file = await prisma.handbookFile.update({
      where: { id: fileId },
      data: updateData,
    });

    return NextResponse.json({ file });
  } catch (error) {
    console.error('更新文件失敗:', error);
    return NextResponse.json(
      { error: '更新文件失敗' },
      { status: 500 }
    );
  }
}

// 刪除文件
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { fileId } = await params;
    // 驗證認證
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    await prisma.handbookFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除文件失敗:', error);
    return NextResponse.json(
      { error: '刪除文件失敗' },
      { status: 500 }
    );
  }
}
