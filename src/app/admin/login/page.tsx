'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const { status } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 從URL獲取錯誤信息
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorType = searchParams.get('error');
    
    if (errorType) {
      switch (errorType) {
        case 'Configuration':
          setError('服務器配置錯誤，請聯繫管理員');
          break;
        case 'AccessDenied':
          setError('存取被拒絕');
          break;
        case 'Verification':
          setError('帳戶驗證失敗');
          break;
        default:
          setError('登入失敗，請重試');
      }
    }
  }, []);

  // 檢查是否已經登入
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/admin/dashboard');
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (result?.error) {
        setError('電子郵件或密碼錯誤');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      setError('登入失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 當檢查登入狀態時顯示載入畫面
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl">
        {/* 左側圖片區塊 */}
        <div className="lg:w-1/2 bg-amber-800 hidden lg:block relative">
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900 to-transparent opacity-70" />
          <div className="absolute bottom-0 left-0 p-10 text-white">
            <h2 className="text-2xl font-bold">邦隆建設</h2>
            <p className="text-amber-100 mt-2">匠心建築，豪宅典範</p>
          </div>
          {/* 這裡可以放置背景圖片 */}
        </div>
        
        {/* 右側登入表單區塊 */}
        <div className="p-8 lg:p-10 w-full lg:w-1/2">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {/* 公司 LOGO 可放在這裡 */}
              <div className="w-20 h-20 bg-amber-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">邦隆</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">後台管理系統</h1>
            <p className="text-gray-500 mt-2">登入您的管理帳號</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="請輸入電子郵件"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="請輸入密碼"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-800 text-white py-3 rounded-md hover:bg-amber-900 transition duration-200 disabled:bg-amber-300 font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  登入中...
                </>
              ) : (
                '登入'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} 邦隆建設 All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}