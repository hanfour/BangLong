import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const crypto = await import('crypto');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '缺少 email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 發送邀請信
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/sendEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '重新邀請您加入平台',
          body: `
            <p>您好 ${user.name}，</p>
            <p>請點擊以下連結設定您的密碼：</p>
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
      console.error('重新寄送邀請信失敗:', emailError);
    }

    return NextResponse.json({ message: '邀請信已重新發送' });
  } catch (error) {
    console.error('重新發送邀請信失敗:', error);
    return NextResponse.json({ error: '重新發送邀請信失敗' }, { status: 500 });
  }
}
