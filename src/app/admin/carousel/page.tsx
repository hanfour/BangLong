'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AdminHelp from '@/components/admin/AdminHelp';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, PlusCircle, Edit2, Trash2, Eye, X, MoveUp, MoveDown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Carousel } from '@/types/global';

export default function CarouselManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [carouselItems, setCarouselItems] = useState<Carousel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (status === 'authenticated') {
      fetchCarouselItems();
    }
  }, [status, router]);

  const fetchCarouselItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/carousel/admin', {
        headers: {
          'Content-Type': 'application/json',
          // 確保傳遞身份驗證信息
          'Cache-Control': 'no-cache'
        },
        credentials: 'include' // 確保包含 cookies 以傳遞身份
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('身份驗證失敗，請重新登入');
        }
        throw new Error('Failed to fetch carousel items');
      }
      
      const data = await response.json();
      setCarouselItems(data.carouselItems);
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      setError(error instanceof Error ? error.message : '無法獲取輪播項目，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/carousel/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete carousel item');
      }
      
      // 重新獲取列表
      await fetchCarouselItems();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting carousel item:', error);
      setError('刪除輪播項目失敗');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/carousel/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, direction }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder carousel items');
      }
      
      // 重新獲取列表
      await fetchCarouselItems();
    } catch (error) {
      console.error('Error reordering carousel items:', error);
      setError('調整順序失敗');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/carousel/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update carousel item');
      }
      
      // 重新獲取列表
      await fetchCarouselItems();
    } catch (error) {
      console.error('Error updating carousel item:', error);
      setError('更新輪播項目狀態失敗');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-800 mx-auto" />
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">首頁輪播管理</h1>
          <p className="text-gray-600 mt-1">管理網站首頁的輪播內容與顯示順序</p>
        </div>
        <Link
          href="/admin/carousel/new"
          className="inline-flex items-center px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          新增輪播
        </Link>
      </div>

      <AdminHelp
        content={`【操作說明】
1. 點擊「新增輪播」按鈕，填寫標題、連結、上傳圖片，儲存後即加入首頁輪播。
2. 點擊輪播右側「編輯」圖示可修改內容。
3. 點擊「刪除」圖示可刪除輪播圖。
4. 使用上下箭頭調整輪播圖顯示順序。
5. 點擊「啟用中/已停用」切換輪播圖顯示狀態。
`}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
          <span className="ml-2 text-gray-600">載入數據中...</span>
        </div>
      ) : carouselItems.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">尚無輪播項目</p>
          <Link
            href="/admin/carousel/new"
            className="inline-flex items-center px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            新增第一個輪播
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  圖片
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  標題/連結
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文字位置/方向
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  順序
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carouselItems.map((item) => (
                <tr key={item.id} className={!item.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative w-24 h-16 rounded overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.title || '輪播圖片'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.title || '(無標題)'}</div>
                    {item.linkUrl && (
                      <div className="text-sm text-gray-500">
                        連結: {item.linkUrl}
                        {item.linkText && <span> ({item.linkText})</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">位置:</span> {translatePosition(item.textPosition)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">方向:</span> {item.textDirection === 'horizontal' ? '水平' : '垂直'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{item.order}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleReorder(item.id, 'up')}
                          className="text-gray-500 hover:text-amber-700 focus:outline-none"
                          title="上移"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReorder(item.id, 'down')}
                          className="text-gray-500 hover:text-amber-700 focus:outline-none"
                          title="下移"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {item.isActive ? '啟用中' : '已停用'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/carousel/${item.id}`}
                        className="text-amber-600 hover:text-amber-900"
                        title="查看"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/carousel/${item.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="編輯"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title="刪除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 刪除確認彈窗 */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">確認刪除</h3>
            <p className="text-gray-600 mb-6">您確定要刪除這個輪播項目嗎？此操作無法撤銷。</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
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

function translatePosition(position: string): string {
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
}
