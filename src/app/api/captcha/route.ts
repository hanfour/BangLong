import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 用於存儲驗證碼的臨時存儲 (生產環境應使用 Redis 等緩存服務)
const captchaStore: Record<string, { code: string; expires: number }> = {};

// 清理過期的驗證碼
function cleanupExpiredCaptchas() {
  const now = Date.now();
  Object.keys(captchaStore).forEach(key => {
    if (captchaStore[key].expires < now) {
      delete captchaStore[key];
    }
  });
}

// 定期清理過期驗證碼（5分鐘一次）
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCaptchas, 5 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  try {
    // 生成4位隨機數字驗證碼
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const captchaId = uuidv4();
    
    // 將驗證碼存儲在服務器端（有效期10分鐘）
    captchaStore[captchaId] = {
      code,
      expires: Date.now() + 10 * 60 * 1000, // 10分鐘後過期
    };
    
    // 由於移除了 canvas 依賴，此處回傳純文本驗證碼
    // 在實際生產環境中，應使用其他替代方案產生圖形驗證碼
    
    // 返回驗證碼ID和純文本驗證碼（測試環境使用）
    return NextResponse.json({
      success: true,
      captchaId,
      captchaText: code, // 注意：在生產環境中不應回傳明文驗證碼
    });
    
  } catch (error) {
    console.error('生成驗證碼時發生錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        message: '生成驗證碼時發生錯誤',
      },
      { status: 500 }
    );
  }
}

// 用於驗證驗證碼的函數（供其他 API 使用）
export function verifyCaptcha(captchaId: string, captchaText: string): boolean {
  cleanupExpiredCaptchas(); // 清理過期驗證碼
  
  const captchaData = captchaStore[captchaId];
  if (!captchaData) {
    return false; // 驗證碼不存在或已過期
  }
  
  const isValid = captchaData.code === captchaText;
  
  // 驗證後刪除，無論是否正確（防止暴力破解）
  delete captchaStore[captchaId];
  
  return isValid;
}