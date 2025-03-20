'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
// import Link from 'next/link';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/types/global';

type ProjectCarouselProps = {
  projects: Project[];
  initialIndex?: number;
};

export default function ProjectCarousel({ projects, initialIndex = 0 }: ProjectCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  // 確保 projects 非空
  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">目前沒有可顯示的建案</p>
      </div>
    );
  }

  const isSingleProject = projects.length === 1;
  const currentProject = projects[currentIndex];

  // 處理前進
  const nextSlide = useCallback(() => {
    if (isTransitioning || isSingleProject) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    
    // 設定轉場動畫時間
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning, projects.length]);

  // 處理後退
  const prevSlide = useCallback(() => {
    if (isTransitioning || isSingleProject) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
    
    // 設定轉場動畫時間
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning, projects.length]);

  // 自動播放輪播
  useEffect(() => {
    if(isSingleProject) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 7000); // 每7秒切換一次
    
    return () => clearInterval(interval);
  }, [nextSlide]);

  // 處理觸控滑動
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;

    setTouchStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioning) return;

    setTouchEndX(e.touches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (isTransitioning) return;

    if (touchStartX - touchEndX > 50) {
      // 向左滑動
      nextSlide();
    } else if (touchEndX - touchStartX > 50) {
      // 向右滑動
      prevSlide();
    }
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 主要輪播內容 */}
      <div className="relative w-full h-full">
        {/* 背景圖片 */}
        <div
          className={`relative pt-[56.25%] lg:pt-0 lg:absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <Image
            src={currentProject.imageUrl}
            alt={currentProject.title}
            fill
            className="object-cover object-center"
            priority
          />
          {/* <div className="absolute inset-0 bg-black bg-opacity-20"></div> */}
        </div>

        {/* 建案資訊 */}
        <div className="relative lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-16 max-w-md p-6">
          <h2 className="text-2xl lg:text-3xl text-[#956134] mb-4 border-b border-[#956134] pb-2">
            {currentProject.title}
          </h2>
          
          {currentProject.description && (
            <p className="text-gray-700 mb-4">{currentProject.description}</p>
          )}
          
          {currentProject.details && currentProject.details.items && (
            <div className="space-y-2">
              {currentProject.details.items.map((item, index) => (
                <ProjectDetail 
                  key={`detail-${index}`} 
                  label={item.label} 
                  value={item.value} 
                />
              ))}
            </div>
          )}
          
          {/* <Link 
            href={`/arch/project/${currentProject.id}`} 
            className="mt-6 inline-block px-6 py-2 bg-[#a48b78] text-white rounded hover:bg-[#40220f] transition-colors"
          >
            查看更多
          </Link> */}
        </div>
      </div>

      {/* 導航按鈕 */}
      {/* <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 text-white hover:bg-white/50 backdrop-blur-sm transition-all"
        aria-label="上一個專案"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 text-white hover:bg-white/50 backdrop-blur-sm transition-all"
        aria-label="下一個專案"
      >
        <ChevronRight className="w-6 h-6" />
      </button> */}

      {/* 輪播指示器 */}
      <div className="absolute bottom-6 right-8 flex space-x-3">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => {
                  setIsTransitioning(false);
                }, 500);
              }
            }}
            className={`w-2 h-2 rounded-full transition-all border border-[#956134] ${
              index === currentIndex ? 'bg-[#956134] scale-125' : 'bg-white hover:bg-white/70'
            }`}
            aria-label={`移至第 ${index + 1} 個建案`}
          />
        ))}
      </div>
    </div>
  );
}

// 建案詳情項目組件
function ProjectDetail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  
  return (
    <div className="flex text-black text-sm/7">
      <span>・</span>
      {label && (
        <>
          <span className="">{label}</span>
          <span className="">｜</span>
        </>
      )}
      <span className="">{value}</span>
    </div>
  );
}