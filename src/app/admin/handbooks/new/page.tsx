'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Loader2, Upload, Trash2, File, FileText } from 'lucide-react';

interface Project {
  id: string;
  title: string;
}

interface FileToUpload {
  id: string;
  file: File;
  title: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export default function NewHandbookPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileToUpload[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    coverImageUrl: '',
    password: '',
    description: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects/admin');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('獲取專案列表失敗:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上傳失敗');
      }

      setFormData((prev) => ({ ...prev, coverImageUrl: data.url }));
    } catch (err) {
      alert('圖片上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: FileToUpload[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      title: file.name,
      uploading: false,
      uploaded: false,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = ''; // 清空 input
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileTitle = (id: string, title: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title } : f))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // 驗證
    if (!formData.title || !formData.coverImageUrl || !formData.password) {
      setError('標題、封面圖片、密碼為必填欄位');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6 || formData.password.length > 8) {
      setError('密碼長度必須為 6-8 位');
      setIsLoading(false);
      return;
    }

    try {
      // 1. 建立手冊
      const response = await fetch('/api/handbooks/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId: formData.projectId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '新增失敗');
      }

      const handbookId = data.handbook.id;

      // 2. 上傳所有文件
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const fileItem = files[i];

          // 更新上傳狀態
          setFiles((prev) =>
            prev.map((f) => (f.id === fileItem.id ? { ...f, uploading: true } : f))
          );

          try {
            // 上傳文件
            const formData = new FormData();
            formData.append('file', fileItem.file);

            const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(fileItem.file.name)}`, {
              method: 'POST',
              body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
              throw new Error(uploadData.error || '文件上傳失敗');
            }

            // 建立文件記錄
            await fetch(`/api/handbooks/admin/${handbookId}/files`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: fileItem.title,
                fileUrl: uploadData.url,
                fileType: fileItem.file.name.split('.').pop() || 'unknown',
                fileSize: fileItem.file.size,
                order: i,
              }),
            });

            // 標記為已上傳
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, uploading: false, uploaded: true, url: uploadData.url }
                  : f
              )
            );
          } catch (err) {
            // 標記錯誤
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, uploading: false, error: '上傳失敗' }
                  : f
              )
            );
          }
        }
      }

      // 3. 跳轉到手冊列表
      router.push('/admin/handbooks');
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增失敗');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">新增交屋手冊</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* 所屬專案 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所屬專案 (可選)
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">獨立手冊 (不關聯專案)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* 手冊標題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手冊標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="例如: 邦瓏 A案交屋手冊"
              required
            />
          </div>

          {/* 封面圖片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面圖片 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200">
                <Upload className="h-5 w-5" />
                <span>{isUploading ? '上傳中...' : '選擇圖片'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              {formData.coverImageUrl && (
                <div className="relative w-20 h-24">
                  <img
                    src={formData.coverImageUrl}
                    alt="預覽"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 密碼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密碼 (6-8位) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="例如: 123456"
              minLength={6}
              maxLength={8}
              required
            />
            <p className="text-sm text-gray-500 mt-1">建議使用 6-8 位數字</p>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              rows={3}
              placeholder="手冊說明..."
            />
          </div>

          {/* 排序 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">排序順序</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              min={0}
            />
          </div>

          {/* 啟用狀態 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              啟用此手冊
            </label>
          </div>

          {/* 文件上傳區 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">手冊文件</h3>

            <label className="flex items-center justify-center space-x-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-gray-600">
                點擊選擇文件 (可多選 PDF, DOC, DOCX, PPT, PPTX)
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFilesSelect}
                className="hidden"
                multiple
                disabled={isLoading}
              />
            </label>

            {/* 文件列表 */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {file.file.name.endsWith('.pdf') ? (
                        <File className="h-6 w-6 text-red-600" />
                      ) : (
                        <FileText className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) => updateFileTitle(file.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                        placeholder="文件標題"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {file.file.type || file.file.name.split('.').pop()?.toUpperCase()} •{' '}
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.uploading && (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                      )}
                      {file.uploaded && (
                        <span className="text-xs text-green-600">✓ 已上傳</span>
                      )}
                      {file.error && (
                        <span className="text-xs text-red-600">{file.error}</span>
                      )}
                      {!isLoading && (
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 按鈕 */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="flex-1 bg-amber-800 text-white py-2 rounded-lg hover:bg-amber-900 disabled:bg-gray-400"
            >
              {isLoading ? (files.length > 0 ? '建立並上傳文件中...' : '建立中...') : '建立手冊'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
