import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// 獲取所有文檔列表（管理員用）
export async function GET(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    try {
      // 檢查 document 表是否存在和結構是否正確
      await prisma.$queryRaw`SELECT "id", "title", "description", "fileUrl", "imageUrl", "fileType", "category", "order", "isActive", "projectId", "createdAt", "updatedAt" FROM "Document" LIMIT 1`;
    } catch (e) {
      console.error('Schema validation error:', e);
      return NextResponse.json({ error: '數據庫結構不符合或未遷移', schemaError: true }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    
    const where: any = {};
    
    if (category) {
      where.category = category;
    }

    if (projectId) {
      where.projectId = projectId;
    }
    
    // 使用 try/catch 更具體地處理可能的錯誤
    try {
      const documents = await prisma.document.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { order: 'asc' }
        ],
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
      console.error('查詢文檔失敗:', error);
      return NextResponse.json(
        { error: '查詢文檔失敗', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('獲取文檔列表失敗:', error);
    return NextResponse.json(
      { error: '獲取文檔列表失敗', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 新增文檔
export async function POST(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    // 先檢查表結構是否正確
    try {
      await prisma.$queryRaw`SELECT "id", "title", "description", "fileUrl", "imageUrl", "fileType", "category", "order", "isActive", "projectId", "createdAt", "updatedAt" FROM "Document" LIMIT 1`;
    } catch (e) {
      console.error('Schema validation error (POST):', e);
      return NextResponse.json({ 
        error: '數據庫結構不符合或未遷移',
        message: '請聯繫管理員執行數據庫遷移', 
        details: e instanceof Error ? e.message : 'Unknown error',
        schemaError: true 
      }, { status: 500 });
    }
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: '無效的請求數據', details: 'JSON parsing failed' }, { status: 400 });
    }
    
    const { title, description, fileUrl, imageUrl, fileType, category, projectId, isActive } = body;
    
    // 驗證必填欄位
    if (!title || !fileUrl || !fileType || !category) {
      return NextResponse.json(
        { error: '標題、檔案URL、檔案類型和類別為必填欄位' },
        { status: 400 }
      );
    }
    
    try {
      // 確定最大順序值
      const maxOrderDoc = await prisma.document.findFirst({
        where: { category },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      
      const newOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 1;
      
      // 準備資料
      const documentData: Prisma.DocumentCreateInput = {
        title,
        description: description || null,
        fileUrl,
        imageUrl: imageUrl || null,
        fileType,
        category,
        order: newOrder,
        isActive: isActive !== undefined ? isActive : true,
      };
      
      // 如果有專案ID，建立關聯
      if (projectId) {
        documentData.project = {
          connect: { id: projectId }
        };
      }
      
      // 創建新文檔
      const newDocument = await prisma.document.create({
        data: documentData
      });
      
      return NextResponse.json({
        document: newDocument,
        message: '文檔創建成功'
      }, { status: 201 });
    } catch (dbError) {
      console.error('資料庫操作失敗:', dbError);
      
      // 判斷是否是外鍵約束錯誤
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        if (dbError.code === 'P2003') {
          return NextResponse.json({
            error: '關聯的專案不存在',
            details: dbError.message
          }, { status: 400 });
        }
        if (dbError.code === 'P2002') {
          return NextResponse.json({
            error: '文檔已存在',
            details: dbError.message
          }, { status: 400 });
        }
      }
      
      return NextResponse.json({
        error: '創建文檔失敗',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('創建文檔失敗 (外層):', error);
    return NextResponse.json(
      { 
        error: '創建文檔失敗', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 更新文檔
export async function PATCH(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }
    
    // 檢查結構
    try {
      await prisma.$queryRaw`SELECT "id", "title", "description", "fileUrl", "imageUrl", "fileType", "category", "order", "isActive", "projectId", "createdAt", "updatedAt" FROM "Document" LIMIT 1`;
    } catch (e) {
      console.error('Schema validation error (PATCH):', e);
      return NextResponse.json({ 
        error: '數據庫結構不符合或未遷移',
        details: e instanceof Error ? e.message : 'Unknown error'
      }, { status: 500 });
    }
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: '無效的請求數據', details: 'JSON parsing failed' }, { status: 400 });
    }
    
    const { id, title, description, fileUrl, imageUrl, fileType, category, projectId, order, isActive } = body;
    
    if (!id) {
      return NextResponse.json({ error: '缺少文檔ID' }, { status: 400 });
    }
    
    try {
      // 檢查文檔是否存在
      const existingDocument = await prisma.document.findUnique({
        where: { id }
      });
      
      if (!existingDocument) {
        return NextResponse.json({ error: '找不到指定的文檔' }, { status: 404 });
      }
      
      // 準備更新資料
      const updateData: any = {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(fileType !== undefined && { fileType }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      };
      
      // 單獨處理專案關聯
      if (projectId !== undefined) {
        if (projectId) {
          // 檢查專案是否存在
          const project = await prisma.project.findUnique({
            where: { id: projectId }
          });
          
          if (!project) {
            return NextResponse.json({ error: '關聯的專案不存在' }, { status: 400 });
          }
          
          updateData.project = { connect: { id: projectId } };
        } else {
          // 移除專案關聯
          updateData.project = { disconnect: true };
        }
      }
      
      // 更新文檔
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: updateData,
        include: {
          project: {
            select: {
              title: true,
              imageUrl: true
            }
          }
        }
      });
      
      return NextResponse.json({
        document: updatedDocument,
        message: '文檔更新成功'
      });
    } catch (dbError) {
      console.error('更新文檔資料庫操作失敗:', dbError);
      
      // 處理不同類型的錯誤
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        if (dbError.code === 'P2003') {
          return NextResponse.json({
            error: '關聯的專案不存在',
            details: dbError.message
          }, { status: 400 });
        }
      }
      
      return NextResponse.json({
        error: '更新文檔失敗',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('更新文檔失敗 (外層):', error);
    return NextResponse.json(
      { 
        error: '更新文檔失敗', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 刪除文檔
export async function DELETE(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }
    
    // 確認表結構正確
    try {
      await prisma.$queryRaw`SELECT "id" FROM "Document" LIMIT 1`;
    } catch (e) {
      console.error('Schema validation error (DELETE):', e);
      return NextResponse.json({ 
        error: '數據庫結構不符合或未遷移',
        details: e instanceof Error ? e.message : 'Unknown error'
      }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少文檔ID' }, { status: 400 });
    }
    
    try {
      // 檢查文檔是否存在
      const existingDocument = await prisma.document.findUnique({
        where: { id }
      });
      
      if (!existingDocument) {
        return NextResponse.json({ error: '找不到指定的文檔' }, { status: 404 });
      }
      
      // 刪除文檔
      await prisma.document.delete({
        where: { id }
      });
      
      return NextResponse.json({
        message: '文檔刪除成功'
      });
    } catch (dbError) {
      console.error('刪除文檔資料庫操作失敗:', dbError);
      
      // 提供更詳細的錯誤訊息
      return NextResponse.json({
        error: '刪除文檔失敗',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('刪除文檔失敗 (外層):', error);
    return NextResponse.json(
      { 
        error: '刪除文檔失敗', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}