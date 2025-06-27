'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminHelp from '@/components/admin/AdminHelp';
import { useRouter } from 'next/navigation';
import {
  Loader2, File, Plus, Pencil, Trash2, Search, Check, X,
  ArrowUpDown, Link, FileText, Download, Filter, Upload
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Document, Project } from '@/types/global';

export default function DocumentsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    imageUrl: '',
    fileType: '',
    category: 'handbook', // 預設交屋手冊
    projectId: '',
    isActive: true,
    order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // 檢查用戶是否已登錄
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [sessionStatus, router]);

  // 獲取文檔列表
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // 構建 URL 參數
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      
      const url = `/api/documents/admin?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API錯誤:', errorData);
        
        // 如果是架構錯誤，顯示更具體的錯誤訊息
        if (errorData.schemaError) {
          setError(`資料庫架構錯誤: ${errorData.details || errorData.error || '請聯繫管理員'}`);
        } else {
          throw new Error(errorData.details || errorData.error || '無法獲取文檔數據');
        }
        return;
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('獲取文檔數據失敗:', err);
      setError(err instanceof Error ? err.message : '獲取文檔數據失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取專案列表
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('無法獲取專案數據');
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('獲取專案數據失敗:', err);
      // 不顯示錯誤，因為這不是主要功能
    }
  };

  // 當組件加載時獲取數據
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchDocuments();
      fetchProjects();
    }
  }, [sessionStatus, categoryFilter]);

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError('');

      // 如果有文件要上傳，先上傳文件
      let finalFileUrl = formData.fileUrl;
      let finalImageUrl = formData.imageUrl;
      
      if (fileToUpload) {
        finalFileUrl = await uploadFile(fileToUpload, 'file');
      }
      
      if (imageToUpload) {
        finalImageUrl = await uploadFile(imageToUpload, 'image');
      }
      
      const method = currentDocument ? 'PATCH' : 'POST';
      const url = '/api/documents/admin';
      const body = {
        ...formData,
        fileUrl: finalFileUrl,
        imageUrl: finalImageUrl,
        ...(currentDocument && { id: currentDocument.id })
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details || errorData.error || (currentDocument ? '更新文檔失敗' : '創建文檔失敗');
        throw new Error(errorMessage);
      }
      
      // 成功後刷新列表
      fetchDocuments();
      handleCloseModal();
    } catch (err) {
      console.error('提交文檔失敗:', err);
      setError(err instanceof Error ? err.message : '提交文檔失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 上傳文件
  const uploadFile = async (file: File, type: 'file' | 'image') => {
    const isImg = type === 'image';
    
    if (isImg) {
      setIsImageUploading(true);
      setImageUploadProgress(0);
    } else {
      setIsUploading(true);
      setUploadProgress(0);
    }
    
    try {
      // 生成唯一的文件名
      const fileExt = file.name.split('.').pop();
      const randomName = Math.random().toString(36).substring(2, 15);
      const prefix = isImg ? 'document_image' : 'document';
      const filename = `${prefix}_${Date.now()}_${randomName}.${fileExt}`;
      
      // 創建 FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // 上傳到API
      const response = await fetch(`/api/upload?filename=${filename}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`${isImg ? '圖片' : '文件'}上傳失敗`);
      }
      
      const data = await response.json();
      
      // 檢查是否有回傳URL
      if (data.url) {
        return data.url;
      } else if (data.fallback) {
        // 處理無法使用 Vercel Blob Storage 的情況
        alert('Vercel Blob Storage 未設置，請手動提供URL');
        return prompt(`請輸入${isImg ? '圖片' : '文件'}URL`) || '';
      } else {
        throw new Error('未獲得有效的URL');
      }
    } catch (error) {
      console.error(`${isImg ? '圖片' : '文件'}上傳失敗:`, error);
      setError(`${isImg ? '圖片' : '文件'}上傳失敗，請重試`);
      return ''; // 返回空URL
    } finally {
      if (isImg) {
        setIsImageUploading(false);
        setImageUploadProgress(100);
      } else {
        setIsUploading(false);
        setUploadProgress(100);
      }
    }
  };

  // 處理檔案選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
      
      // 自動設置檔案類型
      const fileName = e.target.files[0].name;
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
      setFormData({
        ...formData,
        fileType: fileExt
      });
    }
  };
  
  // 處理圖片選擇
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageToUpload(e.target.files[0]);
    }
  };

  // 刪除文檔
  const handleDelete = async () => {
    if (!currentDocument) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/documents/admin?id=${currentDocument.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('刪除文檔失敗');
      }
      
      // 成功後刷新列表
      fetchDocuments();
      setShowDeleteModal(false);
      setCurrentDocument(null);
    } catch (err) {
      console.error('刪除文檔失敗:', err);
      setError('刪除文檔失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 開啟新增或編輯模態框
  const handleOpenModal = (document?: Document) => {
    if (document) {
      setCurrentDocument(document);
      setFormData({
        title: document.title,
        description: document.description || '',
        fileUrl: document.fileUrl,
        imageUrl: document.imageUrl || '',
        fileType: document.fileType,
        category: document.category,
        projectId: document.projectId || '',
        isActive: document.isActive,
        order: document.order
      });
    } else {
      setCurrentDocument(null);
      setFormData({
        title: '',
        description: '',
        fileUrl: '',
        imageUrl: '',
        fileType: '',
        category: 'handbook',
        projectId: '',
        isActive: true,
        order: documents.length + 1
      });
    }
    
    setFileToUpload(null);
    setImageToUpload(null);
    setShowModal(true);
  };

  // 關閉模態框
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDocument(null);
    setFileToUpload(null);
    setImageToUpload(null);
    setError('');
  };

  // 確認刪除模態框
  const handleConfirmDelete = (document: Document) => {
    setCurrentDocument(document);
    setShowDeleteModal(true);
  };

  // 獲取文檔類型圖標
  const getFileTypeIcon = (fileType: string) => {
    const lowerType = fileType.toLowerCase();
    
    if (['pdf'].includes(lowerType)) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (['doc', 'docx'].includes(lowerType)) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (['xls', 'xlsx'].includes(lowerType)) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(lowerType)) {
      return <FileText className="h-5 w-5 text-purple-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // 獲取類別中文名稱
  const getCategoryName = (category: string) => {
    switch(category) {
      case 'handbook': return '交屋手冊';
      // case 'process': return '售服流程';
      // case 'manual': return '使用說明';
      // case 'warranty': return '保固資訊';
      default: return category;
    }
  };

  // 獲取文件大小的估算值
  const getFileSize = (url: string) => {
    // 假設大小，實際上需要從伺服器獲取
    return '未知大小';
  };

  // 過濾文檔
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm 
      ? doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    return matchesSearch;
  });

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    return null; // 重定向處理
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <File className="mr-2 h-6 w-6" />
          文檔管理
        </h1>
        <p className="text-gray-600 mt-1">管理交屋手冊、說明文件等</p>
      </div>

      <AdminHelp
        content={`【操作說明】
1. 點擊「新增文檔」按鈕，填寫標題、描述，選擇類別，關聯專案，並上傳檔案與封面圖片。
2. 支援上傳檔案或直接輸入檔案/圖片 URL。
3. 點擊文檔右側「編輯」圖示可修改內容。
4. 點擊「刪除」圖示可刪除文檔。
5. 可使用搜尋與類別篩選快速查找文件。
`}
      />

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('數據庫') && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 font-medium">可能的解決方案：</p>
                  <ol className="list-decimal pl-5 text-sm text-gray-600 mt-1">
                    <li>請確保已執行 Prisma 遷移：<code className="bg-gray-100 px-1 py-0.5 rounded">npx prisma migrate deploy</code></li>
                    <li>或執行自動修復腳本：<code className="bg-gray-100 px-1 py-0.5 rounded">node scripts/fix-schema.js</code></li>
                    <li>如果問題仍然存在，請聯絡開發人員。</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 工具欄 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            {/* 搜索欄 */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="搜索文檔標題或描述..."
              />
            </div>
            
            {/* 類別篩選器 */}
            <div className="inline-flex">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">所有類別</option>
                <option value="handbook">交屋手冊</option>
                {/* <option value="process">售服流程</option> */}
                {/* <option value="manual">使用說明</option> */}
                {/* <option value="warranty">保固資訊</option> */}
              </select>
              
              <button
                onClick={() => fetchDocuments()}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-amber-300 focus:shadow-outline-amber active:text-gray-800 active:bg-gray-50"
                title="刷新數據"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleOpenModal()}
                className="ml-2 inline-flex items-center px-3 py-2 border border-amber-800 rounded-md bg-amber-800 text-sm leading-5 font-medium text-white hover:bg-amber-700 focus:outline-none focus:border-amber-900 focus:shadow-outline-amber active:bg-amber-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                新增文檔
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 文檔列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-800" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <File className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">暫無文檔</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-amber-800 rounded-md bg-amber-800 text-sm font-medium text-white hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              新增第一個文檔
            </button>
          </div>
        ) : (
          <div className="min-w-full divide-y divide-gray-200">
            <div className="bg-gray-50">
              <div className="grid grid-cols-12 gap-2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 flex items-center">編號</div>
                <div className="col-span-1 flex items-center">圖片</div>
                <div className="col-span-2 flex items-center">標題</div>
                <div className="col-span-2 flex items-center">類別</div>
                <div className="col-span-2 flex items-center">檔案類型</div>
                <div className="col-span-2 flex items-center">專案</div>
                <div className="col-span-1 flex items-center">狀態</div>
                <div className="col-span-1 flex items-center justify-end">操作</div>
              </div>
            </div>
            <div className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document, index) => (
                <div key={document.id} className="grid grid-cols-12 gap-2 px-6 py-4 text-sm text-gray-500 hover:bg-gray-50">
                  <div className="col-span-1 flex items-center">
                    {document.order}
                  </div>
                  <div className="col-span-1 flex items-center">
                    {(() => {
                      const imageUrl = document.imageUrl || (document.project?.images?.[0]?.imageUrl);
                      if (imageUrl) {
                        return (
                          <img
                            src={imageUrl}
                            alt={document.title}
                            className="h-10 w-10 object-cover rounded"
                            title={document.imageUrl ? "文檔封面" : `專案圖片: ${document.project?.title}`}
                          />
                        );
                      }
                      return (
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                          {getFileTypeIcon(document.fileType)}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{document.title}</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {getCategoryName(document.category)}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {document.fileType.toUpperCase()}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">{getFileSize(document.fileUrl)}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {document.project ? document.project.title : '未關聯專案'}
                  </div>
                  <div className="col-span-1 flex items-center">
                    {document.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        啟用
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        停用
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenModal(document)}
                      className="text-amber-600 hover:text-amber-900"
                      title="編輯"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900"
                      title="下載"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleConfirmDelete(document)}
                      className="text-red-600 hover:text-red-900"
                      title="刪除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 新增/編輯文檔模態框 */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {currentDocument ? '編輯文檔' : '新增文檔'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        標題 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        描述
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        類別 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="handbook">交屋手冊</option>
                        {/* <option value="process">售服流程</option> */}
                        {/* <option value="manual">使用說明</option> */}
                        {/* <option value="warranty">保固資訊</option> */}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                        關聯專案
                      </label>
                      <select
                        id="projectId"
                        value={formData.projectId}
                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">不指定</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* 文件上傳 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        文件 <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 flex items-stretch">
                        <div className="flex-grow relative border border-gray-300 rounded-md py-2 px-3 w-[65%]">
                          <div className="flex items-center">
                            {fileToUpload ? (
                              <>
                                <File className="h-5 w-5 text-gray-400" />
                                <span className="ml-2 text-gray-600 truncate">{fileToUpload.name}</span>
                              </>
                            ) : formData.fileUrl ? (
                              <>
                                {getFileTypeIcon(formData.fileType)}
                                <a 
                                  href={formData.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 hover:text-blue-800 truncate flex-grow"
                                >
                                  {formData.fileUrl.split('/').pop()}
                                </a>
                              </>
                            ) : (
                              <span className="text-gray-400">選擇文件或輸入URL</span>
                            )}
                          </div>
                        </div>
                        <label
                          htmlFor="file-upload"
                          className="ml-2 cursor-pointer inline-flex flex-1 justify-center items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          瀏覽
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </div>
                      
                      {/* 上傳進度條 */}
                      {isUploading && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-amber-600 h-2.5 rounded-full" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
                        </div>
                      )}
                      
                      {/* 手動輸入URL選項 */}
                      <div className="mt-2">
                        <label htmlFor="fileUrl" className="block text-xs font-medium text-gray-500">
                          或直接輸入文件URL
                        </label>
                        <div className="mt-1 flex rounded-md">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            <Link className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            id="fileUrl"
                            value={formData.fileUrl}
                            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            placeholder="https://example.com/file.pdf"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 封面圖片上傳 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        封面圖片
                      </label>
                      <div className="mt-1 flex items-stretch">
                        <div className="flex-grow relative border border-gray-300 rounded-md py-2 px-3 w-[65%]">
                          <div className="flex items-center">
                            {imageToUpload ? (
                              <>
                                <File className="h-5 w-5 text-gray-400" />
                                <span className="ml-2 text-gray-600 truncate">{imageToUpload.name}</span>
                              </>
                            ) : formData.imageUrl ? (
                              <>
                                <img 
                                  src={formData.imageUrl} 
                                  alt="封面圖片預覽" 
                                  className="h-6 w-6 object-cover rounded mr-2" 
                                />
                                <a 
                                  href={formData.imageUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 truncate flex-grow"
                                >
                                  {formData.imageUrl.split('/').pop()}
                                </a>
                              </>
                            ) : (
                              <span className="text-gray-400">選擇封面圖片或輸入URL</span>
                            )}
                          </div>
                        </div>
                        <label
                          htmlFor="image-upload"
                          className="ml-2 cursor-pointer inline-flex flex-1 justify-center items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          瀏覽
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </div>
                      
                      {/* 上傳進度條 */}
                      {isImageUploading && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-amber-600 h-2.5 rounded-full" 
                              style={{ width: `${imageUploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">{imageUploadProgress}%</p>
                        </div>
                      )}
                      
                      {/* 手動輸入URL選項 */}
                      <div className="mt-2">
                        <label htmlFor="imageUrl" className="block text-xs font-medium text-gray-500">
                          或直接輸入圖片URL
                        </label>
                        <div className="mt-1 flex rounded-md">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            <Link className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>

                      {/* 圖片預覽 */}
                      {formData.imageUrl && (
                        <div className="mt-2 flex justify-center">
                          <img 
                            src={formData.imageUrl} 
                            alt="封面預覽" 
                            className="h-32 object-contain border border-gray-200 rounded"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">
                        檔案類型 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fileType"
                        required
                        value={formData.fileType}
                        onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder="pdf, docx, jpg..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                        排序
                      </label>
                      <input
                        type="number"
                        id="order"
                        min="1"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        啟用
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 ${
                      isSubmitting || isUploading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-800 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                    } sm:ml-3 sm:w-auto sm:text-sm`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        處理中...
                      </>
                    ) : currentDocument ? (
                      '更新'
                    ) : (
                      '新增'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認模態框 */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      刪除文檔
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        確定要刪除文檔「{currentDocument?.title}」嗎？此操作無法撤銷。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  } sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      處理中...
                    </>
                  ) : (
                    '確認刪除'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
