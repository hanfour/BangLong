import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 獲取專案列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    
    const where: any = {
      isActive: true
    };
    
    if (category) {
      where.category = category;
    }
    
    const projects = await prisma.project.findMany({
      where,
      orderBy: {
        order: 'asc'
      }
    });
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('獲取專案列表失敗:', error);
    return NextResponse.json(
      { error: '獲取專案列表失敗' },
      { status: 500 }
    );
  }
}