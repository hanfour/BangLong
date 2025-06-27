'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/front/Breadcrumb';
import { Project } from '@/types/global';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

// 瀑水流項目組件
function ProjectCard({ project }: { project: Project }) {
  const detailItems = project.details?.items || [];
  
  return (
    <div className="flex flex-col h-full overflow-hidden group">
      {/* 項目圖片 - 圖片區塊會有放大效果 */}
      <div className="relative w-full pt-[70%] overflow-hidden">
        <Image
          src={project.images && project.images.length > 0 ? project.images[0].imageUrl : '/images/placeholder.jpg'}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover object-center transition-transform group-hover:scale-105 duration-500"
          priority={project.order <= 4} // 優先加載前四個項目的圖片
        />
      </div>
      
      {/* 項目文字內容 */}
      <div className="p-4 text-center text-black">
        {/* 項目名称 */}
        <h3 className="text-xl text-[#a48b78] mb-3 border-b border-[#a48b78] pb-2 transition-colors group-hover:font-medium">
          {project.title}
        </h3>
        
        {/* 項目簡短描述 */}
        {project.description && (
          <p className="text-sm mb-3 line-clamp-2">{project.description}</p>
        )}
        
        {/* 項目詳情 */}
        {detailItems.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {detailItems.map((item, index) => (
              <div key={index} className="flex text-sm justify-center">
                {item.label ? (
                  <>
                    <span className="">{item.label}</span>
                    <span className="">｜</span>
                  </>
                ) : null}
                <span className="">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClassicProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取歷年經典專案
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 從 API 獲取經典專案數據
        const response = await fetch('/api/projects?category=classic');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '獲取專案失敗');
        }
        
        // 只要已啟用的專案
        const activeProjects = data.projects.filter((project: Project) => project.isActive);
        setProjects(activeProjects);
      } catch (err) {
        console.error('Error fetching classic projects:', err);
        setError('無法獲取建案資訊，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)] lg:min-h-[calc(100vh-220px)]">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full mb-4">
        <Breadcrumb 
          parentTitle="城市美學" 
          parentTitleEn="ARCH" 
          currentTitle="歷年經典" 
          parentPath="/arch"
          parentIsClickable={false}
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 左側麵包屑 - 只在桌面版顯示 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb 
            parentTitle="城市美學" 
            parentTitleEn="ARCH" 
            currentTitle="歷年經典" 
            parentPath="/arch"
            parentIsClickable={false}
          />
        </div>
        
        {/* 右側瀑水流內容 */}
        <div className="w-full lg:flex-1 lg:pl-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
              <span className="ml-2 text-gray-600">載入建案資訊...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 bg-gray-100">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="w-full pb-12">
              {/* 响應式瀑水流布局 
                - 手機顯示一列 (默認)
                - 平板及中等屏幕(sm: >640px)顯示兩列
                - 大屏幕(xl: >1280px)維持兩列
                - 超大屏幕(2xl: >1536px, 接近2K)顯示三列
                - 自定義的4k超大屏幕(>1920px)顯示四列
              */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
                {projects.map((project) => (
                  <div key={project.id} className="overflow-hidden">
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
              
              {/* 自定義媒體查詢，處理超大屏幕(>1920px)的情況 */}
              <style jsx>{`
                @media (min-width: 1920px) {
                  .grid {
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                  }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}