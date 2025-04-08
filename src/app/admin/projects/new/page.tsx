'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, X, Plus, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ProjectDetailItem } from '@/types/global';

type FormData = {
  title: string;
  description: string;
  category: 'new' | 'classic' | 'future';
  imageUrl: string;
  detailItems: ProjectDetailItem[];
  isActive: boolean;
};

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as 'new' | 'classic' | 'future' | null;
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: categoryParam || 'new',
    imageUrl: '',
    detailItems: [{ label: '', value: '' }],
    isActive: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // 更新類別
  useEffect(() => {
    if (categoryParam) {
      setFormData(prev => ({ ...prev, category: categoryParam }));
    }
  }, [categoryParam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDetailItemChange = (index: number, field: 'label' | 'value', value: string) => {
    const updatedItems = [...formData.detailItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, detailItems: updatedItems }));
  };

  const addDetailItem = () => {
    setFormData(prev => ({
      ...prev,
      detailItems: [...prev.detailItems, { label: '', value: '' }]
    }));
  };

  const removeDetailItem = (index: number) => {
    const updatedItems = [...formData.detailItems];
    updatedItems.splice(index, 1);
    setFormData(prev => ({ ...prev, detailItems: updatedItems }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError('請上傳 JPG、PNG 或 WebP 格式的圖片');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('圖片大小不能超過 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      setImageUploadError(null);

      // 生成唯一的檔案名稱
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const safeFileName = `project-image-${timestamp}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'projects');

      // 添加檔案名稱作為 URL 參數
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(safeFileName)}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上傳圖片失敗');
      }

      // 使用 Vercel Blob 返回的 URL
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setImagePreview(data.url);
    } catch (error) {
      console.error('上傳圖片失敗:', error);
      setImageUploadError('上傳圖片失敗，請稍後再試');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 處理表單驗證
    if (!formData.title.trim()) {
      setError('請輸入專案標題');
      setIsSubmitting(false);
      return;
    }

    if (!formData.imageUrl) {
      setError('請上傳專案圖片');
      setIsSubmitting(false);
      return;
    }

    // 空的詳細信息將被移除
    const filteredDetailItems = formData.detailItems.filter(item => 
      item.label.trim() !== '' || item.value.trim() !== ''
    );

    try {
      const response = await fetch('/api/projects/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          imageUrl: formData.imageUrl,
          details: { 
            items: filteredDetailItems
          },
          isActive: formData.isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '創建專案失敗');
      }

      // 成功後導向到專案列表
      router.push(`/admin/projects?category=${formData.category}`);
    } catch (error) {
      console.error('創建專案失敗:', error);
      setError('創建專案失敗，請稍後再試');
      setIsSubmitting(false);
    }
  };

  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'new': return '新案鑑賞';
      case 'classic': return '歷年經典';
      case 'future': return '未來計畫';
      default: return '全部專案';
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
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">新增專案</h1>
          <p className="text-gray-600 mt-1">
            新增一個「{getCategoryName(formData.category)}」專案
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Link
            href={`/admin/projects${formData.category ? `?category=${formData.category}` : ''}`}
            className="text-amber-800 hover:text-amber-900"
          >
            返回專案列表
          </Link>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側基本信息 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  專案標題 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  專案類別 <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="new">新案鑑賞</option>
                  <option value="classic">歷年經典</option>
                  <option value="future">未來計畫</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  專案描述
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  專案圖片 <span className="text-red-500">*</span>
                </label>
                <div className="border border-dashed border-gray-300 rounded-md p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      {imagePreview ? (
                        <div className="relative w-full max-w-md h-40">
                          <Image
                            src={imagePreview}
                            alt="Project preview"
                            fill
                            className="object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, imageUrl: '' }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-amber-800 rounded-md shadow-sm tracking-wide cursor-pointer hover:bg-amber-50 border border-amber-800">
                          <span className="mt-2 text-base leading-normal">選擇圖片</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                          />
                        </label>
                      )}
                    </div>
                    {isUploadingImage && (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-800" />
                        <span className="ml-2 text-sm text-gray-500">上傳中...</span>
                      </div>
                    )}
                    {imageUploadError && (
                      <p className="text-red-600 text-sm">{imageUploadError}</p>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      支援 JPG、PNG 和 WebP 格式的圖片，最大大小 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-amber-800 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  啟用專案（前台顯示）
                </label>
              </div>
            </div>

            {/* 右側詳細信息 */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  專案詳細資訊
                </label>
                <div className="space-y-4">
                  {formData.detailItems.map((item, index) => (
                    <div key={index} className="flex space-x-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="標籤（例：基地面積）"
                          value={item.label}
                          onChange={(e) => handleDetailItemChange(index, 'label', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="內容（例：1000坊）"
                          value={item.value}
                          onChange={(e) => handleDetailItemChange(index, 'value', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDetailItem(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="移除"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDetailItem}
                    className="mt-2 flex items-center text-amber-800 hover:text-amber-900"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span>新增詳細項目</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <Link
                href={`/admin/projects${formData.category ? `?category=${formData.category}` : ''}`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                取消
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>處理中...</span>
                  </>
                ) : (
                  <span>創建專案</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
