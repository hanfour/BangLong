import Breadcrumb from '@/components/front/Breadcrumb';
import ContentBlock from '@/components/front/ContentBlock';

export default function SpiritPage() {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full">
        <Breadcrumb 
          parentTitle="關於邦瓏" 
          parentTitleEn="ABOUT" 
          currentTitle="企業精神" 
          parentPath="/about"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 左側麵包屑 - 只在桌面版顯示 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb 
            parentTitle="關於邦瓏" 
            parentTitleEn="ABOUT" 
            currentTitle="企業精神" 
            parentPath="/about"
          />
        </div>
        
        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8">
          <section>
            <ContentBlock 
              layout="image-left-text"
              imageSrc="/images/about/02.jpg"
              imageAlt="邦瓏建設理念"
              ImageClassName="lg:!w-5/12"
              title1="承載故事．滿載幸福的家園"
              text1="以豐富的房地產開發經驗為底韻，邦瓏建設始終秉持「誠信、品質、創新、傳承」的核心價值，懷抱對土地深厚濃郁的情感，賦予每一塊土地獨特的生命力與價值。我們深信每一處土地都有屬於它的故事，而建築的意義，不僅是為人們提供一個安居之所，更是延續幸福生活故事的載體。邦瓏建設以誠摯的心，精心打造溫馨、安心的心靈港灣，讓建築成為傳承過去、現在與未來的時代印記。"
              title2="以細節創造完美．用溫度感動人心"
              text2="邦瓏建設從土地開發、設計規劃、縝密施工到售後服務，皆由專業且熱忱的團隊精心把關。對我們而言，創造價值比追求利益更為重要。我們不僅注重建築的外在美，更重視其內在的實用性與舒適性，力求每一處細節都能打動人心。我們追求的，是能夠真正融入居住者生活的空間，讓建築不僅僅是冰冷的鋼筋水泥，而是充滿溫度、溫暖人心的家園。 "
            />
          </section>
        </div>
      </div>
    </div>
  );
}
