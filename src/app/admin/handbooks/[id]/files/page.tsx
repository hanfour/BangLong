'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Loader2, Upload, Edit, Trash2, File, FileText } from 'lucide-react';

interface HandbookFile {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  order: number;
  downloadCount: number;
}

export default function HandbookFilesPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const handbookId = params.id as string;

  const [files, setFiles] = useState<HandbookFile[]>([]);
  const [handbookTitle, setHandbookTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
    if (status === 'authenticated') {
      fetchFiles();
      fetchHandbook();
    }
  }, [status, router]);

  const fetchHandbook = async () => {
    try {
      const response = await fetch(`/api/handbooks/${handbookId}`);
      const data = await response.json();
      setHandbookTitle(data.handbook?.title || '');
    } catch (err) {
      console.error('獲取手冊失敗:', err);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/handbooks/${handbookId}/files`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('獲取文件列表失敗:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 先上傳文件
      const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || '上傳失敗');
      }

      // 建立文件記錄
      const createResponse = await fetch(`/api/handbooks/admin/${handbookId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name,
          fileUrl: uploadData.url,
          fileType: file.name.split('.').pop() || 'unknown',
          fileSize: file.size,
          order: files.length,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('建立文件記錄失敗');
      }

      fetchFiles();
    } catch (err) {
      alert('上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('確定要刪除此文件嗎?')) return;

    try {
      const response = await fetch(`/api/handbooks/admin/${handbookId}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      fetchFiles();
    } catch (err) {
      alert('刪除失敗');
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === 'pdf') return <File className="h-6 w-6 text-red-600" />;
    if (type === 'doc' || type === 'docx') return <FileText className="h-6 w-6 text-blue-600" />;
    return <File className="h-6 w-6 text-gray-600" />;
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
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/handbooks')}
          className="text-amber-800 hover:underline mb-2"
        >
          ← 返回手冊列表
        </button>
        <h1 className="text-2xl font-bold">文件管理: {handbookTitle}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="flex items-center justify-center space-x-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50">
          <Upload className="h-6 w-6 text-gray-400" />
          <span className="text-gray-600">
            {isUploading ? '上傳中...' : '點擊上傳文件 (PDF, DOC, DOCX, PPT, PPTX)'}
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                類型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                文件名稱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                大小
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                下載次數
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{getFileIcon(file.fileType)}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{file.title}</div>
                  <div className="text-sm text-gray-500">{file.fileType.toUpperCase()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{file.downloadCount} 次</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {files.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            尚無文件,請上傳文件
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
