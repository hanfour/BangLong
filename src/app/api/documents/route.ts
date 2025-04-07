import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// 獲取文檔列表，可依據類別篩選
export async function GET(request: NextRequest) {
  try {
    // 確認表結構正確
    try {
      await prisma.$queryRaw`SELECT "id", "title", "description", "fileUrl", "imageUrl", "fileType", "category", "order", "isActive", "projectId", "createdAt", "updatedAt" FROM "Document" LIMIT 1`;
    } catch (e) {
      console.error('Schema validation error (GET Documents):', e);
      return NextResponse.json({ 
        error: '數據庫結構不符合或未遷移',
        details: e instanceof Error ? e.message : 'Unknown error',
        message: '請聯繫管理員確認數據庫狀態'
      }, { status: 500 });
    }
    
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
    
    try {
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
    } catch (dbError) {
      console.error('獲取文檔數據庫查詢失敗:', dbError);
      
      return NextResponse.json({
        error: '獲取文檔數據失敗',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('獲取文檔失敗:', error);
    return NextResponse.json(
      { 
        error: '獲取文檔失敗',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}