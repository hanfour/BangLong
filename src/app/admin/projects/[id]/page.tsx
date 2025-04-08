'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, AlertCircle, Edit, ArrowLeft, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Project, Document } from '@/types/global';

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = params;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectDocuments, setProjectDocuments] = useState<Document[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (status === 'authenticated') {
      fetchProjectData();
    }
  }, [status, router, id]);

  const fetchProjectData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '獲取專案失敗');
      }

      setProject(data.project);
      
      // 處理關聯的文檔
      if (data.project.documents && Array.isArray(data.project.documents)) {
        setProjectDocuments(data.project.documents);
      }
      
    } catch (error) {
      console.error('獲取專案失敗:', error);
      setError('獲取專案失敗，請重新整理頁面或稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const deleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '刪除專案失敗');
      }

      // 導向到專案列表
      router.push(`/admin/projects${project ? `?category=${project.category}` : ''}`);
    } catch (error) {
      console.error('刪除專案失敗:', error);
      setError('刪除專案失敗，請稍後再試');
      setShowDeleteConfirm(false);
    }
  };

  const getCategoryName = (category?: string): string => {
    if (!category) return '未分類';
    
    switch (category) {
      case 'new': return '新案鑑賞';
      case 'classic': return '歷年經典';
      case 'future': return '未來計畫';
      default: return '未分類';
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

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <Link
            href="/admin/projects"
            className="text-amber-800 hover:text-amber-900 flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回專案列表
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">專案不存在或已被刪除</p>
          <div className="mt-4">
            <Link
              href="/admin/projects"
              className="text-amber-800 hover:text-amber-900 flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回專案列表
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center">
            <Link
              href={`/admin/projects?category=${project.category}`}
              className="text-amber-800 hover:text-amber-900 mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
          </div>
          <p className="text-gray-600 mt-1 ml-8">
            專案類別：{getCategoryName(project.category)}
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex space-x-2">
          <Link
            href={`/admin/projects/${id}/edit`}
            className="px-4 py-2 bg-amber-800 text-white rounded-md flex items-center hover:bg-amber-900"
          >
            <Edit className="w-4 h-4 mr-2" />
            編輯專案
          </Link>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            刪除專案
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* 專案圖片 */}
          <div className="md:w-1/3 relative pt-[56.25%] md:pt-0 md:h-auto">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
          
          {/* 專案詳細信息 */}
          <div className="md:w-2/3 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">基本信息</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">專案標題</dt>
                  <dd className="mt-1 text-gray-900">{project.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">類別</dt>
                  <dd className="mt-1 text-gray-900">{getCategoryName(project.category)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">狀態</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {project.isActive ? '啟用中' : '已停用'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">建立日期</dt>
                  <dd className="mt-1 text-gray-900">{new Date(project.createdAt).toLocaleDateString('zh-TW')}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">描述</dt>
                  <dd className="mt-1 text-gray-900">{project.description || '無描述'}</dd>
                </div>
              </dl>
            </div>
            
            {/* 專案特性 */}
            {project.details && project.details.items && project.details.items.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-2">專案詳細資訊</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.details.items.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-2">
                      <dt className="text-sm font-medium text-gray-500">{item.label || '其他資訊'}</dt>
                      <dd className="mt-1 text-gray-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            
            {/* 關聯文檔 */}
            {projectDocuments.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">關聯文檔</h2>
                <ul className="divide-y divide-gray-200">
                  {projectDocuments.map(doc => (
                    <li key={doc.id} className="py-3 flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        {doc.imageUrl ? (
                          <div className="relative w-16 h-16">
                            <Image
                              src={doc.imageUrl}
                              alt={doc.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">{doc.fileType.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                        <p className="text-sm text-gray-500 truncate">{doc.description || '無描述'}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <Link
                          href={`/admin/documents?id=${doc.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          查看文檔
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 刪除確認對話框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">確認刪除</h3>
              <p className="text-gray-600 mb-2">您確定要刪除專案「{project.title}」嗎？</p>
              <p className="text-gray-600 mb-6">此操作將移除此專案並取消與所有文檔的關聯，但不會刪除關聯的文檔本身。此操作無法復原。</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={deleteProject}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
