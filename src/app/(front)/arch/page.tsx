'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ArchPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 頁面載入後立即重定向到首頁
    router.push('/');
  }, [router]);
  
  // 返回空白內容，因為頁面會立即重定向
  return null;
}