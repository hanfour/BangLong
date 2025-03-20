import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 獲取所有聯絡表單提交
export async function GET(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const limit = Number(searchParams.get('limit')) || 100;
    const offset = Number(searchParams.get('offset')) || 0;

    // 構建查詢條件
    const where = status ? { status } : {};

    // 查詢資料
    const contactSubmissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // 獲取總數
    const total = await prisma.contactSubmission.count({ where });

    return NextResponse.json({
      data: contactSubmissions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('獲取聯絡表單列表失敗:', error);
    return NextResponse.json(
      { error: '獲取聯絡表單列表失敗' },
      { status: 500 }
    );
  }
}

// 更新聯絡表單提交狀態
export async function PATCH(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, status, reply } = body;
    
    if (!id) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }
    
    // 更新資料
    const updatedContactSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(reply !== undefined && { reply }),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      data: updatedContactSubmission,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新聯絡表單狀態失敗:', error);
    return NextResponse.json(
      { error: '更新聯絡表單狀態失敗' },
      { status: 500 }
    );
  }
}