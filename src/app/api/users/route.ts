import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// 用戶創建驗證
const createUserSchema = z.object({
  name: z.string().min(2, { message: '姓名至少需要 2 個字元' }),
  email: z.string().email({ message: '請輸入有效的電子郵件地址' }),
  password: z.string().min(6, { message: '密碼至少需要 6 個字元' }),
  role: z.enum(['admin', 'editor']).default('admin'),
});

// 用戶更新驗證（無需密碼）
const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: '姓名至少需要 2 個字元' }),
  email: z.string().email({ message: '請輸入有效的電子郵件地址' }),
  role: z.enum(['admin', 'editor']).default('admin'),
  password: z.string().min(6).optional(),
});

// 獲取所有用戶
export async function GET(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    // 獲取所有用戶
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        hasChangedPassword: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('獲取用戶列表失敗:', error);
    return NextResponse.json(
      { error: '獲取用戶列表失敗' },
      { status: 500 }
    );
  }
}

// 創建新用戶
export async function POST(request: NextRequest) {
  try {
    const crypto = await import('crypto');

    // 檢查用戶是否已認證並具有管理員權限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    const body = await request.json();
    
    // 驗證用戶數據
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '數據驗證失敗', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, role } = validationResult.data;

    // 檢查郵箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '此電子郵件地址已被使用' },
        { status: 400 }
      );
    }

    // 產生亂數密碼
    const randomPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // 產生重設密碼 token 與過期時間
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小時

    // 創建用戶
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        hasChangedPassword: false,
        resetToken,
        resetTokenExpiry,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // 發送邀請信
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/sendEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '邀請您加入平台',
          body: `
            <p>您好 ${name}，</p>
            <p>您已被邀請加入平台，請點擊以下連結設定您的密碼：</p>
            <p><a href="${process.env.NEXTAUTH_URL}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}">設定密碼</a></p>
            <p>此連結24小時內有效。</p>
            <p>如果您未申請此帳號，請忽略此郵件。</p>
          `,
          captcha: 'system',
          captchaId: 'system',
          to: email,
        }),
      });
    } catch (emailError) {
      console.error('寄送邀請信失敗:', emailError);
    }

    return NextResponse.json({
      message: '用戶創建成功，邀請信已寄出',
      data: newUser,
    });
  } catch (error) {
    console.error('創建用戶失敗:', error);
    return NextResponse.json(
      { error: '創建用戶失敗' },
      { status: 500 }
    );
  }
}

// 更新用戶
export async function PUT(request: NextRequest) {
  try {
    // 檢查用戶是否已認證並具有管理員權限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    const body = await request.json();
    
    // 驗證用戶數據
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '數據驗證失敗', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { id, name, email, role, password } = validationResult.data;

    // 檢查用戶是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: '找不到要更新的用戶' },
        { status: 404 }
      );
    }

    // 檢查郵箱是否已被其他用戶使用
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: '此電子郵件地址已被使用' },
          { status: 400 }
        );
      }
    }

    // 準備更新數據
    const updateData: any = {
      name,
      email,
      role,
    };

    // 如果提供了新密碼，則加密並更新
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 更新用戶
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: '用戶更新成功',
      data: updatedUser,
    });
  } catch (error) {
    console.error('更新用戶失敗:', error);
    return NextResponse.json(
      { error: '更新用戶失敗' },
      { status: 500 }
    );
  }
}

// 刪除用戶
export async function DELETE(request: NextRequest) {
  try {
    // 檢查用戶是否已認證並具有管理員權限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    // 從 URL 獲取用戶 ID
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      );
    }

    // 檢查是否為當前登錄用戶（不允許刪除自己）
    if (id === session.user.id) {
      return NextResponse.json(
        { error: '無法刪除當前登錄的用戶' },
        { status: 400 }
      );
    }

    // 檢查用戶是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: '找不到要刪除的用戶' },
        { status: 404 }
      );
    }

    // 刪除用戶
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: '用戶刪除成功',
    });
  } catch (error) {
    console.error('刪除用戶失敗:', error);
    return NextResponse.json(
      { error: '刪除用戶失敗' },
      { status: 500 }
    );
  }
}
