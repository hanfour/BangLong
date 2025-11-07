'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { Loader2, PlusCircle, Edit, Trash2, FileText } from 'lucide-react';

interface Handbook {
  id: string;
  title: string;
  coverImageUrl: string;
  password: string;
  order: number;
  isActive: boolean;
  projectId?: string | null;
  project?: {
    id: string;
    title: string;
  };
  _count?: {
    files: number;
  };
}

export default function AdminHandbooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [handbooks, setHandbooks] = useState<Handbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
    if (status === 'authenticated') {
      fetchHandbooks();
    }
  }, [status, router]);

  const fetchHandbooks = async () => {
    try {
      const response = await fetch('/api/handbooks/admin');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '獲取手冊列表失敗');
      }

      setHandbooks(data.handbooks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取手冊列表失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此手冊嗎?此操作將同時刪除所有關聯文件。')) {
      return;
    }

    try {
      const response = await fetch(`/api/handbooks/admin/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      fetchHandbooks();
    } catch (err) {
      alert('刪除失敗');
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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">交屋手冊管理</h1>
        <Link
          href="/admin/handbooks/new"
          className="flex items-center space-x-2 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900"
        >
          <PlusCircle className="h-5 w-5" />
          <span>新增手冊</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                封面
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                標題
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                所屬專案
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                密碼
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                文件數
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {handbooks.map((handbook) => (
              <tr key={handbook.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="relative w-16 h-20">
                    <Image
                      src={handbook.coverImageUrl}
                      alt={handbook.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {handbook.title}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {handbook.project?.title || '獨立手冊'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{handbook.password}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {handbook._count?.files || 0} 個
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      handbook.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {handbook.isActive ? '啟用' : '停用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <Link
                    href={`/admin/handbooks/${handbook.id}/files`}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    文件管理
                  </Link>
                  <Link
                    href={`/admin/handbooks/${handbook.id}/edit`}
                    className="text-amber-600 hover:text-amber-900 inline-flex items-center ml-3"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    編輯
                  </Link>
                  <button
                    onClick={() => handleDelete(handbook.id)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center ml-3"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {handbooks.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            尚無手冊,
            <Link href="/admin/handbooks/new" className="text-amber-800 hover:underline ml-1">
              立即新增
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
