'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/front/Breadcrumb';
import ProjectCarousel from '@/components/front/ProjectCarousel';
import { Project } from '@/types/global';
import { Loader2 } from 'lucide-react';

export default function NewProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取新案建設專案
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 實際環境中這裡會從 API 獲取數據
        // const response = await fetch('/api/projects?category=new');
        // const data = await response.json();
        // setProjects(data.projects);
        
        // 目前使用假資料
        const mockProjects: Project[] = [
          {
            id: 'project1',
            title: '邦瓏雍玥',
            description: '',
            category: 'new',
            imageUrl: '/images/projects/project1.jpg',
            details: {
              items: [
                { label: '', value: '新莊區合鳳段︱129、133、134地號' },
                { label: '基地坪數', value: '1436坪' },
                { label: '樓層規劃', value: '23F、24F／B6' },
              ]
            },
            order: 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        ];
        
        setProjects(mockProjects);
      } catch (err) {
        console.error('Error fetching new projects:', err);
        setError('無法獲取建案資訊，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] lg:h-[calc(100vh-220px)] min-h-[500px]">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full mb-4">
        <Breadcrumb 
          parentTitle="城市美學" 
          parentTitleEn="ARCH" 
          currentTitle="新案鑑賞" 
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
            currentTitle="新案鑑賞" 
            parentPath="/arch"
          parentIsClickable={false}
          />
        </div>
        
        {/* 右側輪播內容 */}
        <div className="w-full lg:flex-1 lg:pl-8 h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
              <span className="ml-2 text-gray-600">載入建案資訊...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="h-full overflow-hidden">
              <ProjectCarousel projects={projects} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}