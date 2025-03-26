import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCaptcha } from '../captcha/route';
import axios from 'axios';

// 表單驗證架構
const sendEmailSchema = z.object({
  subject: z.string().min(2, { message: '主旨不能為空' }),
  body: z.string().min(10, { message: '郵件內容不能為空' }),
  captcha: z.string().length(4, { message: '驗證碼必須是 4 位數字' }),
  captchaId: z.string().uuid({ message: '無效的驗證碼ID' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('接收到的郵件請求資料:', body);
    
    // 驗證表單資料
    const validationResult = sendEmailSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('郵件表單驗證失敗:', validationResult.error.format());
      return NextResponse.json(
        { 
          success: false, 
          errors: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const { subject, captcha, captchaId } = validationResult.data;
    const emailBody = validationResult.data.body;
    const to = "hanfourhuang@gmail.com"; // 固定收件人電子郵件
    
    // 驗證驗證碼
    const isValidCaptcha = verifyCaptcha(captchaId, captcha);
    console.log('驗證碼驗證結果:', isValidCaptcha, { captchaId, captcha });
    
    if (!isValidCaptcha) {
      return NextResponse.json(
        { 
          success: false, 
          message: '驗證碼不正確或已過期' 
        }, 
        { status: 400 }
      );
    }

    // 記錄郵件內容
    console.log('發送郵件:', {
      to,
      subject,
      body: emailBody
    });
    
    // 使用 SendGrid 發送郵件
    try {
      // 使用 fetch 代替 axios (減少依賴)
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: subject,
            },
          ],
          from: { email: 'noreply@banglongconstruction.com', name: '邦瓏建設' },
          content: [
            {
              type: 'text/plain',
              value: emailBody,
            },
          ],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('SendGrid API 錯誤:', errorData);
        throw new Error(`SendGrid API 回應狀態: ${response.status}`);
      }
    } catch (emailError) {
      console.error('發送郵件時發生錯誤:', emailError);
      return NextResponse.json(
        { 
          success: false, 
          message: '發送郵件時發生錯誤，請稍後再試' 
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '郵件發送成功'
    });
    
  } catch (error) {
    console.error('處理請求時發生錯誤:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '處理請求時發生錯誤，請稍後再試' 
      }, 
      { status: 500 }
    );
  }
}