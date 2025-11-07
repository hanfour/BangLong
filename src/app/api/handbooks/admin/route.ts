import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcrypt';

// 獲取所有手冊 (後台,含停用)
export async function GET(request: NextRequest) {
  try {
    // 驗證認證
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: any = {};

    // 專案篩選
    if (projectId && projectId !== 'all') {
      where.projectId = projectId;
    }

    // 搜尋功能
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { project: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const handbooks = await prisma.handbook.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        project: {
          select: { id: true, title: true },
        },
        _count: {
          select: { files: true },
        },
      },
    });

    // 密碼遮罩
    const handbooksWithMaskedPassword = handbooks.map((handbook) => ({
      ...handbook,
      password: '****',
    }));

    return NextResponse.json({ handbooks: handbooksWithMaskedPassword });
  } catch (error) {
    console.error('獲取手冊列表失敗:', error);
    return NextResponse.json(
      { error: '獲取手冊列表失敗' },
      { status: 500 }
    );
  }
}

// 新增手冊
export async function POST(request: NextRequest) {
  try {
    // 驗證認證
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const data = await request.json();

    // 驗證必填欄位
    if (!data.title || !data.coverImageUrl || !data.password) {
      return NextResponse.json(
        { error: '標題、封面圖片、密碼為必填欄位' },
        { status: 400 }
      );
    }

    // 驗證密碼長度
    if (data.password.length < 6 || data.password.length > 8) {
      return NextResponse.json(
        { error: '密碼長度必須為 6-8 位' },
        { status: 400 }
      );
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 建立手冊
    const handbook = await prisma.handbook.create({
      data: {
        title: data.title,
        coverImageUrl: data.coverImageUrl,
        password: hashedPassword,
        description: data.description,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        projectId: data.projectId || null,
      },
      include: {
        project: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({ handbook });
  } catch (error) {
    console.error('新增手冊失敗:', error);
    return NextResponse.json(
      { error: '新增手冊失敗' },
      { status: 500 }
    );
  }
}
