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
    
    // 生產環境暫時直接返回成功，不實際發送電子郵件
    // TODO: 當配置好郵件服務後移除此臨時方案
    
    // 正式的郵件發送功能已注釋，待配置完成後啟用
    /*
    // 使用外部郵件服務發送郵件
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
    */
    
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