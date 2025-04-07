import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// 獲取單個文檔詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // 確認表結構正確
    try {
      await prisma.$queryRaw`SELECT "id", "title", "description", "fileUrl", "imageUrl", "fileType", "category", "order", "isActive", "projectId", "createdAt", "updatedAt" FROM "Document" LIMIT 1`;
    } catch (e) {
      console.error('Schema validation error (GET Document):', e);
      return NextResponse.json({ 
        error: '數據庫結構不符合或未遷移',
        details: e instanceof Error ? e.message : 'Unknown error'
      }, { status: 500 });
    }
    
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              title: true,
              imageUrl: true
            }
          }
        }
      });
      
      if (!document) {
        return NextResponse.json({ error: '找不到指定的文檔' }, { status: 404 });
      }
      
      // 檢查是否為管理員
      const session = await getServerSession(authOptions);
      const isAdmin = !!session;
      
      // 如果不是管理員且文檔未啟用，則拒絕訪問
      if (!isAdmin && !document.isActive) {
        return NextResponse.json({ error: '無法訪問此文檔' }, { status: 403 });
      }
      
      return NextResponse.json({ document });
    } catch (dbError) {
      console.error('獲取文檔詳情資料庫查詢失敗:', dbError);
      
      return NextResponse.json({
        error: '獲取文檔詳情數據失敗',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('獲取文檔詳情失敗:', error);
    return NextResponse.json(
      { 
        error: '獲取文檔詳情失敗',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}