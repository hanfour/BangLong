import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: '未授權的請求' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  
  if (!filename) {
    return NextResponse.json({ error: '缺少檔案名稱' }, { status: 400 });
  }
  
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: '缺少檔案' }, { status: 400 });
  }

  try {
    // 檢查環境變數
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('環境變數錯誤: 缺少 BLOB_READ_WRITE_TOKEN');
      
      // 返回臨時解決方案的URL - 提示前端使用備用存儲選項
      return NextResponse.json({
        url: null,
        error: 'Vercel Blob Storage 尚未設置，使用備用存儲',
        fallback: true
      });
    }

    // 嘗試上傳到 Vercel Blob Storage
    try {
      const blob = await put(filename, file, {
        access: 'public',
      });

      if (!blob || !blob.url) {
        throw new Error('未獲得有效的URL');
      }

      console.log('檔案上傳成功:', blob.url);
      return NextResponse.json(blob);
    } catch (blobError) {
      // Blob 存儲特定錯誤處理
      console.error('Vercel Blob 上傳失敗:', blobError);
      
      // 返回臨時解決方案的URL - 提示前端使用備用存儲選項
      return NextResponse.json({
        url: null,
        error: blobError instanceof Error ? blobError.message : '上傳失敗',
        fallback: true
      });
    }
  } catch (error) {
    console.error('檔案上傳處理失敗:', error);
    
    // 提供更詳細的錯誤信息
    const errorMessage = error instanceof Error 
      ? `檔案上傳失敗: ${error.message}` 
      : '檔案上傳失敗，請稍後再試';
    
    return NextResponse.json({
      url: null,
      error: errorMessage,
      fallback: true
    });
  }
}