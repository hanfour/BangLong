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
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('環境變數錯誤: 缺少 BLOB_READ_WRITE_TOKEN');
      return NextResponse.json(
        { error: 'Vercel Blob Storage 尚未設置，請聯絡管理員' }, 
        { status: 500 }
      );
    }

    // 上傳到 Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
    });

    if (!blob || !blob.url) {
      return NextResponse.json(
        { error: '檔案上傳成功但未獲得有效的URL' }, 
        { status: 500 }
      );
    }

    console.log('檔案上傳成功:', blob.url);
    return NextResponse.json(blob);
  } catch (error) {
    console.error('檔案上傳失敗:', error);
    
    // 提供更詳細的錯誤信息
    const errorMessage = error instanceof Error 
      ? `檔案上傳失敗: ${error.message}` 
      : '檔案上傳失敗，請確認 Vercel Blob Storage 設置正確';
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}