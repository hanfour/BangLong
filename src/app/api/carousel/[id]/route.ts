import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET: 获取单个轮播项
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const carouselItem = await prisma.carousel.findUnique({
      where: {
        id: params.id
      }
    });

    if (!carouselItem) {
      return NextResponse.json(
        { error: '輪播項目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ carouselItem });
  } catch (error) {
    console.error('Error fetching carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel item' },
      { status: 500 }
    );
  }
}

// PATCH: 更新轮播项 (需要管理员权限)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员身份
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '未授權的請求' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // 更新轮播项
    const updatedCarousel = await prisma.carousel.update({
      where: {
        id: params.id
      },
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        linkText: data.linkText,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        textPosition: data.textPosition,
        textDirection: data.textDirection
      }
    });
    
    return NextResponse.json({ carousel: updatedCarousel });
  } catch (error) {
    console.error('Error updating carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to update carousel item' },
      { status: 500 }
    );
  }
}

// DELETE: 删除轮播项 (需要管理员权限)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员身份
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '未授權的請求' },
        { status: 401 }
      );
    }
    
    // 删除轮播项
    await prisma.carousel.delete({
      where: {
        id: params.id
      }
    });
    
    return NextResponse.json(
      { message: '輪播項目已成功刪除' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to delete carousel item' },
      { status: 500 }
    );
  }
}