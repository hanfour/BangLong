import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 獲取所有文檔列表（管理員用）
export async function GET(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
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
    console.error('獲取文檔列表失敗:', error);
    return NextResponse.json(
      { error: '獲取文檔列表失敗' },
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
    
    const body = await request.json();
    const { title, description, fileUrl, fileType, category, projectId, isActive } = body;
    
    // 驗證必填欄位
    if (!title || !fileUrl || !fileType || !category) {
      return NextResponse.json(
        { error: '標題、檔案URL、檔案類型和類別為必填欄位' },
        { status: 400 }
      );
    }
    
    // 確定最大順序值
    const maxOrderDoc = await prisma.document.findFirst({
      where: { category },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    
    const newOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 1;
    
    // 創建新文檔
    const newDocument = await prisma.document.create({
      data: {
        title,
        description: description || null,
        fileUrl,
        fileType,
        category,
        projectId: projectId || null,
        order: newOrder,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    return NextResponse.json({
      document: newDocument,
      message: '文檔創建成功'
    }, { status: 201 });
  } catch (error) {
    console.error('創建文檔失敗:', error);
    return NextResponse.json(
      { error: '創建文檔失敗' },
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
    
    const body = await request.json();
    const { id, title, description, fileUrl, fileType, category, projectId, order, isActive } = body;
    
    if (!id) {
      return NextResponse.json({ error: '缺少文檔ID' }, { status: 400 });
    }
    
    // 檢查文檔是否存在
    const existingDocument = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!existingDocument) {
      return NextResponse.json({ error: '找不到指定的文檔' }, { status: 404 });
    }
    
    // 更新文檔
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileType !== undefined && { fileType }),
        ...(category !== undefined && { category }),
        ...(projectId !== undefined && { projectId }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    });
    
    return NextResponse.json({
      document: updatedDocument,
      message: '文檔更新成功'
    });
  } catch (error) {
    console.error('更新文檔失敗:', error);
    return NextResponse.json(
      { error: '更新文檔失敗' },
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
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少文檔ID' }, { status: 400 });
    }
    
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
  } catch (error) {
    console.error('刪除文檔失敗:', error);
    return NextResponse.json(
      { error: '刪除文檔失敗' },
      { status: 500 }
    );
  }
}