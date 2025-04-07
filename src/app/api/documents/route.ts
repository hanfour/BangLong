import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 獲取文檔列表，可依據類別篩選
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    
    const where: any = {
      isActive: true
    };
    
    if (category) {
      where.category = category;
    }

    if (projectId) {
      where.projectId = projectId;
    }
    
    const documents = await prisma.document.findMany({
      where,
      orderBy: {
        order: 'asc'
      },
      include: {
        project: {
          select: {
            title: true,
            imageUrl: true
          }
        }
      }
    });
    
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('獲取文檔失敗:', error);
    return NextResponse.json(
      { error: '獲取文檔失敗' },
      { status: 500 }
    );
  }
}