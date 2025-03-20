import Breadcrumb from '@/components/front/Breadcrumb';
import ContentBlock from '@/components/front/ContentBlock';

export default function VisionPage() {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full">
        <Breadcrumb 
          parentTitle="關於邦瓏" 
          parentTitleEn="ABOUT" 
          currentTitle="品牌願景" 
          parentPath="/about"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 左側麵包屑 - 只在桌面版顯示 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb 
            parentTitle="關於邦瓏" 
            parentTitleEn="ABOUT" 
            currentTitle="品牌願景" 
            parentPath="/about"
          />
        </div>
        
        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8">
          <section>
            <ContentBlock 
              layout="image-left-text"
              imageSrc="/images/about/03.jpg"
              imageAlt="邦瓏建設理念"
              ImageClassName="lg:!w-5/12"
              title1="職人精神-專注品質．極致用心"
              text1="在邦瓏建設，每一位團隊成員都懷抱著職人精神，致力於提供細緻而真誠的服務。我們始終堅信，建築的價值在於滿足人們生活的真實需求，而非財富資產的累積。因此，我們對每一個微小的細節，都極為重視，從建築材質的嚴選，到一絲不苟的施工流程，無不精益求精，追求完美，每座建築視為未來自己的家，以極致的用心，只為讓每位居住者感受到我們的真心與誠意。"
              title2="永續發展．永久承諾"
              text2="展望未來，邦瓏建設將持續關注環境永續發展，以人文情懷與專業態度，致力於為社會創造更美好的生活環境。我們將一如既往地堅持「嚴謹、安心、厚實」，以追求完美的極致精神，為更多家庭構築幸福的家園，不僅是對品質的堅持，更是對未來的責任。"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
