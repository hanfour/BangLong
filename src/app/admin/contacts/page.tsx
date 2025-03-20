'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2, MessageSquare, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

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
}

export default function ContactsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeContact, setActiveContact] = useState<ContactSubmission | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      const url = statusFilter 
        ? `/api/contacts/admin?status=${statusFilter}`
        : '/api/contacts/admin';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('無法獲取聯絡表單數據');
      }
      
      const data = await response.json();
      setContacts(data.data);
    } catch (err) {
      console.error('獲取聯絡表單數據失敗:', err);
      setError('獲取聯絡表單數據失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 首次加載和過濾器變更時獲取數據
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchContacts();
    }
  }, [sessionStatus, statusFilter]);

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
      
    } catch (err) {
      console.error('更新聯絡表單狀態失敗:', err);
      setError('更新聯絡表單狀態失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 提交回覆
  const handleSubmitReply = async () => {
    if (!activeContact || !replyText.trim()) return;
    
    try {
      setIsSubmitting(true);
      
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
      
      const result = await response.json();
      
      // 更新本地狀態
      setContacts(prev => 
        prev.map(contact => 
          contact.id === activeContact.id ? { ...contact, reply: replyText, status: 'completed' } : contact
        )
      );
      
      // 更新活動表單
      setActiveContact(prev => prev ? { ...prev, reply: replyText, status: 'completed' } : null);
      
      // 清空回覆文本
      setReplyText('');
      
    } catch (err) {
      console.error('提交回覆失敗:', err);
      setError('提交回覆失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm:ss');
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側列表 */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">聯絡表單列表</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="">所有狀態</option>
              <option value="new">新提交</option>
              <option value="processing">處理中</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-amber-800" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-center">
              {error}
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 bg-gray-50 text-gray-500 rounded-md text-center">
              暫無聯絡表單數據
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-amber-50 transition-colors ${
                    activeContact?.id === contact.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setActiveContact(contact);
                    setReplyText(contact.reply || '');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{contact.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {getStatusIcon(contact.status)}
                      <span className="ml-1">
                        {contact.status === 'new' ? '新提交' : 
                         contact.status === 'processing' ? '處理中' : 
                         contact.status === 'completed' ? '已完成' : '未知'}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{contact.email}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{contact.message}</p>
                  <div className="text-xs text-gray-400 mt-2">{formatDate(contact.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右側詳情與回覆 */}
        <div className="lg:col-span-2">
          {activeContact ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">聯絡詳情</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(activeContact.id, 'processing')}
                    disabled={activeContact.status === 'processing' || isSubmitting}
                    className={`px-3 py-1 rounded-md text-sm ${
                      activeContact.status === 'processing'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    標記處理中
                  </button>
                  <button
                    onClick={() => handleStatusChange(activeContact.id, 'completed')}
                    disabled={activeContact.status === 'completed' || isSubmitting}
                    className={`px-3 py-1 rounded-md text-sm ${
                      activeContact.status === 'completed'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    標記已完成
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">客戶姓名</p>
                  <p className="font-medium">{activeContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">電子郵件</p>
                  <p className="font-medium">{activeContact.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">聯絡電話</p>
                  <p className="font-medium">{activeContact.phone || '未提供'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">提交時間</p>
                  <p className="font-medium">{formatDate(activeContact.createdAt)}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">留言內容</p>
                <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {activeContact.message}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">回覆內容</p>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={5}
                  placeholder="輸入您對客戶留言的回覆..."
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSubmitting}
                  className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 disabled:bg-gray-300 flex items-center"
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
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageSquare className="h-12 w-12 text-amber-300 mx-auto mb-4" />
              <p className="text-gray-500">選擇左側的聯絡表單項目以查看詳情</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}