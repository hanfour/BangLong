import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Carousel } from '@/types/global';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: 获取所有活跃的轮播项
export async function GET() {
  try {
    const carouselItems = await prisma.carousel.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({ carouselItems });
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel items' },
      { status: 500 }
    );
  }
}

// POST: 创建新轮播项 (需要管理员权限)
export async function POST(request: Request) {
  try {
    // 檢查是否為已驗證用戶
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '未授權的請求' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // 檢查必要字段 - imageUrl 是必須的
    if (!data.imageUrl) {
      return NextResponse.json(
        { error: '輪播圖片網址 (imageUrl) 為必填項目' },
        { status: 400 }
      );
    }
    
    // 确定新项目的顺序 
    const lastItem = await prisma.carousel.findFirst({
      orderBy: {
        order: 'desc'
      }
    });
    
    const newOrder = lastItem ? lastItem.order + 1 : 1;
    
    // 创建新轮播项
    const newCarousel = await prisma.carousel.create({
      data: {
        title: data.title || '',
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        linkText: data.linkText || null,
        order: newOrder,
        isActive: true,
        textPosition: data.textPosition || 'center',
        textDirection: data.textDirection || 'horizontal'
      }
    });
    
    console.log('成功創建輪播項目:', newCarousel);
    return NextResponse.json({ carousel: newCarousel });
  } catch (error) {
    console.error('Error creating carousel item:', error);
    
    // 提供更詳細的錯誤信息
    const errorMessage = error instanceof Error 
      ? `創建輪播項目失敗: ${error.message}` 
      : '創建輪播項目失敗，請稍後再試';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// 以下接口需要在管理面板中实现
// PUT: 更新轮播项
// DELETE: 删除轮播项
