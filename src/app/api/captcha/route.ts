import { NextRequest, NextResponse } from 'next/server';
import { createCanvas } from 'canvas';
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
    
    // 創建 canvas 並繪製驗證碼
    const canvas = createCanvas(100, 50);
    const ctx = canvas.getContext('2d');
    
    // 設置背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加背景噪點
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        1
      );
    }
    
    // 設置文字基線
    ctx.textBaseline = 'middle';
    
    // 隨機放置字元並旋轉
    for (let i = 0; i < code.length; i++) {
      const fontSize = 20 + Math.random() * 10;
      ctx.font = `bold ${fontSize}px Arial`;
      
      // 生成較深的隨機顏色，確保可讀性
      const r = Math.floor(Math.random() * 100);
      const g = Math.floor(Math.random() * 100);
      const b = Math.floor(Math.random() * 100 + 155);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      
      // 輕微旋轉
      ctx.save();
      const x = 15 + i * 22;
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
    
    // 添加干擾線
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(
        Math.random() * 150
      )}, ${Math.floor(Math.random() * 150 + 100)}, 0.5)`;
      
      // 繪製曲線而非直線
      ctx.moveTo(Math.random() * 30, Math.random() * canvas.height);
      
      // 控制點
      const cp1x = canvas.width / 3 + Math.random() * 30;
      const cp1y = Math.random() * canvas.height;
      const cp2x = (canvas.width * 2) / 3 + Math.random() * 30;
      const cp2y = Math.random() * canvas.height;
      
      // 終點
      const endX = canvas.width - Math.random() * 30;
      const endY = Math.random() * canvas.height;
      
      // 繪製貝茲曲線
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      ctx.stroke();
    }
    
    // 將驗證碼圖片轉換為 Base64 格式
    const captchaImage = canvas.toDataURL('image/png');
    
    // 返回驗證碼ID和圖片
    return NextResponse.json({
      success: true,
      captchaId,
      captchaImage,
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