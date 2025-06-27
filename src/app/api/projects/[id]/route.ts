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
        documents: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        }
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
    const { title, description, category, images, details, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少專案 ID' }, { status: 400 });
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
      // 1. 更新專案基本資料
      const projectUpdate = await tx.project.update({
        where: { id },
        data: {
          title,
          description,
          category,
          details,
          order,
          isActive,
        },
      });

      // 2. 處理圖片更新
      if (images && Array.isArray(images)) {
        const existingImages = await tx.projectImage.findMany({
          where: { projectId: id },
        });

        const existingImageUrls = existingImages.map(img => img.imageUrl);
        const newImageUrls = images.map((img: { imageUrl: string }) => img.imageUrl);

        // 找出要刪除的圖片
        const imagesToDelete = existingImages.filter(
          img => !newImageUrls.includes(img.imageUrl)
        );

        // 找出要新增的圖片
        const imagesToAdd = images.filter(
          (img: { imageUrl: string }) => !existingImageUrls.includes(img.imageUrl)
        );

        // 找出要更新的圖片 (順序可能改變)
        const imagesToUpdate = images.filter(
          (img: { id?: string, imageUrl: string }) => existingImageUrls.includes(img.imageUrl)
        );

        // 執行刪除
        if (imagesToDelete.length > 0) {
          await tx.projectImage.deleteMany({
            where: {
              id: {
                in: imagesToDelete.map(img => img.id),
              },
            },
          });
        }

        // 執行新增
        if (imagesToAdd.length > 0) {
          await tx.projectImage.createMany({
            data: imagesToAdd.map((img: { imageUrl: string, order: number }) => ({
              imageUrl: img.imageUrl,
              order: img.order,
              projectId: id,
            })),
          });
        }

        // 執行更新
        for (const img of imagesToUpdate) {
          await tx.projectImage.updateMany({
            where: {
              projectId: id,
              imageUrl: img.imageUrl,
            },
            data: {
              order: img.order,
            },
          });
        }
      }

      return projectUpdate;
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
