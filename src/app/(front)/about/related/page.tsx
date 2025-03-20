import Breadcrumb from '@/components/front/Breadcrumb';
import ContentBlock from '@/components/front/ContentBlock';

export default function RelatedPage() {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full">
        <Breadcrumb 
          parentTitle="關於邦瓏" 
          parentTitleEn="ABOUT" 
          currentTitle="相關企業" 
          parentPath="/about"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 左側麵包屑 - 只在桌面版顯示 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb 
            parentTitle="關於邦瓏" 
            parentTitleEn="ABOUT" 
            currentTitle="相關企業" 
            parentPath="/about"
          />
        </div>
        
        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8">
          <section className='flex justify-center'>
            <ContentBlock 
              layout="text-above-image"
              ImageClassName="lg:max-w-3/4 [&>div]:pt-[25%] [&_img]:object-contain"
              imageSrc="/images/about/04.svg"
              imageAlt="邦瓏建設相關企業"
              TextClassName="max-w-1/2 [&_h3]:text-center"
              title1="全方位生活美學集團"
              text1="累積並整合多元的跨產業開發量能，是「邦瓏建設」穩健發展的堅實後盾，做為國內知名的全方位生活美學集團，我們肩負著為建築界創造嶄新風貌與典範的使命，並為每一位相信我們的客戶，打造堅實安心、值得信賴的優質住宅，為他們構築美好的生活願景。"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
