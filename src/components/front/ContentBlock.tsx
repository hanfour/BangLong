'use client';

import React from 'react';
import Image from 'next/image';

type ContentBlockProps = {
  layout: 'image-left-text' |      // 1. 左邊有圖片, 右邊文字
         'text-above-image' |      // 3. 文字在上面有一段, 下面有圖片
         'image-above-text' ;      // 5. 上面有圖片, 下面有文字一段
  imageSrc: string;                    // 圖片路徑
  imageAlt: string;                    // 圖片替代文字
  title1?: string;                      // 第一段標題 (可選)
  text1?: string;                       // 第一段文字
  title2?: string;                      // 第二段標題 (可選)
  text2?: string;                      // 第二段文字 (可選)
  className?: string;                  // 額外的CSS類別 (可選)
  ImageClassName?: string;             // 圖片的CSS類別 (可選)
  TextClassName?: string;              // 文字的CSS類別 (可選)
};

export default function ContentBlock({
  layout,
  imageSrc,
  imageAlt,
  title1,
  text1,
  title2,
  text2,
  className = '',
  ImageClassName = '',
  TextClassName = '',
}: ContentBlockProps) {
  // 布局類型1: 左邊有圖片, 右邊文字
  if (layout === 'image-left-text') {
    return (
      <div className={`mb-12 ${className}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-14">
          {/* 圖片區塊 - 在手機版佔滿寬度，桌機版佔左側 */}
          <div className={`w-full lg:w-7/12 mb-8 lg:mb-0 ${ImageClassName}`}>
            <div className="relative w-full pt-[75%] lg:pt-[66.67%] overflow-hidden">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          {/* 文字區塊 - 手機版在圖片下方，桌機版在右側 */}
          <div className={`w-full lg:flex-1 ${TextClassName}`}>
            {title1 && (
              <h3 className="text-xl text-[#a48b78] mb-4">{title1}</h3>
            )}
            {text1 && (
              <p className="text-black text-sm/7">{text1}</p>
            )}
            {title2 && (
              <h3 className="text-xl text-[#a48b78] mt-16 mb-4">{title2}</h3>
            )}
            {text2 && (
              <p className="text-black text-sm/7">{text2}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // 布局類型3: 文字在上面, 下面有圖片
  if (layout === 'text-above-image') {
    return (
      <div className={`mb-12 ${className}`}>
        <div className="flex flex-col items-center">
          {/* 文字區塊 */}
          <div className={`w-full mb-8 ${TextClassName}`}>
            {title1 && (
              <h3 className="text-xl text-[#a48b78] mb-4">{title1}</h3>
            )}
            {text1 && (
              <p className="text-black text-sm/7">{text1}</p>
            )}
            {title2 && (
              <h3 className="text-xl text-[#a48b78] mt-16 mb-4">{title2}</h3>
            )}
            {text2 && (
              <p className="text-black text-sm/7">{text2}</p>
            )}
          </div>
          
          {/* 圖片區塊 */}
          <div className={`w-full ${ImageClassName}`}>
            <div className="relative w-full pt-[56.25%] overflow-hidden">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 布局類型5: 上面有圖片, 下面有文字
  if (layout === 'image-above-text') {
    return (
      <div className={`mb-12 ${className}`}>
        <div className="flex flex-col items-center">
          {/* 圖片區塊 */}
          <div className={`w-full mb-8 ${ImageClassName}`}>
            <div className="relative w-full pt-[56.25%] overflow-hidden">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </div>
          </div>
          {/* 文字區塊 */}
          <div className={`w-full ${TextClassName}`}>
            {title1 && (
              <h3 className="text-xl text-[#a48b78] mb-4">{title1}</h3>
            )}
            {text1 && (
              <p className="text-black text-sm/7">{text1}</p>
            )}
            {title2 && (
              <h3 className="text-xl text-[#a48b78] mt-16 mb-4">{title2}</h3>
            )}
            {text2 && (
              <p className="text-black text-sm/7">{text2}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // 默認返回空元素（防止類型錯誤）
  return null;
}