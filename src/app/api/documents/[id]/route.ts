import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 獲取單個文檔詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
  } catch (error) {
    console.error('獲取文檔詳情失敗:', error);
    return NextResponse.json(
      { error: '獲取文檔詳情失敗' },
      { status: 500 }
    );
  }
}