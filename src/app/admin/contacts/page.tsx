'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, set } from 'date-fns';
import {
  Loader2, MessageSquare, CheckCircle, Clock, XCircle, Send, Search,
  Filter, Download, Calendar, RefreshCw, Mail, Phone, User, BarChart4, Archive
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import TiptapEditor from '@/components/admin/TiptapEditor';

// 定義聯絡表單項目類型
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'new' | 'processing' | 'completed';
  reply: string | null;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

// 定義統計數據類型
interface StatusStat {
  status: string;
  count: number;
}

export default function ContactsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeContact, setActiveContact] = useState<ContactSubmission | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<{ [key: string]: number }>({
    total: 0,
    new: 0,
    processing: 0,
    completed: 0,
  });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 檢查用戶是否已登錄
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [sessionStatus, router]);

  // 獲取聯絡表單提交列表
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // 構建 URL 參數
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('archived', showArchived.toString());
      
      const url = `/api/contacts/admin?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('無法獲取聯絡表單數據');
      }
      
      const data = await response.json();
      setContacts(data.data);
      
      // 更新統計數據
      const statsData = {
        total: data.total || 0,
        new: 0,
        processing: 0,
        completed: 0,
      };
      
      if (data.statusStats) {
        (data.statusStats as StatusStat[]).forEach(stat => {
          if (stat.status in statsData) {
            statsData[stat.status] = Number(stat.count);
          }
        });
      }
      
      setStats(statsData);
    } catch (err) {
      console.error('獲取聯絡表單數據失敗:', err);
      setError('獲取聯絡表單數據失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveToggle = async (id: string, archive: boolean) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/contacts/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, archived: archive }),
      });
      
      if (!response.ok) {
        throw new Error(archive ? '封存失敗' : '解除封存失敗');
      }
      
      // 更新本地狀態
      setContacts(prev => 
        prev.map(contact => 
          contact.id === id ? { ...contact, archived: archive } : contact
        )
      );
      
      // 如果當前正在檢視該聯絡表單，也更新活動表單的狀態
      if (activeContact && activeContact.id === id) {
        setActiveContact(prev => prev ? { ...prev, archived: archive } : null);
      }
      
      setSuccess(`已${archive ? '封存' : '解除封存'}此聯絡表單`);
      
      // 更新統計資料
      fetchContacts();
    } catch (err) {
      console.error(archive ? '封存聯絡表單失敗:' : '解除封存聯絡表單失敗:', err);
      setError(archive ? '封存聯絡表單失敗，請重試' : '解除封存聯絡表單失敗，請重試');
    } finally {
      setIsSubmitting(false);
      
      // 3秒後清除成功消息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
  };


  // 添加防抖版本的 fetchContacts
  const debouncedFetchContacts = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchContacts();
    }, 300);
  };

  // 過濾器變化時獲取數據
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      // 使用防抖版本的 fetchContacts
      debouncedFetchContacts();
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [sessionStatus, statusFilter, startDate, endDate, showArchived, searchTerm]);

  // 獲取狀態標籤顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取狀態圖標
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <MessageSquare className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  // 處理狀態變更
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/contacts/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('更新狀態失敗');
      }
      
      // 更新本地狀態
      setContacts(prev => 
        prev.map(contact => 
          contact.id === id ? { ...contact, status: newStatus as 'new' | 'processing' | 'completed' } : contact
        )
      );
      
      // 如果當前正在檢視該聯絡表單，也更新活動表單的狀態
      if (activeContact && activeContact.id === id) {
        setActiveContact(prev => prev ? { ...prev, status: newStatus as 'new' | 'processing' | 'completed' } : null);
      }
      
      setSuccess(`已將狀態更新為 ${newStatus === 'new' ? '新提交' : newStatus === 'processing' ? '處理中' : '已完成'}`);
      
      // 更新統計資料
      fetchContacts();
    } catch (err) {
      console.error('更新聯絡表單狀態失敗:', err);
      setError('更新聯絡表單狀態失敗，請重試');
    } finally {
      setIsSubmitting(false);
      
      // 3秒後清除成功消息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
  };

  // 提交回覆
  const handleSubmitReply = async () => {
    if (!activeContact || !replyText.trim()) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/contacts/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: activeContact.id, 
          reply: replyText,
          status: 'completed'
        }),
      });
      
      if (!response.ok) {
        throw new Error('提交回覆失敗');
      }
      
      // 更新本地狀態
      setContacts(prev => 
        prev.map(contact => 
          contact.id === activeContact.id ? { ...contact, reply: replyText, status: 'completed' } : contact
        )
      );
      
      // 更新活動表單
      setActiveContact(prev => prev ? { ...prev, reply: replyText, status: 'completed' } : null);
      
      // 成功提示，添加關於自動發送郵件的說明
      setSuccess('回覆已成功提交並標記為已完成，系統將自動發送回覆郵件至客戶的電子郵箱。');
      
      // 更新統計資料
      fetchContacts();
    } catch (err) {
      console.error('提交回覆失敗:', err);
      setError('提交回覆失敗，請重試');
    } finally {
      setIsSubmitting(false);
      
      // 3秒後清除成功消息
      setTimeout(() => {
        setSuccess('');
      }, 5000); // 延長時間為5秒，讓用戶有足夠時間閱讀
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy/MM/dd HH:mm:ss');
    } catch (error) {
      return '無效日期';
    }
  };

  // 格式化簡短日期
  const formatShortDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy/MM/dd');
    } catch (error) {
      return '無效日期';
    }
  };

  // 重置過濾條件
  const resetFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setShowArchived(false);
    setShowFilters(false);
  };

  // 導出為CSV
  const exportToCSV = () => {
    if (contacts.length === 0) return;
    
    // 準備CSV標頭
    const headers = ['姓名', '電子郵件', '電話', '訊息', '狀態', '回覆', '創建時間'];
    
    // 轉換狀態
    const translateStatus = (status: string) => {
      switch (status) {
        case 'new': return '新提交';
        case 'processing': return '處理中';
        case 'completed': return '已完成';
        default: return status;
      }
    };
    
    // 準備每行數據
    const rows = contacts.map(contact => [
      contact.name,
      contact.email,
      contact.phone || '',
      contact.message.replace(/\n/g, ' '), // 移除換行以避免CSV格式問題
      translateStatus(contact.status),
      (contact.reply || '').replace(/\n/g, ' '), // 移除換行
      formatDate(contact.createdAt)
    ]);
    
    // 組合CSV內容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // 創建Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 創建下載鏈接
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `聯絡表單_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    
    // 觸發下載
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <MessageSquare className="mr-2 h-6 w-6" />
          客戶諮詢管理
        </h1>
        <p className="text-gray-600 mt-1">管理和回覆客戶提交的聯絡表單</p>
      </div>
      
      {/* 成功和錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
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
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">總諮詢數</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">新提交</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.new}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">處理中</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.processing}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">已完成</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>
      
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
                placeholder="搜索姓名、郵箱、電話或留言..."
              />
            </div>
            
            {/* 狀態篩選器 */}
            <div className="inline-flex">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">所有狀態</option>
                <option value="new">新提交</option>
                <option value="processing">處理中</option>
                <option value="completed">已完成</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-amber-300 focus:shadow-outline-amber active:text-gray-800 active:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? '隱藏篩選' : '更多篩選'}
              </button>

              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`ml-2 inline-flex items-center px-3 py-2 border rounded-md text-sm leading-5 font-medium focus:outline-none focus:border-amber-300 focus:shadow-outline-amber ${
                  showArchived 
                    ? 'border-amber-500 bg-amber-50 text-amber-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:text-gray-500'
                }`}
              >
                <Archive className="h-4 w-4 mr-1" />
                {showArchived ? '顯示中: 已封存' : '顯示封存'}
              </button>
              
              <button
                onClick={exportToCSV}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-amber-300 focus:shadow-outline-amber active:text-gray-800 active:bg-gray-50"
                disabled={contacts.length === 0}
                title={contacts.length === 0 ? '無數據可導出' : '導出為CSV'}
              >
                <Download className="h-4 w-4 mr-1" />
                導出
              </button>
              
              <button
                onClick={fetchContacts}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-amber-300 focus:shadow-outline-amber active:text-gray-800 active:bg-gray-50"
                title="刷新數據"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* 展開的過濾選項 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">開始日期</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="start-date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="py-4 pl-10 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">結束日期</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="end-date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="py-4 pl-10 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-600"
                >
                  重置所有篩選
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側列表 */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-amber-800" />
            </div>
          ) : error && !success ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-center">
              {error}
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-2">暫無聯絡表單數據</p>
              {(statusFilter || searchTerm || startDate || endDate) && (
                <button
                  onClick={resetFilters}
                  className="text-amber-600 hover:text-amber-700 text-sm"
                >
                  清除所有篩選條件
                </button>
              )}
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-500">
                  顯示 {contacts.length} 筆結果 {searchTerm && `含 "${searchTerm}"`} {statusFilter && `(${statusFilter === 'new' ? '新提交' : statusFilter === 'processing' ? '處理中' : '已完成'})`}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 cursor-pointer hover:bg-amber-50 transition-colors ${
                      activeContact?.id === contact.id ? 'border-l-4 border-amber-500 bg-amber-50' : ''
                    }`}
                    onClick={() => {
                      setActiveContact(contact);
                      setReplyText(contact.reply || '');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {contact.name}
                        {contact.archived && (
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                            已封存
                          </span>
                        )}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {getStatusIcon(contact.status)}
                        <span className="ml-1">
                          {contact.status === 'new' ? '新提交' : 
                           contact.status === 'processing' ? '處理中' : 
                           contact.status === 'completed' ? '已完成' : '未知'}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="mt-1 text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.phone}
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{contact.message}</p>
                    <div className="text-xs text-gray-400 mt-2">{formatShortDate(contact.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右側詳情與回覆 */}
        <div className="lg:col-span-2">
          {activeContact ? (
            <div className="bg-white rounded-lg shadow">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">聯絡詳情</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleArchiveToggle(activeContact.id, !activeContact.archived)}
                    disabled={isSubmitting}
                    className={`px-3 py-1 rounded-md text-sm flex items-center ${
                      isSubmitting
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : activeContact.archived
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {activeContact.archived ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        解除封存
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-1" />
                        封存
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleStatusChange(activeContact.id, 'processing')}
                    disabled={activeContact.status === 'processing' || isSubmitting}
                    className={`px-3 py-1 rounded-md text-sm flex items-center ${
                      activeContact.status === 'processing' || isSubmitting
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    標記處理中
                  </button>
                  <button
                    onClick={() => handleStatusChange(activeContact.id, 'completed')}
                    disabled={activeContact.status === 'completed' || isSubmitting}
                    className={`px-3 py-1 rounded-md text-sm flex items-center ${
                      activeContact.status === 'completed' || isSubmitting
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    標記已完成
                  </button>
                </div>
              </div>

              <div className="p-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      客戶姓名
                    </p>
                    <p className="font-medium">{activeContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      電子郵件
                    </p>
                    <p className="font-medium">{activeContact.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      聯絡電話
                    </p>
                    <p className="font-medium">{activeContact.phone || '未提供'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      提交時間
                    </p>
                    <p className="font-medium">{formatDate(activeContact.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    留言內容
                  </p>
                  <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {activeContact.message}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-500 mb-2 flex items-center">
                  <Send className="h-4 w-4 mr-1" />
                  回覆內容
                </p>
                <TiptapEditor
                  value={replyText}
                  onChange={setReplyText}
                  placeholder="輸入您對客戶留言的回覆..."
                />
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || isSubmitting}
                    className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        送出回覆
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-12 w-12 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">客戶溝通中心</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                選擇左側的聯絡表單項目以查看詳情。您可以回覆客戶的諮詢並管理所有請求。
              </p>
              <div className="border-t pt-6 flex justify-center">
                <div className="text-sm text-gray-500 flex items-center">
                  <BarChart4 className="h-4 w-4 mr-2 text-amber-500" />
                  總計: {stats.total} 筆聯絡表單
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}