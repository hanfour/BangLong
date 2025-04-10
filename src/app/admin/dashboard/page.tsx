'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AdminHelp from '@/components/admin/AdminHelp';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  Image as ImageIcon, 
  Building, 
  FileText, 
  MessageCircle, 
  Users, 
  AlertCircle,
  Settings
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    carouselCount: 0,
    projectCount: 0,
    projectsNew: 0,
    projectsClassic: 0,
    projectsFuture: 0,
    documentCount: 0,
    contactCount: 0,
    newContactCount: 0,
    userCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (status === 'authenticated') {
      fetchDashboardStats();
    }
  }, [status, router]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 使用並行請求獲取所有數據
      const [carouselRes, contactsRes, usersRes, documentsRes, projectsRes, projectsNewRes, projectsClassicRes, projectsFutureRes] = await Promise.all([
        // 獲取輪播數據
        fetch('/api/carousel/admin', {
          headers: { 'Cache-Control': 'no-cache' },
          credentials: 'include'
        }).then(res => res.json()),
        
        // 獲取聯絡表單數據
        fetch('/api/contacts/admin').then(res => res.json()),
        
        // 獲取用戶數據
        fetch('/api/users').then(res => res.json()),
        
        // 獲取交屋手冊文件數據
        fetch('/api/documents/admin?category=handbook').then(res => res.json()),

        // 獲取所有專案數據
        fetch('/api/projects/admin').then(res => res.json()),

        // 獲取新案專案數據
        fetch('/api/projects/admin?category=new').then(res => res.json()),
        
        // 獲取經典專案數據
        fetch('/api/projects/admin?category=classic').then(res => res.json()),
        
        // 獲取未來專案數據
        fetch('/api/projects/admin?category=future').then(res => res.json())
      ]);
      
      // 根據實際 API 回應格式計算輪播數量
      let carouselCount = 0;
      if (carouselRes.data && Array.isArray(carouselRes.data)) {
        carouselCount = carouselRes.data.length;
      } else if (carouselRes.items && Array.isArray(carouselRes.items)) {
        carouselCount = carouselRes.items.length;
      } else if (carouselRes.carouselItems && Array.isArray(carouselRes.carouselItems)) {
        carouselCount = carouselRes.carouselItems.length;
      } else if (Array.isArray(carouselRes)) {
        carouselCount = carouselRes.length;
      }
      
      // 計算新的聯絡表單數量
      const contactStats = contactsRes.statusStats || [];
      const newContactCount = contactStats.find((stat: any) => stat.status === 'new')?.count || 0;
      
      // 計算交屋手冊數量
      let documentCount = 0;
      if (documentsRes.documents && Array.isArray(documentsRes.documents)) {
        documentCount = documentsRes.documents.length;
      }

      // 計算專案數量
      let projectCount = 0;
      if (projectsRes.projects && Array.isArray(projectsRes.projects)) {
        projectCount = projectsRes.projects.length;
      }

      // 計算新案專案數量
      let projectsNew = 0;
      if (projectsNewRes.projects && Array.isArray(projectsNewRes.projects)) {
        projectsNew = projectsNewRes.projects.length;
      }

      // 計算經典專案數量
      let projectsClassic = 0;
      if (projectsClassicRes.projects && Array.isArray(projectsClassicRes.projects)) {
        projectsClassic = projectsClassicRes.projects.length;
      }

      // 計算未來專案數量
      let projectsFuture = 0;
      if (projectsFutureRes.projects && Array.isArray(projectsFutureRes.projects)) {
        projectsFuture = projectsFutureRes.projects.length;
      }
      
      // 更新數據
      setStats({
        carouselCount: carouselCount,
        projectCount: projectCount,
        projectsNew: projectsNew,
        projectsClassic: projectsClassic,
        projectsFuture: projectsFuture,
        documentCount: documentCount,
        contactCount: contactsRes.total || 0,
        newContactCount: Number(newContactCount),
        userCount: usersRes.data?.length || 0
      });
    } catch (error) {
      console.error('獲取數據失敗:', error);
      setError('獲取儀表板數據失敗，請重新整理頁面或稍後再試');
    } finally {
      setIsLoading(false);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">儀表板總覽</h1>
        <p className="text-gray-600 mt-1">歡迎回來，{session?.user?.name || '管理員'}！查看網站最新數據。</p>
      </div>

      

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
          <span className="ml-2 text-gray-600">載入數據中...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* 主要統計卡片 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="首頁輪播"
              count={stats.carouselCount}
              icon={<ImageIcon className="h-6 w-6 text-amber-700" />}
              linkUrl="/admin/carousel"
              linkText="管理輪播"
              color="amber"
            />
            
            <StatCard
              title="建案總數"
              count={stats.projectCount}
              icon={<Building className="h-6 w-6 text-blue-700" />}
              linkUrl="/admin/projects"
              linkText="管理建案"
              color="blue"
              subcounts={[
                { label: '新案', value: stats.projectsNew },
                { label: '經典', value: stats.projectsClassic },
                { label: '未來', value: stats.projectsFuture }
              ]}
            />
            
            <StatCard
              title="交屋手冊"
              count={stats.documentCount}
              icon={<FileText className="h-6 w-6 text-emerald-700" />}
              linkUrl="/admin/documents"
              linkText="管理文件"
              color="emerald"
            />
            
            <StatCard
              title="客戶諮詢"
              count={stats.contactCount}
              icon={<MessageCircle className="h-6 w-6 text-rose-700" />}
              linkUrl="/admin/contacts"
              linkText="查看諮詢"
              color="rose"
              alert={stats.newContactCount > 0 ? `${stats.newContactCount} 筆未處理` : undefined}
            />
          </div>

          {/* 管理統計 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">系統管理</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 mr-4">
                    <Users className="h-6 w-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">後台管理員</h3>
                    <p className="text-2xl font-bold">{stats.userCount}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/users" 
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center"
                  >
                    管理帳號
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 mr-4">
                    <Settings className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">網站設定</h3>
                    <p className="text-md text-gray-500">SEO & 通知設定</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/settings" 
                    className="text-purple-600 hover:text-purple-800 font-medium text-sm inline-flex items-center"
                  >
                    管理設定
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              
              {/* 可擴展其他系統管理卡片 */}
            </div>
          </div>

          {/* 快速導覽區塊 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">快速操作</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickLinkCard 
                title="新增輪播" 
                description="新增首頁輪播項目" 
                icon={<ImageIcon className="h-5 w-5" />}
                href="/admin/carousel/new"
                color="amber"
              />
              <QuickLinkCard 
                title="新增建案" 
                description="新增建案項目" 
                icon={<Building className="h-5 w-5" />}
                href="/admin/projects/new"
                color="blue"
              />
              <QuickLinkCard 
                title="上傳文件" 
                description="新增交屋或服務文件" 
                icon={<FileText className="h-5 w-5" />}
                href="/admin/documents/new"
                color="emerald"
              />
              <QuickLinkCard 
                title="處理諮詢" 
                description="回覆客戶諮詢" 
                icon={<MessageCircle className="h-5 w-5" />}
                href="/admin/contacts?status=new"
                color="rose"
              />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

// 統計卡片元件
type StatCardProps = {
  title: string;
  count: number;
  icon: React.ReactNode;
  linkUrl: string;
  linkText: string;
  color: 'amber' | 'blue' | 'emerald' | 'rose' | 'indigo';
  subcounts?: { label: string; value: number }[];
  alert?: string;
};

const StatCard = ({ title, count, icon, linkUrl, linkText, color, subcounts, alert }: StatCardProps) => {
  const colorClasses = {
    amber: 'bg-amber-50 text-amber-700 hover:text-amber-800',
    blue: 'bg-blue-50 text-blue-700 hover:text-blue-800',
    emerald: 'bg-emerald-50 text-emerald-700 hover:text-emerald-800',
    rose: 'bg-rose-50 text-rose-700 hover:text-rose-800',
    indigo: 'bg-indigo-50 text-indigo-700 hover:text-indigo-800'
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-full ${colorClasses[color].split(' ')[0]} mr-4`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-700">{title}</h3>
            <p className="text-3xl font-bold">{count}</p>
          </div>
        </div>
        
        {subcounts && subcounts.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {subcounts.map((subcount, index) => (
              <div key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                <span className="text-gray-600">{subcount.label}: </span>
                <span className="font-medium">{subcount.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {alert && (
          <div className={`text-sm text-${color === 'amber' ? 'red' : color}-600 mb-3 flex items-center`}>
            <AlertCircle className="h-4 w-4 mr-1" />
            {alert}
          </div>
        )}
        
        <div className="mt-2">
          <Link 
            href={linkUrl} 
            className={`${colorClasses[color].split(' ').slice(1).join(' ')} hover:underline font-medium text-sm inline-flex items-center`}
          >
            {linkText}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

// 快速連結卡片元件
type QuickLinkCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'amber' | 'blue' | 'emerald' | 'rose' | 'indigo';
};

const QuickLinkCard = ({ title, description, icon, href, color }: QuickLinkCardProps) => {
  const colorClasses = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  };

  return (
    <Link 
      href={href}
      className={`${colorClasses[color]} border rounded-lg p-4 flex items-center hover:shadow-md transition-shadow`}
    >
      <div className="mr-3">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </Link>
  );
};
