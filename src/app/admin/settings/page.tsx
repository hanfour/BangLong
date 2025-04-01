'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Settings, Mail, Search, AlertCircle, X, Check, Info, Upload, Image as ImageIcon, Bold, Italic, List, Link } from 'lucide-react';
import Image from 'next/image';

// 自定義簡易編輯器組件
function SimpleEditor({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const [htmlValue, setHtmlValue] = useState(value);
  
  // 當內部值更改時，通知父組件
  useEffect(() => {
    onChange(htmlValue);
  }, [htmlValue, onChange]);
  
  // 簡單的格式化功能
  const addFormat = (format: string) => {
    const textarea = document.getElementById('simple-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    let cursorPos = start;
    
    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        cursorPos = start + 8 + selectedText.length;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        cursorPos = start + 4 + selectedText.length;
        break;
      case 'list':
        formattedText = `<ul>\n  <li>${selectedText}</li>\n</ul>`;
        cursorPos = start + 9 + selectedText.length;
        break;
      case 'link':
        formattedText = `<a href="#">${selectedText}</a>`;
        cursorPos = start + 9 + selectedText.length;
        break;
      default:
        return;
    }
    
    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    setHtmlValue(newValue);
    
    // 重新設置選中區域
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 10);
  };
  
  return (
    <div className="simple-editor-container">
      <div className="bg-gray-100 p-2 border border-gray-300 border-b-0 rounded-t-md flex space-x-2">
        <button 
          type="button" 
          onClick={() => addFormat('bold')}
          className="p-1 hover:bg-gray-200 rounded"
          title="粗體"
        >
          <Bold size={16} />
        </button>
        <button 
          type="button" 
          onClick={() => addFormat('italic')}
          className="p-1 hover:bg-gray-200 rounded"
          title="斜體"
        >
          <Italic size={16} />
        </button>
        <button 
          type="button" 
          onClick={() => addFormat('list')}
          className="p-1 hover:bg-gray-200 rounded"
          title="列表"
        >
          <List size={16} />
        </button>
        <button 
          type="button" 
          onClick={() => addFormat('link')}
          className="p-1 hover:bg-gray-200 rounded"
          title="連結"
        >
          <Link size={16} />
        </button>
      </div>
      <textarea
        id="simple-editor"
        value={htmlValue}
        onChange={(e) => setHtmlValue(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
        rows={6}
        placeholder="您有新的客戶諮詢: {{name}} ({{email}}) {{phone}} 訊息: {{message}}"
      />
    </div>
  );
}

import AdminLayout from '@/components/admin/AdminLayout';

type SettingGroup = {
  [key: string]: string | string[] | null;
};

type AllSettings = {
  [type: string]: SettingGroup;
};

export default function SiteSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('seo');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingStatus, setUploadingStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AllSettings>({
    seo: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
      ogTitle: '',
      ogDescription: '',
    },
    email: {
      receivers: '',
      notificationTemplate: '',
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('無法獲取網站設定');
      }
      
      const data = await response.json();
      
      // 初始化默認設定
      const defaultSettings: AllSettings = {
        seo: {
          title: '邦隆建設 - 匠心建築，豪宅典範',
          description: '邦隆建設專注於高品質住宅建築，以匠心精神打造台灣頂級豪宅，創造永續價值的居住空間。',
          keywords: '邦隆建設,豪宅,建案,高級住宅,台灣建設公司',
          ogImage: '',
          ogTitle: '',
          ogDescription: '',
        },
        email: {
          receivers: '',
          notificationTemplate: '您有新的客戶諮詢: {{name}} ({{email}}) {{phone}} 訊息: {{message}}',
        }
      };
      
      // 合併已存在的設定與默認設定
      const mergedSettings = { ...defaultSettings };
      
      if (data.settings) {
        Object.keys(data.settings).forEach(type => {
          if (mergedSettings[type]) {
            mergedSettings[type] = {
              ...mergedSettings[type],
              ...data.settings[type]
            };
          } else {
            mergedSettings[type] = data.settings[type];
          }
        });
      }
      
      setSettings(mergedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(error instanceof Error ? error.message : '發生錯誤，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (type: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value
      }
    }));
  };
  
  // 图片上传预览
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  // 上传图片
  const handleUploadImage = async () => {
    if (!selectedFile) {
      setError('請選擇要上傳的圖片');
      return;
    }
    
    setUploadingStatus('uploading');
    setError(null);
    
    try {
      // 创建一个随机文件名，保留原始扩展名
      const fileExt = selectedFile.name.split('.').pop();
      const randomName = `ogImage_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // 创建表单数据
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // 上传图片
      const uploadResponse = await fetch(`/api/upload?filename=${randomName}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || '圖片上傳失敗');
      }
      
      const uploadResult = await uploadResponse.json();
      setUploadingStatus('uploaded');
      
      if (!uploadResult.url) {
        throw new Error('圖片上傳失敗，未獲得URL');
      }
      
      // 设置OG图片URL
      handleInputChange('seo', 'ogImage', uploadResult.url);
      
      setSuccess('圖片上傳成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : '上傳圖片時發生錯誤');
      setUploadingStatus('error');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const settingsToSave = [];
      
      // 將設定轉換為數組格式以批量保存
      for (const type in settings) {
        for (const key in settings[type]) {
          settingsToSave.push({
            type,
            key,
            value: settings[type][key],
            description: getSettingDescription(type, key)
          });
        }
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToSave }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存設定失敗');
      }
      
      setSuccess('網站設定已成功保存');
      
      // 3秒後自動清除成功訊息
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error instanceof Error ? error.message : '保存設定時發生錯誤');
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingDescription = (type: string, key: string): string => {
    const descriptions: { [type: string]: { [key: string]: string } } = {
      seo: {
        title: '網站標題',
        description: '網站描述（通常顯示在搜索結果中）',
        keywords: '網站關鍵字（以逗號分隔）',
        ogImage: 'Open Graph 圖片URL',
        ogTitle: 'Open Graph 標題（留空則使用網站標題）',
        ogDescription: 'Open Graph 描述（留空則使用網站描述）'
      },
      email: {
        receivers: '通知信收件者（多個郵箱以逗號分隔）',
        notificationTemplate: '通知郵件模板（支持 {{name}}, {{email}}, {{phone}}, {{message}} 變量）'
      }
    };
    
    return descriptions[type]?.[key] || '';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">網站設定</h1>
          <p className="text-gray-600 mt-1">管理網站的基本設置和配置</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className={`px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              儲存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              保存設定
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* 設定分頁標籤 */}
        <div className="flex border-b">
          <button
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'seo' 
                ? 'text-amber-700 border-b-2 border-amber-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('seo')}
          >
            <div className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              SEO 設定
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'email' 
                ? 'text-amber-700 border-b-2 border-amber-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('email')}
          >
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              郵件設定
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'advanced' 
                ? 'text-amber-700 border-b-2 border-amber-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('advanced')}
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              進階設定
            </div>
          </button>
        </div>
        
        {/* SEO 設定表單 */}
        {activeTab === 'seo' && (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">SEO 基本設定</h2>
                <div className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  搜尋引擎最佳化
                </div>
              </div>
              <p className="text-gray-600 text-sm">這些設定會影響網站在搜尋引擎中的顯示方式</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-1">
                  網站標題 <span className="text-red-500">*</span>
                </label>
                <input
                  id="seo_title"
                  type="text"
                  value={settings.seo.title as string}
                  onChange={(e) => handleInputChange('seo', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="邦隆建設 - 匠心建築，豪宅典範"
                />
                <p className="mt-1 text-sm text-gray-500">顯示在瀏覽器標籤和搜尋結果中的標題</p>
              </div>
              
              <div>
                <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-1">
                  網站描述
                </label>
                <textarea
                  id="seo_description"
                  value={settings.seo.description as string}
                  onChange={(e) => handleInputChange('seo', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="邦隆建設專注於高品質住宅建築，以匠心精神打造台灣頂級豪宅，創造永續價值的居住空間。"
                />
                <p className="mt-1 text-sm text-gray-500">通常顯示在搜索結果中的網站簡介</p>
              </div>
              
              <div>
                <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                  關鍵字
                </label>
                <input
                  id="seo_keywords"
                  type="text"
                  value={settings.seo.keywords as string}
                  onChange={(e) => handleInputChange('seo', 'keywords', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="邦隆建設,豪宅,建案,高級住宅,台灣建設公司"
                />
                <p className="mt-1 text-sm text-gray-500">以逗號分隔的關鍵字列表</p>
              </div>
            </div>
            
            <div className="mt-8 mb-6">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">社交媒體分享設定 (Open Graph)</h2>
                <div className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  社交媒體
                </div>
              </div>
              <p className="text-gray-600 text-sm">當網站被分享到社交媒體平台時的顯示內容設定</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="og_image" className="block text-sm font-medium text-gray-700 mb-1">
                  社交媒體圖片
                </label>
                
                <div className="flex gap-4 items-start">
                  <div className="flex-grow">
                    <input
                      id="og_image"
                      type="text"
                      value={settings.seo.ogImage as string}
                      onChange={(e) => handleInputChange('seo', 'ogImage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://www.example.com/images/og-image.jpg"
                    />
                    <p className="mt-1 text-sm text-gray-500">分享時顯示的預覽圖片（建議尺寸 1200x630 像素）</p>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      選擇檔案
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={!selectedFile || uploadingStatus === 'uploading'}
                      className={`flex items-center px-4 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800 transition-colors ${
                        !selectedFile || uploadingStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingStatus === 'uploading' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          上傳中...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          上傳圖片
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* 圖片預覽 */}
                {(imagePreview || settings.seo.ogImage) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">圖片預覽：</p>
                    <div className="relative w-full max-w-md h-48 border rounded overflow-hidden">
                      <Image
                        src={imagePreview || settings.seo.ogImage as string}
                        alt="Open Graph 圖片預覽"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {uploadingStatus === 'uploaded' && (
                      <div className="mt-2 flex items-center text-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm">上傳成功！</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="og_title" className="block text-sm font-medium text-gray-700 mb-1">
                  社交媒體標題
                </label>
                <input
                  id="og_title"
                  type="text"
                  value={settings.seo.ogTitle as string}
                  onChange={(e) => handleInputChange('seo', 'ogTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="留空則使用網站標題"
                />
                <p className="mt-1 text-sm text-gray-500">分享時顯示的標題（留空則使用網站標題）</p>
              </div>
              
              <div>
                <label htmlFor="og_description" className="block text-sm font-medium text-gray-700 mb-1">
                  社交媒體描述
                </label>
                <textarea
                  id="og_description"
                  value={settings.seo.ogDescription as string}
                  onChange={(e) => handleInputChange('seo', 'ogDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="留空則使用網站描述"
                />
                <p className="mt-1 text-sm text-gray-500">分享時顯示的描述（留空則使用網站描述）</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 郵件設定表單 */}
        {activeTab === 'email' && (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">郵件通知設定</h2>
                <div className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                  客戶諮詢通知
                </div>
              </div>
              <p className="text-gray-600 text-sm">網站接收到客戶諮詢時的通知郵件設定</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="email_receivers" className="block text-sm font-medium text-gray-700 mb-1">
                  通知信收件者 <span className="text-red-500">*</span>
                </label>
                <input
                  id="email_receivers"
                  type="text"
                  value={settings.email.receivers as string}
                  onChange={(e) => handleInputChange('email', 'receivers', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="admin@example.com, sales@example.com"
                />
                <p className="mt-1 text-sm text-gray-500">接收通知郵件的電子郵箱，多個收件者請用逗號分隔</p>
              </div>
              
              <div>
                <label htmlFor="email_template" className="block text-sm font-medium text-gray-700 mb-1">
                  通知信模板
                </label>
                
                <SimpleEditor 
                  value={settings.email.notificationTemplate as string} 
                  onChange={(content) => handleInputChange('email', 'notificationTemplate', content)}
                />
                
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">模板預覽：</h4>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: settings.email.notificationTemplate as string }}
                  />
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>支持以下變數:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li><code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> - 客戶姓名</li>
                    <li><code className="bg-gray-100 px-1 rounded">{'{{email}}'}</code> - 客戶郵箱</li>
                    <li><code className="bg-gray-100 px-1 rounded">{'{{phone}}'}</code> - 客戶電話</li>
                    <li><code className="bg-gray-100 px-1 rounded">{'{{message}}'}</code> - 諮詢內容</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">郵件通知由 API Gateway 發送，確保網站運行平滑流暢。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 進階設定 */}
        {activeTab === 'advanced' && (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">進階系統設定</h2>
                <div className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  開發者選項
                </div>
              </div>
              <p className="text-gray-600 text-sm">這些設定影響系統的運行方式，請謹慎修改</p>
            </div>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    進階設定是為系統管理員與技術人員設計的功能。錯誤的設定可能會影響網站的運行，若非必要請勿修改。
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-center text-gray-500 my-6">目前無可用的進階設定選項</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}