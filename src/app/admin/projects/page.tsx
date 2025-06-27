'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import AdminHelp from '@/components/admin/AdminHelp';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, PlusCircle, EyeIcon, Edit, Trash2, AlertCircle, MoveVertical } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Project } from '@/types/global';

function ProjectsContent({ categoryParam }: { categoryParam: string | null }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryParam || undefined);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderProjects, setReorderProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status, router, selectedCategory]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory(undefined);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryString = selectedCategory ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/projects/admin${queryString}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '獲取專案失敗');
      }

      setProjects(data.projects || []);
      
      if (isReordering) {
        setReorderProjects(data.projects || []);
      }
    } catch (error) {
      console.error('獲取專案列表失敗:', error);
      setError('獲取專案列表失敗，請重新整理頁面或稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setShowDeleteConfirm(false);
  };

  const deleteProject = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/projects/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '刪除專案失敗');
      }

      setProjects(projects.filter(project => project.id !== deleteId));
      setShowSuccessMessage('專案已成功刪除');
    } catch (error) {
      console.error('刪除專案失敗:', error);
      setError('刪除專案失敗，請稍後再試');
    } finally {
      setDeleteId(null);
      setShowDeleteConfirm(false);
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新專案狀態失敗');
      }

      setProjects(projects.map(project => 
        project.id === id ? { ...project, isActive: !currentStatus } : project
      ));

      setShowSuccessMessage(`專案已${!currentStatus ? '啟用' : '停用'}`);
    } catch (error) {
      console.error('更新專案狀態失敗:', error);
      setError('更新專案狀態失敗，請稍後再試');
    }
  };

  const startReordering = () => {
    setIsReordering(true);
    setReorderProjects([...projects]);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!reorderProjects.length) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= reorderProjects.length) return;
    
    const newProjects = [...reorderProjects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[newIndex];
    newProjects[newIndex] = temp;
    
    setReorderProjects(newProjects);
  };

  const saveReordering = async () => {
    try {
      const response = await fetch('/api/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reorderProjects.map(project => ({ id: project.id })),
          category: selectedCategory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '儲存排序失敗');
      }

      setProjects(data.projects || reorderProjects);
      setShowSuccessMessage('專案排序已更新');
    } catch (error) {
      console.error('儲存排序失敗:', error);
      setError('儲存排序失敗，請稍後再試');
    } finally {
      setIsReordering(false);
    }
  };

  const cancelReordering = () => {
    setIsReordering(false);
    setReorderProjects([]);
  };

  const getCategoryName = (category?: string): string => {
    if (!category) return '全部專案';
    
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
          <h1 className="text-2xl font-bold text-gray-800">專案管理</h1>
          <p className="text-gray-600 mt-1">
            管理「{getCategoryName(selectedCategory)}」，共 {projects.length} 項
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
          {isReordering ? (
            <div className="flex space-x-2">
              <button
                onClick={saveReordering}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
              >
                <span>儲存排序</span>
              </button>
              <button
                onClick={cancelReordering}
                className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center hover:bg-gray-700"
              >
                <span>取消</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href={`/admin/projects/new${selectedCategory ? `?category=${selectedCategory}` : ''}`}
                className="px-4 py-2 bg-amber-800 text-white rounded-md flex items-center hover:bg-amber-900"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                <span>新增專案</span>
              </Link>
              {projects.length > 1 && (
                <button
                  onClick={startReordering}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
                >
                  <MoveVertical className="w-5 h-5 mr-2" />
                  <span>調整排序</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <AdminHelp
        content={`【操作說明】
1. 點擊「新增專案」按鈕，填寫專案資料後儲存。
2. 可依分類篩選專案，快速查看不同類型。
3. 點擊專案右側「編輯」圖示可修改專案資料。
4. 點擊「刪除」圖示可刪除專案。
5. 點擊「調整排序」可拖曳專案順序，完成後點「儲存排序」。
`}
      />

      <div className="mb-6 flex overflow-x-auto pb-2">
        <Link
          href="/admin/projects"
          className={`px-4 py-2 whitespace-nowrap rounded-md mr-2 ${!selectedCategory ? 'bg-amber-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          全部專案
        </Link>
        <Link
          href="/admin/projects?category=new"
          className={`px-4 py-2 whitespace-nowrap rounded-md mr-2 ${selectedCategory === 'new' ? 'bg-amber-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          新案鑑賞
        </Link>
        <Link
          href="/admin/projects?category=classic"
          className={`px-4 py-2 whitespace-nowrap rounded-md mr-2 ${selectedCategory === 'classic' ? 'bg-amber-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          歷年經典
        </Link>
        <Link
          href="/admin/projects?category=future"
          className={`px-4 py-2 whitespace-nowrap rounded-md ${selectedCategory === 'future' ? 'bg-amber-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          未來計畫
        </Link>
      </div>

      {showSuccessMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 animate-fade-in-out">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{showSuccessMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
          <span className="ml-2 text-gray-600">載入專案資料中...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-500 mb-4">目前沒有專案資料</p>
          <Link
            href={`/admin/projects/new${selectedCategory ? `?category=${selectedCategory}` : ''}`}
            className="px-4 py-2 bg-amber-800 text-white rounded-md inline-flex items-center hover:bg-amber-900"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            <span>新增第一個專案</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isReordering && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">圖片</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標題</th>
                  {!selectedCategory && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">類別</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">建立日期</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(isReordering ? reorderProjects : projects).map((project, index) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    {isReordering && (
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            title="上移"
                            className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === reorderProjects.length - 1}
                            title="下移"
                            className={`p-1 rounded ${index === reorderProjects.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="w-16 h-12 relative bg-gray-100 rounded-sm flex items-center justify-center">
                        {project.images && project.images.length > 0 ? (
                          <Image
                            src={project.images[0].imageUrl}
                            alt={project.title}
                            fill
                            sizes="64px"
                            className="object-cover rounded-sm"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">無圖</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="text-sm font-medium text-gray-900">{project.title}</div>
                      {project.description && (
                        <div className="text-sm text-gray-500 truncate">{project.description}</div>
                      )}
                    </td>
                    {!selectedCategory && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getCategoryName(project.category)}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {project.isActive ? '啟用中' : '已停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!isReordering && (
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/arch/${project.category}`}
                            target="_blank"
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="查看前台頁面"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="text-amber-600 hover:text-amber-900 flex items-center"
                            title="檢視詳情"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="編輯專案"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => confirmDelete(project.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="刪除專案"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleActiveStatus(project.id, project.isActive)}
                            className={`${project.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} flex items-center`}
                            title={project.isActive ? '停用專案' : '啟用專案'}
                          >
                            {project.isActive ? '停用' : '啟用'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">確認刪除</h3>
              <p className="text-gray-600 mb-6">您確定要刪除此專案嗎？此操作無法復原。</p>
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

function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  return <ProjectsContent categoryParam={categoryParam} />;
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-800 mx-auto" />
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <SearchParamsWrapper />
    </Suspense>
  );
}
