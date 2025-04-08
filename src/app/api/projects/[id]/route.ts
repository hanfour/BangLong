import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// 獲取單個專案
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        documents: true
      }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: '專案不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('獲取專案失敗:', error);
    return NextResponse.json(
      { error: '獲取專案失敗' },
      { status: 500 }
    );
  }
}

// 更新專案
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 檢查管理員身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    const { title, description, category, imageUrl, details, order, isActive } = body;
    
    // 檢查專案是否存在
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: '專案不存在' },
        { status: 404 }
      );
    }
    
    // 更新專案
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: title ?? existingProject.title,
        description: description === undefined ? existingProject.description : description,
        category: category ?? existingProject.category,
        imageUrl: imageUrl ?? existingProject.imageUrl,
        details: details === undefined ? existingProject.details : details,
        order: order ?? existingProject.order,
        isActive: isActive === undefined ? existingProject.isActive : isActive
      }
    });
    
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error('更新專案失敗:', error);
    return NextResponse.json(
      { error: '更新專案失敗' },
      { status: 500 }
    );
  }
}

// 刪除專案
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 檢查管理員身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const id = params.id;
    
    // 檢查專案是否存在
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { documents: true }
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: '專案不存在' },
        { status: 404 }
      );
    }
    
    // 如果專案有關聯的文檔，則起用 Document 的 projectId
    if (existingProject.documents.length > 0) {
      await prisma.document.updateMany({
        where: { projectId: id },
        data: { projectId: null }
      });
    }

    // 刪除專案
    await prisma.project.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除專案失敗:', error);
    return NextResponse.json(
      { error: '刪除專案失敗' },
      { status: 500 }
    );
  }
}
