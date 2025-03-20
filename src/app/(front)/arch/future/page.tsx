'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/front/Breadcrumb';
import ContentBlock from '@/components/front/ContentBlock';
import { Project } from '@/types/global';
import { Loader2 } from 'lucide-react';



export default function FutureProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取未來計畫專案
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 實際環境中這裡會從 API 獲取數據
        // const response = await fetch('/api/projects?category=future');
        // const data = await response.json();
        // setProjects(data.projects);
        
        // 目前使用假資料
        const mockProjects: Project[] = [
          {
            id: 'future1',
            title: '汐止．十五甲規劃案',
            description: '',
            category: 'future',
            imageUrl: '/images/projects/project4.jpg',
            details: {
              items: []
            },
            order: 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        ];
        
        setProjects(mockProjects);
      } catch (err) {
        console.error('Error fetching future projects:', err);
        setError('無法獲取未來計畫資訊，請稍後再試');
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
          currentTitle="未來計畫" 
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
            currentTitle="未來計畫" 
            parentPath="/arch"
          parentIsClickable={false}
          />
        </div>
        
        {/* 右側内容 */}
        <div className="w-full lg:flex-1 lg:pl-8 pb-12">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
              <span className="ml-2 text-gray-600">載入未來計畫資訊...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="w-full">
              {/* 垂直排列的未來計畫項目列表 */}
              <div className="space-y-12">
                {projects.map((project) => (
                  <ContentBlock 
                    key={project.id} 
                    layout="image-left-text"
                    imageSrc={project.imageUrl}
                    imageAlt={project.title}
                    title1={project.title}
                    text1={project.description}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
