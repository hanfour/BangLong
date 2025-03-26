import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// 表單驗證架構
const contactFormSchema = z.object({
  name: z.string().min(2, { message: '姓名至少需要 2 個字元' }),
  email: z.string().email({ message: '請輸入有效的電子郵件地址' }),
  phone: z.string().min(8, { message: '請輸入有效的電話號碼' }),
  message: z.string().min(10, { message: '留言至少需要 10 個字元' }),
  privacyAgreed: z.boolean().refine(val => val === true, {
    message: '您必須同意個人資料收集聲明才能提交表單',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 驗證表單資料
    const validationResult = contactFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          errors: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const { name, email, phone, message } = validationResult.data;
      
    // 保存到資料庫
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
        status: 'new',
      },
    });
    
    // 表單提交成功訊息
    // 注意：我們不在這裡發送電子郵件，而是在前端調用 /api/sendEmail API
    // 這樣可以避免因郵件發送失敗而影響表單提交功能
    
    return NextResponse.json({ 
      success: true, 
      message: '表單提交成功',
      id: contactSubmission.id
    });
    
  } catch (error) {
    console.error('提交表單時發生錯誤:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '提交表單時發生伺服器錯誤，請稍後再試' 
      }, 
      { status: 500 }
    );
  }
}