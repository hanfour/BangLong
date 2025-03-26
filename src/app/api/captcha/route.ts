import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 用於存儲驗證碼的臨時存儲 (生產環境應使用 Redis 等緩存服務)
// 聲明全局 captchaStore 類型
declare global {
  // eslint-disable-next-line no-var
  var captchaStore: Record<string, { code: string; expires: number }>
}

// 注意：在無狀態的 Serverless 環境中，內存存儲會在每次函數調用間丟失
// 使用全域變數以確保在不同調用間維持狀態
global.captchaStore = global.captchaStore || {};
const captchaStore: Record<string, { code: string; expires: number }> = global.captchaStore;

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
    const now = Date.now();
    
    // 清理過期的驗證碼 (每次請求時進行清理)
    cleanupExpiredCaptchas();
    
    // 輸出驗證碼存儲狀態 (僅開發環境)
    if (process.env.NODE_ENV !== 'production') {
      console.log('當前驗證碼存儲狀態：', Object.keys(captchaStore).map(key => ({
        id: key.substring(0, 8) + '...',
        expires: new Date(captchaStore[key].expires).toISOString(),
        remainingTime: Math.round((captchaStore[key].expires - now) / 1000 / 60) + ' 分鐘'
      })));
    }
    
    // 將驗證碼存儲在服務器端（有效期10分鐘）
    captchaStore[captchaId] = {
      code,
      expires: now + 10 * 60 * 1000, // 10分鐘後過期
    };
    
    console.log(`生成新驗證碼 ID: ${captchaId.substring(0, 8)}...，驗證碼：${code}`);
    
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
  
  console.log(`驗證驗證碼 ID: ${captchaId}，輸入驗證碼: ${captchaText}`);
  
  const captchaData = captchaStore[captchaId];
  if (!captchaData) {
    console.log(`驗證失敗: 驗證碼不存在或已過期 (ID: ${captchaId})`);
    console.log('當前存儲的驗證碼IDs:', Object.keys(captchaStore));
    return false; // 驗證碼不存在或已過期
  }
  
  const isValid = captchaData.code === captchaText;
  console.log(`驗證${isValid ? '成功' : '失敗'}: 預期驗證碼 ${captchaData.code}，輸入驗證碼 ${captchaText}`);
  
  // 驗證後刪除，無論是否正確（防止暴力破解）
  delete captchaStore[captchaId];
  
  return isValid;
}