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
    
    // 驗證表單資料
    const validationResult = sendEmailSchema.safeParse(body);
    
    if (!validationResult.success) {
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
    if (!isValidCaptcha) {
      return NextResponse.json(
        { 
          success: false, 
          message: '驗證碼不正確或已過期' 
        }, 
        { status: 400 }
      );
    }

    // 在開發/測試環境下，簡單記錄郵件內容而不實際發送
    console.log('發送郵件:', {
      to,
      subject,
      body: emailBody
    });
    
    // 實際環境下，使用適當的郵件服務
    if (process.env.NODE_ENV === 'production') {
      // 使用外部郵件服務發送郵件
      // 這裡假設使用環境變數中設定的外部 API 網關來發送郵件
      const apiGatewayUrl = process.env.API_GATEWAY_URL;
      const apiKey = process.env.API_GATEWAY_API_KEY;

      if (!apiGatewayUrl || !apiKey) {
        console.error('郵件服務配置不完整');
        return NextResponse.json(
          { 
            success: false, 
            message: '伺服器郵件服務配置錯誤' 
          }, 
          { status: 500 }
        );
      }

      // 使用 axios 調用外部郵件服務 API
      try {
        await axios.post(
          apiGatewayUrl,
          {
            to,
            subject,
            text: emailBody,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );
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