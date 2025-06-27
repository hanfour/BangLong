'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/types/global';

type ProjectCarouselProps = {
  projects: Project[];
  initialIndex?: number;
};

export default function ProjectCarousel({ projects, initialIndex = 0 }: ProjectCarouselProps) {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(initialIndex);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProjectTransitioning, setIsProjectTransitioning] = useState(false);

  const currentProject = projects[currentProjectIndex];
  const images = currentProject?.images || [];

  // --- 專案切換邏輯 ---
  const selectProject = useCallback((index: number) => {
    if (isProjectTransitioning) return;
    if (index === currentProjectIndex) return;

    setIsProjectTransitioning(true);
    setCurrentProjectIndex(index);
    setCurrentImageIndex(0); // 切換專案時，重置圖片索引

    setTimeout(() => {
      setIsProjectTransitioning(false);
    }, 500); // 轉場動畫時間
  }, [isProjectTransitioning, currentProjectIndex]);

  const nextProject = useCallback(() => {
    selectProject((currentProjectIndex + 1) % projects.length);
  }, [selectProject, currentProjectIndex, projects.length]);

  // --- 圖片切換邏輯 ---
  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  // --- 自動播放 ---
  // 自動播放專案
  useEffect(() => {
    if (projects.length <= 1) return;
    const projectInterval = setInterval(nextProject, 7000); // 每 7 秒切換一次專案
    return () => clearInterval(projectInterval);
  }, [projects.length, nextProject]);

  // 自動播放圖片
  useEffect(() => {
    if (images.length <= 1) return;
    const imageInterval = setInterval(nextImage, 4000); // 每 4 秒切換一次圖片
    return () => clearInterval(imageInterval);
  }, [images.length, nextImage, currentProjectIndex]); // 當專案切換時，重置計時器

  // --- 渲染 ---
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">載入建案資訊中...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 主要輪播內容 */}
      <div className="relative w-full h-full">
        {/* 背景圖片 */}
        <div className={`relative pt-[56.25%] lg:pt-0 lg:absolute inset-0 transition-opacity duration-500 bg-white/80 ${isProjectTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          {images.length > 0 ? (
            <Image
              key={currentProject.id + '-' + images[currentImageIndex].id} // 確保圖片和專案切換時，組件能重新渲染
              src={images[currentImageIndex].imageUrl}
              alt={currentProject.title}
              fill
              className="object-contain object-center"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p>沒有可顯示的圖片</p>
            </div>
          )}
        </div>

        {/* 建案資訊 */}
        <div className="relative lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-16 max-w-md p-6 bg-white/80 backdrop-blur-sm rounded-lg">
          <h2 className="text-2xl lg:text-3xl text-[#956134] mb-4 border-b border-[#956134] pb-2">
            {currentProject.title}
          </h2>
          {currentProject.description && (
            <p className="text-gray-700 mb-4">{currentProject.description}</p>
          )}
          {currentProject.details?.items && (
            <div className="space-y-2">
              {currentProject.details.items.map((item, index) => (
                <ProjectDetail key={index} label={item.label} value={item.value} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 圖片導航按鈕 */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute hidden sm:block left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all z-10"
            aria-label="上一張圖片"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute hidden sm:block right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all z-10"
            aria-label="下一張圖片"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* 專案輪播指示器 */}
      {projects.length > 1 && (
        <div className="absolute bottom-6 right-8 flex space-x-3 z-10">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => selectProject(index)}
              className={`w-2 h-2 rounded-full transition-all border border-[#956134] ${
                index === currentProjectIndex ? 'bg-[#956134] scale-125' : 'bg-white hover:bg-white/70'
              }`}
              aria-label={`移至第 ${index + 1} 個建案`}
            />
          ))}
        </div>
      )}
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