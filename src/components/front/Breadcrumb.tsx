'use client';

import React from 'react';
import Link from 'next/link';

type BreadcrumbProps = {
  parentTitle: string; // 母選單中文名稱
  parentTitleEn: string; // 母選單英文名稱
  currentTitle: string; // 子選單中文名稱
  parentPath: string; // 母選單路徑
  parentIsClickable?: boolean; // 母選單是否可點擊
};

export default function Breadcrumb({ parentTitle, parentTitleEn, currentTitle, parentPath, parentIsClickable = true }: BreadcrumbProps) {

  return (
    <>
      {/* 桌面版垂直麵包屑 - 僅在中型及以上螢幕顯示 */}
      <div className="hidden lg:flex flex-col items-center">
        {/* 母選單中文名稱 */}
        {parentIsClickable ?
          <>
            <Link 
              href={parentPath} 
              className="text-xl font-bold text-[#3e3a39] tracking-[0.5em] mb-1 hover:text-[#a48b78] transition-colors"
            >
              {parentTitle}
            </Link>
          </> :
          <>
            <p 
              className="text-xl font-bold text-[#3e3a39] tracking-[0.5em] mb-1"
            >
              {parentTitle}
            </p>
          </>}
        
        {/* 母選單英文名稱 */}
        <div className="text-xl text-[#3e3a39] tracking-widest font-medium mb-1">
          {parentTitleEn}
        </div>
        
        {currentTitle && (
          <>
            {/* 直式線條 */}
            <div className="h-20 w-px bg-[#3e3a39] my-4"></div>
            
            {/* 子選單中文名稱 */}
            <div className="text-base font-normal text-[#3e3a39] tracking-[0.5em]">
              {currentTitle}
            </div>
          </>
        )}
      </div>

      {/* 手機版水平麵包屑 - 僅在小於中型螢幕顯示 */}
      <div className="lg:hidden flex flex-wrap items-center mb-16">
        {/* 母選單中文名稱 */}
        <Link 
          href={parentPath} 
          className="text-xs font-bold text-[#3e3a39] hover:text-[#a48b78] transition-colors"
        >
          {parentTitle}
        </Link>
        
        {/* 空格 */}
        <span className="mx-1"></span>
        
        {/* 母選單英文名稱 */}
        <span className="text-xs text-[#3e3a39] font-medium">
          {parentTitleEn}
        </span>
        
        {currentTitle && (
          <>
            {/* 分隔線 */}
            <span className="ms-2 me-3 text-[#3e3a39]">/</span>
            {/* 子選單中文名稱 */}
            <span className="text-xs font-bold text-[#3e3a39]">
              {currentTitle}
            </span>
          </>
        )}
        
        
      </div>
    </>
  );
}
