'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, X, Plus, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import { Project, ProjectDetailItem, ProjectImage } from '@/types/global';

type FormData = {
  title: string;
  description: string;
  category: 'new' | 'classic' | 'future';
  images: ProjectImage[];
  detailItems: ProjectDetailItem[];
  isActive: boolean;
};

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = React.use(params);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'new',
    images: [],
    detailItems: [{ label: '', value: '' }],
    isActive: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [originalProject, setOriginalProject] = useState<Project | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (status === 'authenticated') {
      fetchProjectData();
    }
  }, [status, router, id]);

  // 成功提示自動消失
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchProjectData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '獲取專案失敗');
      }

      const project = data.project;
      setOriginalProject(project);
      
      // 測試 project.details 的類型並設置默認值
      const detailItems = project.details?.items || [];
      const images = project.images || [];
      
      setFormData({
        title: project.title,
        description: project.description || '',
        category: project.category,
        images: images,
        detailItems: detailItems.length > 0 ? detailItems : [{ label: '', value: '' }],
        isActive: project.isActive
      });
    } catch (error) {
      console.error('獲取專案失敗:', error);
      setError('獲取專案失敗，請重新整理頁面或稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

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


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // 處理表單驗證
    if (!formData.title.trim()) {
      setError('請輸入專案標題');
      setIsSubmitting(false);
      return;
    }

    if (formData.images.length === 0) {
      setError('請至少上傳一張專案圖片');
      setIsSubmitting(false);
      return;
    }

    // 空的詳細信息將被移除
    const filteredDetailItems = formData.detailItems.filter(item =>
      item.label.trim() !== '' || item.value.trim() !== ''
    );

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          images: formData.images,
          details: {
            items: filteredDetailItems
          },
          isActive: formData.isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新專案失敗');
      }

      setSuccessMessage('專案更新成功');
      // 清除錯誤訊息
      setError(null);
      // 專案更新成功後重新擷取數據
      setOriginalProject(data.project);
    } catch (error) {
      console.error('更新專案失敗:', error);
      setError('更新專案失敗，請稍後再試');
      setSuccessMessage(null);
    } finally {
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

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">編輯專案</h1>
          <p className="text-gray-600 mt-1">
            編輯「{formData.title}」，類別：{getCategoryName(formData.category)}
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Link
            href={`/admin/projects?category=${formData.category}`}
            className="text-amber-800 hover:text-amber-900"
          >
            返回專案列表
          </Link>
        </div>
      </div>

      {/* 成功提示 */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 animate-fade-in-out">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

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

              <ImageUploader
                images={formData.images}
                onImagesChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
              />

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
                href={`/admin/projects?category=${formData.category}`}
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
                  <span>更新專案</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
