'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 檢查登入狀態
    if (status === 'authenticated') {
      // 已登入，重定向到儀表板
      router.push('/admin/dashboard');
    } else if (status === 'unauthenticated') {
      // 未登入，重定向到登入頁面
      router.push('/admin/login');
    }
    // 載入中狀態不進行重定向
  }, [status, router]);

  // 顯示載入中的畫面
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-800 mx-auto" />
        <p className="mt-4 text-gray-600">載入中...</p>
      </div>
    </div>
  );
}