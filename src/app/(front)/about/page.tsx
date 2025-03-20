import Breadcrumb from '@/components/front/Breadcrumb';
import ContentBlock from '@/components/front/ContentBlock';

export default function AboutPage() {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full">
        <Breadcrumb 
          parentTitle="關於邦瓏" 
          parentTitleEn="ABOUT" 
          currentTitle="緣起邦瓏" 
          parentPath="/about"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 左側麵包屑 - 只在桌面版顯示 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb 
            parentTitle="關於邦瓏" 
            parentTitleEn="ABOUT" 
            currentTitle="緣起邦瓏" 
            parentPath="/about"
          />
        </div>
        
        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8">
          <section>
            <ContentBlock 
              layout="image-left-text"
              imageSrc="/images/about/01.jpg"
              imageAlt="邦瓏建設理念"
              title1="傳承工藝．勇於創新"
              text1="「邦瓏建設」承襲「鴻邦集團」—「穩重專業，認真踏實」之企業精神，由一群在房地產業執業多年之專才組成，尊重在地文化價值，秉持豐富經驗和專業知識，以卓越品質和創新設計，為客戶打造理想的居住環境。"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
