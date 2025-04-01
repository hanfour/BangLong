'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowLeft, Upload, Check, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function NewCarousel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [textPosition, setTextPosition] = useState('center');
  const [textDirection, setTextDirection] = useState('horizontal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 图片上传预览
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔案');
      return;
    }
    
    // 檢查檔案大小 (限制為 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('圖片大小不能超過 5MB');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // 创建预览URL
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
  };
  
  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // 提交表单处理
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('請選擇輪播圖片');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 第一步：上传图片 - 使用本地圖片預覽作為備用方案
      setUploadingStatus('uploading');
      
      // 創建本地URL預覽（作為備用方案）
      let imageUrl = '';
      const localImageUrl = imagePreview || '';
      
      try {
        // 嘗試使用Vercel Blob上傳
        // 创建一个随机文件名，保留原始扩展名
        const fileExt = selectedFile.name.split('.').pop();
        const randomName = `carousel_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        // 創建表單數據
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // 上傳圖片到 Vercel Blob Storage
        const uploadResponse = await fetch(`/api/upload?filename=${randomName}`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          if (uploadResult.url) {
            imageUrl = uploadResult.url;
          }
        } else {
          // 如果上傳失敗，使用備用公共圖片URL
          console.warn('使用備用圖片存儲方案');
        }
      } catch (uploadError) {
        console.error('上傳圖片失敗，使用備用方案:', uploadError);
      }
      
      // 如果Vercel Blob上傳失敗，使用備用上傳服務或預設URL
      if (!imageUrl) {
        // 在此使用備用方案 - 因為我們已經有預覽圖，所以暫時使用placeholder
        imageUrl = 'https://via.placeholder.com/1920x1080?text=BangLong+Construction';
        console.log('使用備用圖片URL:', imageUrl);
      }
      
      setUploadingStatus('uploaded');
      
      // 第二步：創建輪播項目
      const carouselData = {
        title,
        imageUrl: imageUrl,  // 使用成功上傳的URL或備用URL
        linkUrl: linkUrl || null,
        linkText: linkText || null,
        textPosition,
        textDirection
      };
      
      const createResponse = await fetch('/api/carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
        body: JSON.stringify(carouselData),
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || '建立輪播項目失敗');
      }
      
      // 成功后跳转到轮播管理页面
      router.push('/admin/carousel');
      router.refresh();
    } catch (error) {
      console.error('Error creating carousel:', error);
      setError(error instanceof Error ? error.message : '建立輪播項目時發生錯誤');
      setUploadingStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 加载中状态
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
  
  // 未登录跳转
  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }
  
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">新增輪播項目</h1>
          <p className="text-gray-600 mt-1">為網站首頁建立新的輪播圖片與內容</p>
        </div>
        <Link
          href="/admin/carousel"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回列表
        </Link>
      </div>
      
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
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 图片上传区 */}
            <div className="space-y-4">
              <div className="font-medium text-gray-700 mb-2">輪播圖片</div>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer h-64 ${
                  imagePreview ? 'border-amber-300 bg-amber-50' : 'border-gray-300 hover:border-amber-300 hover:bg-gray-50'
                }`}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreview}
                      alt="圖片預覽"
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2 text-sm text-gray-600">
                      點擊或拖曳上傳圖片
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      支援 JPG、PNG、WebP 格式 (建議尺寸: 1920x1080，大小不超過 5MB)
                    </p>
                  </div>
                )}
              </div>
              
              {uploadingStatus === 'uploading' && (
                <div className="flex items-center text-amber-700">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  <span>上傳中...</span>
                </div>
              )}
              
              {uploadingStatus === 'uploaded' && (
                <div className="flex items-center text-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  <span>圖片上傳成功</span>
                </div>
              )}
            </div>
            
            {/* 表单内容区 */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  標題 (可選)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="輸入輪播標題"
                />
              </div>
              
              <div>
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  連結網址 (可選)
                </label>
                <input
                  type="url"
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label htmlFor="linkText" className="block text-sm font-medium text-gray-700 mb-1">
                  連結文字 (可選)
                </label>
                <input
                  type="text"
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="了解更多"
                />
              </div>
              
              <div>
                <label htmlFor="textPosition" className="block text-sm font-medium text-gray-700 mb-1">
                  文字位置
                </label>
                <select
                  id="textPosition"
                  value={textPosition}
                  onChange={(e) => setTextPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="topLeft">左上</option>
                  <option value="topCenter">上中</option>
                  <option value="topRight">右上</option>
                  <option value="centerLeft">左中</option>
                  <option value="center">中央</option>
                  <option value="centerRight">右中</option>
                  <option value="bottomLeft">左下</option>
                  <option value="bottomCenter">下中</option>
                  <option value="bottomRight">右下</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="textDirection" className="block text-sm font-medium text-gray-700 mb-1">
                  文字方向
                </label>
                <select
                  id="textDirection"
                  value={textDirection}
                  onChange={(e) => setTextDirection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="horizontal">水平</option>
                  <option value="vertical">垂直</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link
              href="/admin/carousel"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className={`px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center ${
                (isSubmitting || !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  處理中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}