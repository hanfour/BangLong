'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Breadcrumb from '@/components/front/Breadcrumb';
import PasswordForm from '@/components/front/PasswordForm';
import FileList from '@/components/front/FileList';
import { HandbookPublic, HandbookFile } from '@/types/handbook';
import { Loader2 } from 'lucide-react';

export default function HandbookDetailPage() {
  const params = useParams();
  const handbookId = params.id as string;

  const [handbook, setHandbook] = useState<HandbookPublic | null>(null);
  const [files, setFiles] = useState<HandbookFile[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // 檢查 sessionStorage 是否已驗證
  useEffect(() => {
    const verified = sessionStorage.getItem(`handbook_${handbookId}_verified`);
    if (verified === 'true') {
      setIsVerified(true);
    }
    fetchHandbook();
  }, [handbookId]);

  // 如果已驗證,獲取文件列表
  useEffect(() => {
    if (isVerified) {
      fetchFiles();
    }
  }, [isVerified]);

  const fetchHandbook = async () => {
    try {
      const response = await fetch(`/api/handbooks/${handbookId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '無法載入手冊資訊');
      }

      setHandbook(data.handbook);
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法載入手冊資訊');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/handbooks/${handbookId}/files`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '無法載入文件列表');
      }

      setFiles(data.files || []);
    } catch (err) {
      console.error('載入文件列表失敗:', err);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const response = await fetch(`/api/handbooks/${handbookId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        sessionStorage.setItem(`handbook_${handbookId}_verified`, 'true');
      } else {
        setError('密碼錯誤,請重新輸入');
      }
    } catch (err) {
      setError('驗證失敗,請稍後再試');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async (fileId: string, fileUrl: string) => {
    try {
      // 記錄下載次數
      await fetch(`/api/handbooks/${handbookId}/files/${fileId}/download`, {
        method: 'POST',
      });

      // 開啟下載
      window.open(fileUrl, '_blank');
    } catch (err) {
      console.error('下載失敗:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
      </div>
    );
  }

  if (error && !handbook) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/service/handbook" className="text-amber-800 hover:underline">
            返回手冊列表
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)]">
      {/* 麵包屑 */}
      <div className="lg:hidden w-full mb-4">
        <Breadcrumb
          parentTitle="交屋手冊"
          parentTitleEn="HANDBOOK"
          currentTitle={handbook?.title || ''}
          parentPath="/service/handbook"
          parentIsClickable={true}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        <div className="hidden lg:block mb-8">
          <Breadcrumb
            parentTitle="交屋手冊"
            parentTitleEn="HANDBOOK"
            currentTitle={handbook?.title || ''}
            parentPath="/service/handbook"
            parentIsClickable={true}
          />
        </div>

        {/* 內容區域 */}
        <div className="w-full lg:flex-1 lg:pl-8 pb-12">
          {handbook && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 左側：封面圖 + 資訊 */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="relative w-full pt-[142%] bg-gray-200 overflow-hidden">
                  <Image
                    src={handbook.coverImageUrl}
                    alt={handbook.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h1 className="text-xl lg:text-2xl font-bold mt-6 text-black">
                  {handbook.title}
                </h1>
                {handbook.description && (
                  <p className="text-gray-600 mt-2 text-sm">
                    {handbook.description}
                  </p>
                )}
                {handbook.project && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">所屬專案</p>
                    <p className="text-base text-black font-medium mt-1">
                      {handbook.project.title}
                    </p>
                  </div>
                )}
              </div>

              {/* 右側：密碼驗證或文件列表 */}
              <div className="flex-1">
                {!isVerified ? (
                  <div className="max-w-md">
                    <h2 className="text-lg font-semibold mb-4 text-black">
                      請輸入密碼查看文件
                    </h2>
                    <PasswordForm
                      password={password}
                      setPassword={setPassword}
                      onSubmit={handleVerify}
                      error={error}
                      isLoading={isVerifying}
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-black">
                      手冊文件列表
                    </h2>
                    <FileList files={files} onDownload={handleDownload} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
