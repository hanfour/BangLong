'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Loader2, Upload, Trash2, File, FileText } from 'lucide-react';

interface Project {
  id: string;
  title: string;
}

interface ExistingFile {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  order: number;
  downloadCount: number;
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

export default function EditHandbookPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const handbookId = params.id as string;

  const [projects, setProjects] = useState<Project[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const [newFiles, setNewFiles] = useState<FileToUpload[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    coverImageUrl: '',
    password: '', // 留空表示不修改密碼
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
      fetchHandbook();
      fetchFiles();
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

  const fetchHandbook = async () => {
    try {
      const response = await fetch(`/api/handbooks/admin?handbookId=${handbookId}`);
      const data = await response.json();

      const handbook = data.handbooks?.find((h: any) => h.id === handbookId);

      if (handbook) {
        setFormData({
          title: handbook.title,
          projectId: handbook.projectId || '',
          coverImageUrl: handbook.coverImageUrl,
          password: '', // 不顯示現有密碼
          description: handbook.description || '',
          order: handbook.order,
          isActive: handbook.isActive,
        });
      }
    } catch (err) {
      console.error('獲取手冊失敗:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/handbooks/${handbookId}/files`);
      const data = await response.json();
      setExistingFiles(data.files || []);
    } catch (err) {
      console.error('獲取文件列表失敗:', err);
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

  const handleNewFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const files: FileToUpload[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      title: file.name,
      uploading: false,
      uploaded: false,
    }));
    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeNewFile = (id: string) => {
    setNewFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateNewFileTitle = (id: string, title: string) => {
    setNewFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title } : f))
    );
  };

  const removeExistingFile = (id: string) => {
    setDeletedFileIds((prev) => [...prev, id]);
  };

  const updateExistingFileTitle = (id: string, title: string) => {
    setExistingFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title } : f))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    // 驗證密碼長度 (如果有輸入新密碼)
    if (formData.password && (formData.password.length < 6 || formData.password.length > 8)) {
      setError('密碼長度必須為 6-8 位');
      setIsSaving(false);
      return;
    }

    try {
      // 1. 更新手冊基本資訊
      const response = await fetch(`/api/handbooks/admin/${handbookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId: formData.projectId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新失敗');
      }

      // 2. 刪除標記的文件
      for (const fileId of deletedFileIds) {
        await fetch(`/api/handbooks/admin/${handbookId}/files/${fileId}`, {
          method: 'DELETE',
        });
      }

      // 3. 更新既有文件的標題
      for (const file of existingFiles) {
        if (!deletedFileIds.includes(file.id)) {
          await fetch(`/api/handbooks/admin/${handbookId}/files/${file.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: file.title }),
          });
        }
      }

      // 4. 上傳新文件
      if (newFiles.length > 0) {
        const currentFileCount = existingFiles.filter(f => !deletedFileIds.includes(f.id)).length;

        for (let i = 0; i < newFiles.length; i++) {
          const fileItem = newFiles[i];

          setNewFiles((prev) =>
            prev.map((f) => (f.id === fileItem.id ? { ...f, uploading: true } : f))
          );

          try {
            // 上傳文件
            const uploadFormData = new FormData();
            uploadFormData.append('file', fileItem.file);

            const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(fileItem.file.name)}`, {
              method: 'POST',
              body: uploadFormData,
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
                order: currentFileCount + i,
              }),
            });

            setNewFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, uploading: false, uploaded: true, url: uploadData.url }
                  : f
              )
            );
          } catch (err) {
            setNewFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, uploading: false, error: '上傳失敗' }
                  : f
              )
            );
          }
        }
      }

      // 5. 跳轉回列表
      router.push('/admin/handbooks');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
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
        <h1 className="text-2xl font-bold mb-6">編輯交屋手冊</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手冊標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面圖片 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200">
                <Upload className="h-5 w-5" />
                <span>{isUploading ? '上傳中...' : '更換圖片'}</span>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新密碼 (留空表示不修改,6-8位)
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="留空表示不修改密碼"
              minLength={6}
              maxLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              rows={3}
            />
          </div>

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

          {/* 文件管理區 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">手冊文件</h3>

            {/* 既有文件 */}
            {existingFiles.filter(f => !deletedFileIds.includes(f.id)).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">現有文件</h4>
                <div className="space-y-2">
                  {existingFiles
                    .filter(f => !deletedFileIds.includes(f.id))
                    .map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {file.fileType === 'pdf' ? (
                            <File className="h-6 w-6 text-red-600" />
                          ) : (
                            <FileText className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={file.title}
                            onChange={(e) => updateExistingFileTitle(file.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                            disabled={isSaving}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {file.fileType.toUpperCase()} • 已下載 {file.downloadCount} 次
                          </p>
                        </div>
                        {!isSaving && (
                          <button
                            type="button"
                            onClick={() => removeExistingFile(file.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 新增文件上傳 */}
            <label className="flex items-center justify-center space-x-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-gray-600">
                點擊新增文件 (可多選 PDF, DOC, DOCX, PPT, PPTX)
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleNewFilesSelect}
                className="hidden"
                multiple
                disabled={isSaving}
              />
            </label>

            {/* 新增的文件列表 */}
            {newFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">待上傳文件</h4>
                {newFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
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
                        onChange={(e) => updateNewFileTitle(file.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                        placeholder="文件標題"
                        disabled={isSaving}
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
                      {!isSaving && (
                        <button
                          type="button"
                          onClick={() => removeNewFile(file.id)}
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

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex-1 bg-amber-800 text-white py-2 rounded-lg hover:bg-amber-900 disabled:bg-gray-400"
            >
              {isSaving ? (newFiles.length > 0 ? '更新並上傳文件中...' : '更新中...') : '更新手冊'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
