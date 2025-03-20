'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// 定義導航選單結構
type MenuItem = {
  name: string;
  path: string;
  isClickable?: boolean;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  { name: 'HOME PAGE 首頁', path: '/', isClickable: true },
  { 
    name: 'ABOUT 關於邦瓏', 
    path: '/about',
    isClickable: false,
    children: [
      { name: '緣起邦瓏', path: '/about' },
      { name: '企業精神', path: '/about/spirit' },
      { name: '品牌願景', path: '/about/vision' },
      { name: '相關企業', path: '/about/related' }
    ]
  },
  { 
    name: 'ARCH 城市美學', 
    path: '/arch/new',
    isClickable: false,
    children: [
      { name: '新案鑑賞', path: '/arch/new' },
      { name: '歷年經典', path: '/arch/classic' },
      { name: '未來計畫', path: '/arch/future' }
    ]
  },
  { 
    name: 'DEVICE 知識中心', 
    path: '/device',
    isClickable: false,
    children: [
      { name: '維護保養', path: '/device/maintenance' }
    ]
  },
  { 
    name: 'SERVICE 尊榮售服', 
    path: '/service',
    isClickable: false,
    children: [
      { name: '交屋手冊', path: '/service/handbook' },
      { name: '售服流程', path: '/service/process' }
    ]
  },
  { name: 'CONTACT US 聯絡我們', path: '/contact', isClickable: true }
];

export default function NavBar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setOpenSubmenu(null);
  };

  const toggleSubmenu = (path: string) => {
    if (openSubmenu === path) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(path);
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/95'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-32">
          {/* 品牌 Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-[#40220f]">
              <div className="relative w-40 h-16">
                <Image 
                  src="/logo.svg" 
                  alt="邦瓏建設" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            </span>
          </Link>

          {/* 桌面選單 - 隱藏在手機上 */}
          <nav className="hidden lg:flex space-x-1 h-full relative">
            {menuItems.map((item, index) => (
              <div key={item.path} className="relative group flex h-full items-center">
                {item.isClickable ? 
                  <>
                  <Link
                    href={item.path}
                    className={`px-2 py-1 block text-sm font-medium transition-colors duration-200 hover:bg-[#a48b78] hover:text-white ${
                      isActive(item.path) 
                        ? 'bg-[#a48b78] text-white' 
                        : 'text-[#3e3a39]'
                    }`}
                  >
                    {item.name}
                  </Link>
                  </>
                  :
                  <>
                  <p className={`px-2 py-1 block text-sm font-medium transition-colors duration-200 hover:bg-[#a48b78] hover:text-white ${
                      isActive(item.path) 
                        ? 'bg-[#a48b78] text-white' 
                        : 'text-[#3e3a39]'
                    }`}>
                  {item.name}
                  </p>
                  </>
                  }

                {/* 子選單 */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute left-0 top-full bg-[#a48b78] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className="block ps-2 pe-8 py-2 text-[#40220f] hover:text-white text-sm transition-colors duration-200"
                      >
                        ・{child.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* 添加分隔線，最後一個項目後面不添加 */}
                {index < menuItems.length - 1 && (
                  <div className="h-4 border-r border-[#3e3a39] self-center mx-2"></div>
                )}
              </div>
            ))}
          </nav>

          {/* 手機選單按鈕 */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-[#40220f] focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 手機選單 */}
      <div
        className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: '8rem' }}
      >
        <nav className="h-full overflow-y-auto pb-20 pt-5">
          <div className="px-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.path}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.path}
                    onClick={() => {
                      if (!item.children) {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`py-3 block text-base font-medium ${
                      isActive(item.path) ? 'text-[#a48b78]' : 'text-[#3e3a39]'
                    }`}
                  >
                    {item.name}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <button
                      onClick={() => toggleSubmenu(item.path)}
                      className="p-2 focus:outline-none"
                      aria-label="Toggle submenu"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          openSubmenu === item.path ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                  )}
                </div>

                {/* 子選單 */}
                {item.children && openSubmenu === item.path && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#a48b78]">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 pl-4 text-sm text-[#3e3a39]"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}