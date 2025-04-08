import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// 獲取後台專案列表
export async function GET(request: NextRequest) {
  try {
    // 檢查管理員身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    const projects = await prisma.project.findMany({
      where,
      orderBy: {
        order: 'asc'
      },
      include: {
        documents: true
      }
    });
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('獲取後台專案列表失敗:', error);
    return NextResponse.json(
      { error: '獲取後台專案列表失敗' },
      { status: 500 }
    );
  }
}

// 創建新專案
export async function POST(request: NextRequest) {
  try {
    // 檢查管理員身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, imageUrl, details, isActive } = body;

    // 檢查必填字段
    if (!title || !category || !imageUrl) {
      return NextResponse.json(
        { error: '標題、類別和圖片為必填項' },
        { status: 400 }
      );
    }

    // 獲取當前最大的order值
    const maxOrderProject = await prisma.project.findFirst({
      where: { category },
      orderBy: {
        order: 'desc'
      },
      select: { order: true }
    });

    const newOrder = maxOrderProject ? maxOrderProject.order + 1 : 1;

    // 創建新專案
    const newProject = await prisma.project.create({
      data: {
        title,
        description: description || null,
        category,
        imageUrl,
        details: details || { items: [] },
        order: newOrder,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('創建專案失敗:', error);
    return NextResponse.json(
      { error: '創建專案失敗' },
      { status: 500 }
    );
  }
}
