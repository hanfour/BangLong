'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminHelp from '@/components/admin/AdminHelp';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Loader2, Users, UserPlus, Edit, Trash2, X, Check, ShieldAlert,
  User as UserIcon, Mail, Key, Save, AlertCircle, Search, Lock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

// 定義用戶類型
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
  updatedAt: string;
  hasChangedPassword: boolean;
}

export default function UsersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as 'admin' | 'editor',
  });

  const [editUser, setEditUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 檢查用戶是否已登錄
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [sessionStatus, router]);

  // 獲取用戶列表
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error('無法獲取用戶數據');
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      console.error('獲取用戶數據失敗:', err);
      setError('獲取用戶數據失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 首次加載時獲取數據
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchUsers();
    }
  }, [sessionStatus]);

  // 添加新用戶
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '創建用戶失敗');
      }

      // 更新用戶列表
      fetchUsers();
      
      // 重置表單並關閉模態框
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'editor',
      });
      setShowAddModal(false);
      setSuccess('新用戶已成功創建');

      // 3秒後清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('創建用戶失敗:', err);
      setError(err.message || '創建用戶時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 更新用戶
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const userData = {
        id: editUser.id,
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        password: password || undefined, // 只有在輸入新密碼時才發送
      };

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新用戶失敗');
      }

      // 更新用戶列表
      fetchUsers();
      
      // 重置並關閉模態框
      setEditUser(null);
      setPassword('');
      setShowEditModal(false);
      setSuccess('用戶信息已成功更新');

      // 3秒後清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('更新用戶失敗:', err);
      setError(err.message || '更新用戶時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 刪除用戶
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/users?id=${deleteUserId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '刪除用戶失敗');
      }

      // 更新用戶列表
      fetchUsers();
      
      // 重置並關閉模態框
      setDeleteUserId(null);
      setShowDeleteModal(false);
      setSuccess('用戶已成功刪除');

      // 3秒後清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('刪除用戶失敗:', err);
      setError(err.message || '刪除用戶時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 過濾用戶列表
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy/MM/dd HH:mm');
    } catch (error) {
      return '無效日期';
    }
  };

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

  // 檢查當前用戶是否為管理員
  const isAdmin = session?.user?.role === 'admin';
  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="p-8 bg-red-50 rounded-lg text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">訪問被拒絕</h3>
          <p className="text-red-600">
            您沒有權限訪問帳戶管理頁面。此功能僅對管理員開放。
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="mr-2 h-6 w-6" />
            帳戶管理
          </h1>
          <p className="text-gray-600 mt-1">管理系統用戶賬戶、角色和權限</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center justify-center"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          添加用戶
        </button>
      </div>

      <AdminHelp
        content={`【操作說明】
1. 點擊「添加用戶」按鈕，輸入姓名、電子郵件、密碼，選擇角色，點擊「創建用戶」。
2. 搜尋框可輸入姓名、郵箱或角色快速篩選用戶。
3. 點擊用戶右側的「編輯」圖示可修改用戶資料或重設密碼。
4. 點擊「刪除」圖示可刪除用戶（無法刪除自己）。
5. 密碼至少6碼，管理員可管理所有功能，編輯者僅能管理內容。
`}
      />

      {/* 成功和錯誤消息 */}
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

      {/* 搜索欄 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              placeholder="搜索用戶名稱、郵箱或角色..."
            />
          </div>
        </div>
      </div>

      {/* 用戶列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-700 mx-auto mb-4" />
            <p className="text-gray-500">載入用戶資料中...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            {searchTerm ? (
              <p className="text-gray-500">沒有找到符合 "{searchTerm}" 的用戶</p>
            ) : (
              <p className="text-gray-500">暫無用戶數據，請添加新用戶</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用戶
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    密碼狀態
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    創建時間
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-amber-800" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? '管理員' : '編輯者'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.hasChangedPassword ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.hasChangedPassword ? '已修改' : '未修改'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.id === session?.user?.id ? (
                          <>
                            <span className="text-gray-400 cursor-not-allowed" title="無法編輯當前登錄用戶">
                              <Edit className="h-5 w-5" />
                            </span>
                            <span className="text-gray-400 cursor-not-allowed" title="無法刪除當前登錄用戶">
                              <Trash2 className="h-5 w-5" />
                            </span>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditUser(user);
                                setPassword('');
                                setShowEditModal(true);
                              }}
                              className="text-amber-600 hover:text-amber-900"
                              title="編輯用戶"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteUserId(user.id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="刪除用戶"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 添加用戶模態框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/25 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">添加新用戶</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="px-4 py-8 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    姓名
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="py-2 pl-10 block w-full border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                      placeholder="用戶姓名"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    電子郵件
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="py-2 pl-10 block w-full border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>
                {/* password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密碼
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="py-2 pl-10 block w-full border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                      placeholder="用戶密碼"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    角色
                  </label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'editor' })}
                    className="mt-1 py-2 pl-4 block w-full border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="editor">編輯者</option>
                    <option value="admin">管理員</option>
                  </select>
                  <p className="mt-1 text-[10px] text-gray-500">
                    *管理員可以管理所有功能，包括帳戶管理。<br/>*編輯者只能管理內容。
                  </p>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      處理中...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2 cursor-pointer" />
                      創建用戶
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編輯用戶模態框 */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">編輯用戶</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                    姓名
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="edit-name"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      className="pl-10 block w-full border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                      placeholder="用戶姓名"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                    電子郵件
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="edit-email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      className="pl-10 block w-full border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">
                    新密碼 (留空表示不變更)
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="edit-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 block w-full border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                      placeholder="留空表示不變更密碼"
                      minLength={6}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">
                    角色
                  </label>
                  <select
                    id="edit-role"
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as 'admin' | 'editor' })}
                    className="mt-1 block w-full border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="editor">編輯者</option>
                    <option value="admin">管理員</option>
                  </select>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      處理中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      保存變更
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 刪除用戶確認模態框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4">
              <div className="text-center">
                <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">確認刪除用戶</h3>
                <p className="text-gray-500">
                  此操作無法撤銷。一旦刪除用戶，系統中與該用戶相關的所有數據將無法恢復。
                </p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    處理中...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    確認刪除
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
