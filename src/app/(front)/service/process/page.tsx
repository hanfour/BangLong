'use client';

import Breadcrumb from '@/components/front/Breadcrumb';
import Image from 'next/image';

export default function ProcessPage() {

  return (
    <div className="flex flex-col lg:flex-row">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full mb-4">
        <Breadcrumb 
          parentTitle="尊榮售服" 
          parentTitleEn="SERVICE" 
          currentTitle="售服流程" 
          parentPath="/service"
          parentIsClickable={false}
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 左側麵包屑 - 只在桌面版顯示 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb 
            parentTitle="尊榮售服" 
            parentTitleEn="SERVICE" 
            currentTitle="售服流程" 
            parentPath="/service"
          parentIsClickable={false}
          />
        </div>
        
        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8 h-full">
          <Image
            src="/images/process/01.svg"
            alt="售服流程"
            width={800}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}