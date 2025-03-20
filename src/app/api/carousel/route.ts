import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Carousel } from '@/types/global';

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
    const data = await request.json();
    
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
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        linkText: data.linkText,
        order: newOrder,
        isActive: true,
        textPosition: data.textPosition || 'center',
        textDirection: data.textDirection || 'horizontal'
      }
    });
    
    return NextResponse.json({ carousel: newCarousel });
  } catch (error) {
    console.error('Error creating carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to create carousel item' },
      { status: 500 }
    );
  }
}

// 以下接口需要在管理面板中实现
// PUT: 更新轮播项
// DELETE: 删除轮播项
