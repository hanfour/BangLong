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
    
    // 確認表是否存在
    try {
      await prisma.$queryRaw`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Document'
      )`;
    } catch (e) {
      console.error('Schema validation error (GET Document):', e);
      return NextResponse.json({ 
        error: '數據庫表不存在',
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

// 記錄文檔下載或使用事件
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // 確認表是否存在
    try {
      await prisma.$queryRaw`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Document'
      )`;
    } catch (e) {
      console.error('Schema validation error (POST Document):', e);
      return NextResponse.json({ 
        error: '數據庫表不存在',
        details: e instanceof Error ? e.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // 解析請求體
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ 
        success: false, 
        error: '無效的請求數據' 
      }, { status: 400 });
    }
    
    const { action } = body;
    
    if (action !== 'download' && action !== 'view') {
      return NextResponse.json({ 
        success: false, 
        error: '無效的操作類型' 
      }, { status: 400 });
    }
    
    try {
      // 驗證文檔是否存在
      const document = await prisma.document.findUnique({
        where: { id }
      });
      
      if (!document) {
        return NextResponse.json({ 
          success: false, 
          error: '找不到指定的文檔' 
        }, { status: 404 });
      }
      
      // 記錄下載事件 (這裏僅更新下載次數，未來可擴展為完整的下載記錄表)
      const updatedDoc = await prisma.document.update({
        where: { id },
        data: {
          downloadCount: {
            increment: 1
          },
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json({
        success: true,
        action: action,
        document: {
          id: updatedDoc.id,
          downloadCount: updatedDoc.downloadCount
        }
      });
    } catch (dbError) {
      console.error('記錄文檔下載事件失敗:', dbError);
      
      // 即使記錄失敗也返回成功，避免影響用戶體驗
      return NextResponse.json({
        success: true,
        warning: '下載已完成，但系統無法記錄下載事件'
      });
    }
  } catch (error) {
    console.error('處理文檔下載事件失敗:', error);
    
    // 即使記錄失敗也返回成功，避免影響用戶體驗
    return NextResponse.json({
      success: true,
      warning: '下載已完成，但系統無法記錄下載事件'
    });
  }
}