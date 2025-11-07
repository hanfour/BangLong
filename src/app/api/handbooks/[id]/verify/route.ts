import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

// 驗證手冊密碼
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await request.json();

    // 驗證密碼欄位
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: '密碼格式錯誤' },
        { status: 400 }
      );
    }

    // 獲取手冊 (只取密碼欄位)
    const handbook = await prisma.handbook.findUnique({
      where: { id },
      select: { password: true },
    });

    // 檢查手冊是否存在
    if (!handbook) {
      return NextResponse.json(
        { success: false, message: '手冊不存在' },
        { status: 404 }
      );
    }

    // 使用 bcrypt 驗證密碼
    const isValid = await bcrypt.compare(password, handbook.password);

    return NextResponse.json({ success: isValid });
  } catch (error) {
    console.error('密碼驗證失敗:', error);
    return NextResponse.json(
      { success: false, message: '驗證失敗,請稍後再試' },
      { status: 500 }
    );
  }
}
