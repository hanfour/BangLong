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
        const replyReminder = "在此提醒您，請勿直接回覆或透過此郵件地址與我們聯繫，我們將不會收到您所留下的任何訊息。";
        const emailSubject = `[邦隆建設] 您的諮詢已回覆 - 案件編號 ${id.substring(0, 8)}`;
        
        // 創建純HTML格式郵件，使用表格布局以獲得更好的郵件客戶端兼容性
        const emailBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>邦隆建設回覆通知</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: #333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px;">
          <!-- 標題 -->
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #f9f5f0; border-radius: 5px 5px 0 0;">
              <h1 style="color: #40220f; margin: 0; font-size: 24px;">邦隆建設客戶服務部</h1>
            </td>
          </tr>
          
          <!-- 內容 -->
          <tr>
            <td style="padding: 20px;">
              <p style="margin-top: 0;">親愛的 <strong>${contactSubmission.name}</strong> 您好：</p>
              <p>感謝您對邦隆建設的信任與支持。我們已處理您於 ${new Date(contactSubmission.createdAt).toLocaleDateString('zh-TW')} 提交的諮詢，詳情如下：</p>
              
              <!-- 原始諮詢 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; background-color: #f5f5f5; border-left: 4px solid #a48b78;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">您的原始諮詢內容：</p>
                    <p style="margin: 0;">${contactSubmission.message.replace(/\n/g, '<br>')}</p>
                  </td>
                </tr>
              </table>
              
              <!-- 回覆內容 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; border-left: 4px solid #40220f;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">我們的回覆：</p>
                    <div style="margin: 0;">${reply.replace(/\n/g, '<br>')}</div>
                  </td>
                </tr>
              </table>
              
              <p>如您有任何進一步的問題或需求，歡迎透過以下方式與我們聯繫：</p>
              
              <ul style="padding-left: 20px;">
                <li>電話：(02) XXXX-XXXX</li>
                <li>官網：<a href="https://www.banglongconstruction.com" style="color: #a48b78; text-decoration: underline;">www.banglongconstruction.com</a></li>
              </ul>
              
              <p style="color: #ff6600; font-style: italic; margin: 20px 0; padding: 10px; border: 1px dashed #ff6600; background-color: #fff8f0;">${replyReminder}</p>
            </td>
          </tr>
          
          <!-- 頁尾 -->
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #f5f5f5; border-top: 1px solid #dddddd; font-size: 12px; color: #777777; border-radius: 0 0 5px 5px;">
              <p style="margin: 0 0 5px 0;">此郵件由系統自動發送，請勿直接回覆。</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} 邦隆建設 版權所有</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
        
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