import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  Home, 
  Image, 
  Building, 
  FileText, 
  MessageCircle, 
  Users, 
  LogOut, 
  Menu,
  X,
  Settings
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);

  const navItems = [
    { name: '首頁儀表板', path: '/admin/dashboard', icon: <Home className="w-5 h-5 mr-3" /> },
    { name: '首頁輪播', path: '/admin/carousel', icon: <Image className="w-5 h-5 mr-3" /> },
    {
      name: '建案管理',
      path: '/admin/projects',
      icon: <Building className="w-5 h-5 mr-3" />,
      subItems: [
        { name: '新案鑑賞', path: '/admin/projects?category=new' },
        { name: '歷年經典', path: '/admin/projects?category=classic' },
        { name: '未來計畫', path: '/admin/projects?category=future' }
      ]
    },
    { name: '交屋手冊', path: '/admin/handbooks', icon: <FileText className="w-5 h-5 mr-3" /> },
    { name: '客戶諮詢', path: '/admin/contacts', icon: <MessageCircle className="w-5 h-5 mr-3" /> },
    { name: '帳號管理', path: '/admin/users', icon: <Users className="w-5 h-5 mr-3" /> },
    { name: '網站設定', path: '/admin/settings', icon: <Settings className="w-5 h-5 mr-3" /> }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 行動裝置選單按鈕 */}
      <div className="fixed top-4 left-4 z-30 lg:hidden">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 bg-amber-800 text-white rounded-md"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 側邊欄 - 桌面版 */}
      <div className={`fixed lg:static w-64 h-screen bg-white shadow-md z-20 transition-transform duration-300 transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">邦隆建設後台</h1>
          {session?.user?.email && (
            <p className="text-sm text-gray-500 mt-2 truncate">{session.user.email}</p>
          )}
        </div>
        <nav className="mt-6 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link
                  href={item.path}
                  className={`flex items-center px-6 py-3 text-gray-600 hover:bg-amber-50 ${
                    pathname === item.path || pathname?.startsWith(item.path + '?') ? 'bg-amber-100 text-amber-800 font-medium' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>

                {/* 子選單 */}
                {item.subItems && (
                  <ul className="ml-8 mt-1 mb-2">
                    {item.subItems.map((subItem) => {
                      const isActive = pathname === subItem.path || pathname?.startsWith(subItem.path);
                      return (
                        <li key={subItem.path}>
                          <Link
                            href={subItem.path}
                            className={`flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-amber-50 ${
                              isActive ? 'text-amber-800 font-medium' : ''
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 bg-white">
          <button
            onClick={() => signOut({ 
              callbackUrl: '/admin/login',
              redirect: true
            })}
            className="w-full px-4 py-2 text-white bg-amber-800 rounded hover:bg-amber-900 flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" /> 登出
          </button>
        </div>
      </div>
      
      {/* 黑色背景覆蓋 - 僅在行動版選單開啟時顯示 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* 主要內容 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow z-10" onMouseLeave={() => setShowMenu(false)}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 ml-8 lg:ml-0">
              {navItems.find(item => pathname === item.path || pathname?.startsWith(item.path + '?'))?.name || '管理系統'}
            </h2>
            <div
              className="relative text-sm text-gray-600 cursor-pointer"
              onMouseEnter={() => setShowMenu(true)}
            >
              {session?.user?.name && (
                <span>您好，{session.user.name}</span>
              )}
              <div className={`absolute right-0 mt-4 py-2 w-40 bg-white border border-gray-200 rounded shadow-lg transition-opacity duration-200 z-20 ${showMenu ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className="absolute -top-2 right-4 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowChangePassword(true)}
                >
                  修改密碼
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => signOut({ callbackUrl: '/admin/login', redirect: true })}
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">修改密碼</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const oldPassword = (form.elements.namedItem('oldPassword') as HTMLInputElement).value;
                  const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                  const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

                  if (newPassword !== confirmPassword) {
                    alert('新密碼與確認密碼不一致');
                    return;
                  }

                  try {
                    const res = await fetch('/api/users/change-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ oldPassword, newPassword })
                    });

                    const data = await res.json();

                    if (!res.ok) {
                      alert(data.error || '修改失敗');
                      return;
                    }

                    alert('密碼修改成功');
                    setShowChangePassword(false);
                  } catch (error) {
                    console.error(error);
                    alert('發生錯誤，請稍後再試');
                  }
                }}
>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">舊密碼</label>
                <input
                  type="password"
                  name="oldPassword"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">新密碼</label>
                <input
                  type="password"
                  name="newPassword"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">確認新密碼</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-800 text-white hover:bg-amber-900"
                >
                  送出
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
