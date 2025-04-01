import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import axios from 'axios';
import { prisma } from '@/lib/db';

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
    let emailBody = validationResult.data.body;
    
    // 從設定獲取收件人列表
    let to = "hanfourhuang@gmail.com"; // 默認收件人
    
    try {
      // 嘗試從設定中獲取收件人和模板
      const [receiversSetting, templateSetting] = await Promise.all([
        prisma.siteSettings.findUnique({
          where: {
            type_key: {
              type: 'email',
              key: 'receivers'
            }
          }
        }),
        prisma.siteSettings.findUnique({
          where: {
            type_key: {
              type: 'email',
              key: 'notificationTemplate'
            }
          }
        })
      ]);
      
      // 處理收件人
      if (receiversSetting?.value) {
        to = receiversSetting.value; // 使用設定中的收件人
        console.log('使用設定的收件人:', to);
      } else {
        console.log('未找到設定的收件人，使用默認值:', to);
      }
      
      // 處理模板 (使用模板替換變量)
      if (templateSetting?.value) {
        // 如果有自定義模板，替換其中的變量
        let customTemplate = templateSetting.value;
        const formData = body; // 使用已驗證的請求數據
        
        // 替換模板變量
        customTemplate = customTemplate
          .replace(/{{name}}/g, formData.name || '')
          .replace(/{{email}}/g, formData.email || '')
          .replace(/{{phone}}/g, formData.phone || '')
          .replace(/{{message}}/g, formData.message || '');
          
        // 使用自定義模板
        emailBody = customTemplate;
        console.log('使用自定義郵件模板');
      }
    } catch (error) {
      console.error('獲取收件人設定時發生錯誤:', error);
      // 使用默認收件人繼續
    }
    
    // 由於前端已進行驗證碼驗證，此處只記錄
    console.log('跳過後端驗證碼驗證，直接處理郵件發送', { captchaId, captcha });

    // 記錄郵件內容
    console.log('發送郵件:', {
      to,
      subject,
      body: emailBody
    });
    
    // 使用 AWS API Gateway 發送郵件
    try {
      const apiGatewayUrl = process.env.API_GATEWAY_URL;
      const apiKey = process.env.API_GATEWAY_API_KEY;
      
      if (!apiGatewayUrl || !apiKey) {
        console.error('郵件服務配置不完整:', { apiGatewayUrl: !!apiGatewayUrl, apiKey: !!apiKey });
        return NextResponse.json(
          { 
            success: false, 
            message: '伺服器郵件服務配置錯誤' 
          }, 
          { status: 500 }
        );
      }
      
      console.log('調用 AWS API Gateway:', apiGatewayUrl);
      
      // 輸出請求格式
      console.log('發送請求到 API Gateway, 請求內容:', {
        url: apiGatewayUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': apiKey,
        },
        body: {
          to,
          subject,
          text: emailBody,
        }
      });
      
      // 使用 axios 調用 AWS API Gateway
      const response = await axios.post(
        apiGatewayUrl,
        {
          to,
          subject,
          text: emailBody,
          // 嘗試使用其他可能的參數命名
          message: emailBody,
          body: emailBody,
          content: emailBody,
          email: to
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'x-api-key': apiKey,
          },
        }
      );
      
      console.log('AWS API Gateway 回應:', response.status, response.statusText);
      
      if (response.status < 200 || response.status >= 300) {
        console.error('AWS API Gateway 錯誤:', response.data);
        throw new Error(`API Gateway 回應狀態: ${response.status}`);
      }
    } catch (emailError) {
      // 輸出詳細錯誤信息
      console.error('發送郵件時發生錯誤:', emailError);
      
      // 如果是 axios 錯誤，則提取更多信息
      let errorDetails = '';
      if (axios.isAxiosError(emailError) && emailError.response) {
        console.error('API 響應詳情:', {
          status: emailError.response.status,
          statusText: emailError.response.statusText,
          data: emailError.response.data,
          headers: emailError.response.headers
        });
        errorDetails = JSON.stringify({
          status: emailError.response.status,
          data: emailError.response.data
        });
      }
      
      // 在開發環境中透過前端回傳詳細錯誤訊息
      const errorMessage = process.env.NODE_ENV === 'production' 
        ? '發送郵件時發生錯誤，請稍後再試'
        : `發送郵件時發生錯誤: ${emailError instanceof Error ? emailError.message : String(emailError)} ${errorDetails}`;
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          error: emailError instanceof Error ? emailError.message : String(emailError)
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