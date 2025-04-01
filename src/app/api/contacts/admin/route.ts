import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 獲取所有聯絡表單提交
export async function GET(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }

    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = Number(searchParams.get('limit')) || 100;
    const offset = Number(searchParams.get('offset')) || 0;

    // 構建查詢條件
    let where: any = {};
    
    // 狀態過濾
    if (status) {
      where.status = status;
    }
    
    // 搜尋功能
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // 日期範圍過濾
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        // 增加一天確保包含整個結束日期
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    // 查詢資料
    const contactSubmissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // 獲取總數
    const total = await prisma.contactSubmission.count({ where });
    
    // 獲取每個狀態的數量統計 (改用 Prisma Aggregations 避免 Raw Query)
    const newCount = await prisma.contactSubmission.count({ 
      where: { status: 'new' } 
    });
    
    const processingCount = await prisma.contactSubmission.count({ 
      where: { status: 'processing' } 
    });
    
    const completedCount = await prisma.contactSubmission.count({ 
      where: { status: 'completed' } 
    });
    
    const statusStats = [
      { status: 'new', count: newCount },
      { status: 'processing', count: processingCount },
      { status: 'completed', count: completedCount }
    ];

    return NextResponse.json({
      data: contactSubmissions,
      total,
      limit,
      offset,
      statusStats,
    });
  } catch (error) {
    console.error('獲取聯絡表單列表失敗:', error);
    return NextResponse.json(
      { error: '獲取聯絡表單列表失敗' },
      { status: 500 }
    );
  }
}

// 更新聯絡表單提交狀態
export async function PATCH(request: NextRequest) {
  try {
    // 檢查用戶是否已認證
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, status, reply } = body;
    
    if (!id) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }
    
    // 獲取聯絡表單詳情，以便發送郵件
    const contactSubmission = await prisma.contactSubmission.findUnique({
      where: { id }
    });
    
    if (!contactSubmission) {
      return NextResponse.json({ error: '找不到指定的聯絡表單' }, { status: 404 });
    }
    
    // 更新資料
    const updatedContactSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(reply !== undefined && { reply }),
        updatedAt: new Date(),
      },
    });
    
    // 如果有回覆內容，且狀態變更為已完成，則發送郵件通知
    if (reply && (status === 'completed' || contactSubmission.status === 'completed')) {
      try {
        // 準備發送郵件
        const replyReminder = "\n\n在此提醒您，請勿直接回覆或透過此郵件地址與我們聯繫，我們將不會收到您所留下的任何訊息。";
        const emailSubject = `[邦隆建設] 您的諮詢已回覆 - 案件編號 ${id.substring(0, 8)}`;
        const emailBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #40220f;">邦隆建設客戶服務部</h2>
          <p>親愛的 ${contactSubmission.name} 您好：</p>
          <p>感謝您對邦隆建設的信任與支持。我們已處理您於 ${new Date(contactSubmission.createdAt).toLocaleDateString('zh-TW')} 提交的諮詢，詳情如下：</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #a48b78;">
            <p style="margin: 0 0 10px 0;"><strong>您的原始諮詢內容：</strong></p>
            <p style="margin: 0;">${contactSubmission.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="padding: 15px; margin: 15px 0; border-left: 4px solid #40220f;">
            <p style="margin: 0 0 10px 0;"><strong>我們的回覆：</strong></p>
            <p style="margin: 0;">${reply.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>如您有任何進一步的問題或需求，歡迎透過以下方式與我們聯繫：</p>
          <ul>
            <li>電話：(02) XXXX-XXXX</li>
            <li>官網：<a href="https://www.banglongconstruction.com" style="color: #a48b78;">www.banglongconstruction.com</a></li>
          </ul>
          
          <p style="color: #ff6600; font-style: italic;">${replyReminder}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>此郵件由系統自動發送，請勿直接回覆。</p>
            <p>© ${new Date().getFullYear()} 邦隆建設 版權所有</p>
          </div>
        </div>`;
        
        // 發送郵件
        let apiUrl = '/api/sendEmail';
        if (process.env.NEXTAUTH_URL) {
          apiUrl = `${process.env.NEXTAUTH_URL}/api/sendEmail`;
        }
        
        const emailResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: emailSubject,
            body: emailBody,
            to: contactSubmission.email,
            isAdminReply: true, // 標記為管理員回覆，跳過驗證碼驗證
            captcha: '0000',    // 占位符，將在 API 中被忽略
            captchaId: '00000000-0000-0000-0000-000000000000' // 占位符
          }),
        });
        
        if (!emailResponse.ok) {
          const emailErrorData = await emailResponse.json();
          console.error('郵件發送失敗:', emailErrorData);
        }
        
        console.log('已發送回覆郵件至:', contactSubmission.email);
      } catch (emailError) {
        console.error('發送回覆郵件失敗:', emailError);
        // 郵件發送失敗不影響更新操作，僅記錄錯誤
      }
    }
    
    return NextResponse.json({
      data: updatedContactSubmission,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新聯絡表單狀態失敗:', error);
    return NextResponse.json(
      { error: '更新聯絡表單狀態失敗' },
      { status: 500 }
    );
  }
}