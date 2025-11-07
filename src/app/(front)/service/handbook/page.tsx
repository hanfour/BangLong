'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/front/Breadcrumb';
import WelcomeMessage from '@/components/front/WelcomeMessage';
import HandbookCard from '@/components/front/HandbookCard';
import { HandbookPublic } from '@/types/handbook';
import { Loader2 } from 'lucide-react';

export default function HandbookPage() {
  const router = useRouter();
  const [handbooks, setHandbooks] = useState<HandbookPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHandbooks();
  }, []);

  const fetchHandbooks = async () => {
    try {
      const response = await fetch('/api/handbooks');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '無法載入交屋手冊');
      }

      setHandbooks(data.handbooks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法載入交屋手冊');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)] lg:min-h-[calc(100vh-220px)]">
      {/* 手機版麵包屑 */}
      <div className="lg:hidden w-full mb-4">
        <Breadcrumb
          parentTitle="尊榮售服"
          parentTitleEn="SERVICE"
          currentTitle="交屋手冊"
          parentPath="/service"
          parentIsClickable={false}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 桌面版麵包屑 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb
            parentTitle="尊榮售服"
            parentTitleEn="SERVICE"
            currentTitle="交屋手冊"
            parentPath="/service"
            parentIsClickable={false}
          />
        </div>

        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8 pb-12">
          <WelcomeMessage />

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
              <span className="ml-2 text-gray-600">載入交屋手冊...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <p className="text-red-500">{error}</p>
            </div>
          ) : handbooks.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <p className="text-gray-500">目前尚無交屋手冊</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
              {handbooks.map((handbook) => (
                <HandbookCard
                  key={handbook.id}
                  handbook={handbook}
                  onClick={() => router.push(`/service/handbook/${handbook.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
