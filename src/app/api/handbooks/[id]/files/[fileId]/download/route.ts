import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 記錄文件下載次數
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { fileId } = await params;
    // 更新下載次數
    await prisma.handbookFile.update({
      where: { id: fileId },
      data: { downloadCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('記錄下載次數失敗:', error);
    return NextResponse.json(
      { success: false, error: '記錄下載次數失敗' },
      { status: 500 }
    );
  }
}
