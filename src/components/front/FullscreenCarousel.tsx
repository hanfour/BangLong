'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSwipeable } from 'react-swipeable';

// 輪播圖片類型定義
type CarouselItem = {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  order: number;
  isActive: boolean;
  textPosition: string; // topLeft, topCenter, topRight, centerLeft, center, centerRight, bottomLeft, bottomCenter, bottomRight
  textDirection: string; // horizontal, vertical
};

// 根據設置的位置返回適當的 CSS 類
function getPositionClasses(position: string): string {
  switch(position) {
    // 頂部位置
    case 'topLeft':
      return 'items-start justify-start text-left pt-16 lg:pt-36 pl-16 lg:pl-32';
    case 'topCenter':
      return 'items-start justify-center text-center pt-16';
    case 'topRight':
      return 'items-start justify-end text-right pt-16 lg:pt-36 pr-16 lg:pr-32';
    
    // 中部位置
    case 'centerLeft':
      return 'items-center justify-start text-left pl-16 lg:pl-32';
    case 'center':
      return 'items-center justify-center text-center';
    case 'centerRight':
      return 'items-center justify-end text-right pr-16 lg:pr-32';
    
    // 底部位置
    case 'bottomLeft':
      return 'items-end justify-start text-left pb-16 lg:pb-36 pl-16 lg:pl-32';
    case 'bottomCenter':
      return 'items-end justify-center text-center pb-16';
    case 'bottomRight':
      return 'items-end justify-end text-right pb-16 lg:pb-36 pr-16 lg:pr-32';
    
    default:
      return 'items-center justify-center text-center';
  }
}

interface FullscreenCarouselProps {
  carouselItems: CarouselItem[];
  loading?: boolean;
}

export default function FullscreenCarousel({ carouselItems, loading = false }: FullscreenCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // 切換到下一張幻燈片
  const nextSlide = useCallback(() => {
    if (isAnimating || carouselItems.length === 0) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    
    // 動畫完成後重置狀態
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000); // 與 CSS 過渡時間匹配
  }, [isAnimating, carouselItems.length]);

  // 滑動處理
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    trackMouse: true,
    preventScrollOnSwipe: true,
    swipeDuration: 500,
    delta: 50, // 最小滑動距離才觸發
  });

  // 切換到上一張幻燈片
  const prevSlide = useCallback(() => {
    if (isAnimating || carouselItems.length === 0) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
    
    // 動畫完成後重置狀態
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000); // 與 CSS 過渡時間匹配
  }, [isAnimating, carouselItems.length]);

  // 直接跳到指定幻燈片
  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex || carouselItems.length === 0) return;
    
    setIsAnimating(true);
    setCurrentIndex(index);
    
    // 動畫完成後重置狀態
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000); // 與 CSS 過渡時間匹配
  };

  // 自動播放
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoplay && carouselItems.length > 1) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000); // 每 5 秒切換一次
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoplay, nextSlide, carouselItems.length]);

  // 暫停/恢復自動播放
  const toggleAutoplay = () => {
    setIsAutoplay(!isAutoplay);
  };

  // 加載中顯示
  if (loading) {
    return (
      <div className="relative h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white">載入中...</div>
      </div>
    );
  }

  // 無數據或發生錯誤
  if (carouselItems.length === 0) {
    return (
      <div className="relative h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white">尚無輪播項目</div>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen w-full overflow-hidden cursor-grab active:cursor-grabbing"
      {...swipeHandlers}
    >
      {/* 輪播圖片 */}
      {carouselItems.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* 背景圖片 */}
          <div className="absolute inset-0">
            <Image
              src={item.imageUrl}
              alt={item.title || '輪播圖片'}
              fill
              className="object-cover"
              priority={index === 0}
              draggable={false}
            />
            <div className="!hidden absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
          
          {/* 文字內容 - 重新設計容器結構 */}
          <div 
            className={`absolute inset-0 flex ${getPositionClasses(item.textPosition)}`}
          >
            <div 
              className={`px-4 max-w-4xl text-[#6a3906] ${item.textDirection === 'vertical' ? 'writing-vertical' : ''}`}
            >
              {item.title && (
                <h2 className={`
                  text-2xl lg:text-3xl lg:text-4xl font-bold tracking-[0.2em] mb-4 animate-fadeIn
                  ${item.textDirection === 'vertical' ? 'vertical-text' : ''}
                `}>
                  {item.title}
                </h2>
              )}
              {item.description && (
                <p className={`
                  text-lg lg:text-xl mb-8 animate-fadeIn animation-delay-300
                  ${item.textDirection === 'vertical' ? 'vertical-text' : ''}
                `}>
                  {item.description}
                </p>
              )}
              {item.linkUrl && (
                <Link
                  href={item.linkUrl}
                  className="inline-block px-6 py-3 bg-[#a48b78] text-white rounded hover:bg-[#40220f] transition-colors duration-300 animate-fadeIn animation-delay-500"
                >
                  {item.linkText || '了解更多'}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* 導航按鈕 */}
      {/* {carouselItems.length > 1 && (
        <div className="absolute left-0 right-0 bottom-0 top-0 z-20 flex items-center justify-between px-4">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-300 focus:outline-none"
            aria-label="上一張"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-300 focus:outline-none"
            aria-label="下一張"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )} */}

      {/* 輪播指示器 */}
      {carouselItems.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center">
          <div className="flex space-x-3">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#956134] scale-125'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`跳到第 ${index + 1} 張幻燈片`}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* 自動播放控制 */}
      {carouselItems.length > 1 && (
        <button
          onClick={toggleAutoplay}
          className="absolute bottom-5 right-5 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-300 focus:outline-none"
          aria-label={isAutoplay ? '暫停自動播放' : '開始自動播放'}
        >
          {isAutoplay ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}