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
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = Number(searchParams.get('limit')) || 100;
    const offset = Number(searchParams.get('offset')) || 0;

    // 構建查詢條件
    let where: any = {};
    
    // 狀態過濾
    if (status) {
      where.status = status;
    }
    
    // 搜尋功能
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // 日期範圍過濾
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        // 增加一天確保包含整個結束日期
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    // 查詢資料
    const contactSubmissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // 獲取總數
    const total = await prisma.contactSubmission.count({ where });
    
    // 獲取每個狀態的數量統計
    const statusStats = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM "ContactSubmission" 
      GROUP BY status
    `;

    return NextResponse.json({
      data: contactSubmissions,
      total,
      limit,
      offset,
      statusStats,
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