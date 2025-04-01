'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowLeft, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Carousel } from '@/types/global';

export default function CarouselDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (status === 'authenticated') {
      fetchCarousel();
    }
  }, [status, router, id]);

  const fetchCarousel = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/carousel/${id}`, {
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('輪播項目不存在');
        }
        throw new Error('無法獲取輪播項目資料');
      }
      
      const data = await response.json();
      setCarousel(data.carouselItem);
    } catch (error) {
      console.error('Error fetching carousel:', error);
      setError(error instanceof Error ? error.message : '發生錯誤，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/carousel/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('刪除輪播項目失敗');
      }
      
      router.push('/admin/carousel');
    } catch (error) {
      console.error('Error deleting carousel:', error);
      setError(error instanceof Error ? error.message : '刪除輪播項目時發生錯誤');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const translatePosition = (position: string): string => {
    const positionMap: Record<string, string> = {
      topLeft: '左上',
      topCenter: '上中',
      topRight: '右上',
      centerLeft: '左中',
      center: '中央',
      centerRight: '右中',
      bottomLeft: '左下',
      bottomCenter: '下中',
      bottomRight: '右下'
    };
    
    return positionMap[position] || position;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-800 mx-auto" />
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">輪播項目詳情</h1>
          </div>
          <Link
            href="/admin/carousel"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回列表
          </Link>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!carousel) {
    return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">輪播項目詳情</h1>
          </div>
          <Link
            href="/admin/carousel"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回列表
          </Link>
        </div>
        
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">無法找到輪播項目</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">輪播項目詳情</h1>
          <p className="text-gray-600 mt-1">查看輪播項目的詳細資訊</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/carousel"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回列表
          </Link>
          <Link
            href={`/admin/carousel/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Edit2 className="w-5 h-5 mr-2" />
            編輯
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            刪除
          </button>
        </div>
      </div>
      
      <div className="bg-white p-8 shadow rounded-lg overflow-hidden">
        <div className="relative h-96 w-full">
          <Image 
            src={carousel.imageUrl} 
            alt={carousel.title || '輪播圖片'} 
            fill
            className="object-contain"
          />
        </div>
        
        <div className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">基本資訊</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">標題</h3>
                  <p className="mt-1 text-gray-900">{carousel.title || '（無標題）'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">排序</h3>
                  <p className="mt-1 text-gray-900">{carousel.order}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">狀態</h3>
                  <div className="mt-1 flex items-center">
                    {carousel.isActive ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-700">啟用中</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-500">已停用</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">創建時間</h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(carousel.createdAt).toLocaleString('zh-TW')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">最後更新</h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(carousel.updatedAt).toLocaleString('zh-TW')}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">顯示設定</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">文字位置</h3>
                  <p className="mt-1 text-gray-900">{translatePosition(carousel.textPosition)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">文字方向</h3>
                  <p className="mt-1 text-gray-900">
                    {carousel.textDirection === 'horizontal' ? '水平' : '垂直'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">連結網址</h3>
                  {carousel.linkUrl ? (
                    <a 
                      href={carousel.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:underline break-all"
                    >
                      {carousel.linkUrl}
                    </a>
                  ) : (
                    <p className="mt-1 text-gray-500">（無連結）</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">連結文字</h3>
                  {carousel.linkText ? (
                    <p className="mt-1 text-gray-900">{carousel.linkText}</p>
                  ) : (
                    <p className="mt-1 text-gray-500">（無連結文字）</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">圖片網址</h3>
                  <p className="mt-1 text-gray-500 break-all text-xs">
                    {carousel.imageUrl}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 刪除確認彈窗 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">確認刪除</h3>
            <p className="text-gray-600 mb-6">您確定要刪除這個輪播項目嗎？此操作無法撤銷。</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    刪除中...
                  </>
                ) : (
                  <>刪除</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}