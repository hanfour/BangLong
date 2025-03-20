'use client';

import { useState } from 'react';
import Image from 'next/image';
import Breadcrumb from '@/components/front/Breadcrumb';
import { ChevronDown, Info } from 'lucide-react';

// 維護保養類型定義
type MaintenanceCategory = {
  id: string;
  title: string;
  contents: { text: string }[];
  images?: string[];
  hasImage?: boolean;
};

export default function MaintenancePage() {
  // 維護保養資料
  const maintenanceData: MaintenanceCategory[] = [
    {
      id: 'monitoring',
      title: 'A.監控(對講機)',
      contents: [
        { 
          text: '對講機以電纜配線至各戶，為確保通訊品質，請勿任意位移。'
        }
      ],
      hasImage: false
    },
    {
      id: 'doors-windows',
      title: 'B.門窗類',
      contents: [
        { 
          text: 'B-1︱台灣地區冬季氣溫變化劇烈，空氣潮濕，宅內外易造成溫差大。為避免門窗玻璃結露，應保持適度通風。',
        },
        { 
          text: 'B-2︱玻璃清潔不得使用強酸、強鹼或有機溶劑擦拭，防止玻璃表面受損。'
        },
        { 
          text: 'B-3︱後陽台三合一鋁門紗網拆卸與清潔。',
        }
      ],
      images: [
        '/images/maintenance/window.jpg'
      ],
      hasImage: true
    },
    {
      id: 'kitchen',
      title: 'C.廚具類',
      contents: [
        { 
          text: '廚具正常使用情況下，已具備防潮功能。清潔廚具時應注意'
        },
        { 
          text: 'C-1︱不得使用大量水或其他液體沖潑於廚身檯面。'
        },
        { 
          text: 'C-2︱不得使用強酸、強鹼或有機溶劑擦拭櫃身。'
        },
        { 
          text: 'C-3︱櫥身內外建議使用含有中性清潔劑擦拭櫃身，以抹布輕拭即可。'
        },
        { 
          text: 'C-4︱易燃性物品，勿放置於櫥櫃內。'
        },
        { 
          text: 'C-5︱倒熱油進水槽須先將冷水打開，再倒入熱油，以免損壞水槽及水管。'
        },
        { 
          text: 'C-6︱烤漆門板，簡易清潔以乾棉布擦拭，可除去灰塵，再以擰乾後之濕棉布稍微擦拭即可。'
        },
        { 
          text: 'C-7︱廚具龍頭清潔。'
        }
      ],
      images: [
        '/images/maintenance/kitchen.jpg'
      ],
      hasImage: true
    },
    {
      id: 'electrical',
      title: 'D.電氣類',
      contents: [
        { 
          text: 'D-1︱電氣'
        },
        { 
          text: 'D-1-1.各戶提供電壓為110v及220v，除冷氣電源(個案檢討)及廚房一只專用迴路為單相220 v，其餘均採單相110v。'
        },
        { 
          text: 'D-1-2.各戶電源來自電錶箱，電錶箱內有各戶之錶後開關，配管線至各戶總開關，再經各分路開關至各負載；其中浴室及廚房插座與洗衣機插座迴路系統接至ELCB，當此迴路任—出口受潮溼漏電時，均會使ELCB (指漏電斷路器）跳脫。'
        },
        { 
          text: 'D-1-3.開關面板多附有夜間指示燈。'
        },
        { 
          text: 'D-1-4.各戶電開關箱內有迴路線開關，若發現插頭無電，電燈不亮，可至分電箱檢示斷路器是否在開啟的位置，若在關閉的位置，將斷路器扳至ON處，再檢示燈具插座是否有電。斷路器或漏電斷路器跳脫復歸辦法，請機電技術人員檢視線路。'
        },
        { 
          text: 'D-1-5.各戶開關箱均附配線迴路圖及用途標示牌，標示其開關控制的器具。'
        },
        { 
          text: 'D-1-6.各戶均有預留冷氣穿樑套管，供以後住戶冷氣配管使用。'
        },
        { 
          text: 'D-1-7.發生停電時,各戶室內緊急電源設備ATS自檢說明。'
        },
        { 
          text: '\n'
        },
        { 
          text: 'D-2︱弱電'
        },
        { 
          text: 'D-2-1.電話出線口：分別在客廳及臥室牆上，各處管路都有連通，並配線至該樓層電話箱，申請安裝電話時，電信局人員於該層樓電話箱內連接即可，不用進入室內。向電信局申請電話，室內現採4 P (指四對電話線）電話線，其出線口採快速接頭安裝。'
        },
        { 
          text: 'D-2-2.電視出線口：分別在客廳及主臥室的牆上，此系統共同天線可接收TV訊號或第四台有線電視。'
        },
        { 
          text: 'D-2-3.對講機：客廳設有電視對講機，有室內機與訪客通話。'
        }
      ],
      hasImage: false
    },
    {
      id: 'wse',
      title: 'E.給水設備',
      contents: [
        { 
          text: '給排水與衛生設備' 
        },
        { 
          text: 'E-1︱樓層給水表閘門及洗臉盆、馬桶水箱三角凡而（指馬桶水箱止水閥），是否開啟。' 
        },
        { 
          text: 'E-2︱抽水馬達故障，請即通知管理人員。'
        },
        { 
          text: 'E-3︱水龍頭因雜質阻塞，請先開啟水龍頭之過濾網，清除雜物。' 
        }
      ],
      images: [
        '/images/maintenance/wse.jpg'
      ],
      hasImage: true
    },
    {
      id: 'drainage',
      title: 'F.排水設備',
      contents: [
        { 
          text: '排水阻塞原因及排除' 
        },
        { 
          text: 'F-1︱廚房等水槽勿將落水頭濾罩取掉，或讓易阻塞雜質流入孔內及不當使用而受阻。' 
        },
        { 
          text: 'F-2︱避免將衛生棉或衣物等物丟棄在馬桶內，致使管道堵塞。'
        },
        { 
          text: 'F-3︱水管或馬桶堵塞，以通管條或橡皮吸拔器或通樂疏通排水管。'
        },
        { 
          text: 'F-4︱排水孔應時常清除雜物(尤其花台、露台、陽台、地下室複壁之排水孔)。'
        }
      ],
      hasImage: false
    },
    {
      id: 'miscellaneous',
      title: 'G.雜項設備',
      contents: [
        { 
          text: 'G-1︱磁磚類產品' 
        },
        { 
          text: '釉面處理部份，請以中性清潔劑刷洗，保持亮麗如新。' 
        },
        { 
          text: 'G-2︱鐵件類產品'
        },
        { 
          text: 'G-2-1.不銹鋼檯面或物品，不建議使用菜瓜布或強酸清潔用品處理，避免破壞表面處理。'
        },
        { 
          text: 'G-2-2.水龍頭變黑可使用乾布沾麵粉擦拭。'
        },
        { 
          text: 'G-2-3.玄關門或鋁料，以擦拭水蠟清潔即可。'
        },
        { 
          text: 'G-2-4.不銹鋼欄杆可使用專用防護油擦拭。'
        }
      ],
      images: [
        '/images/maintenance/miscellaneous.jpg'
      ],
      hasImage: true
    },
    {
      id: 'stone',
      title: 'H.石材類',
      contents: [
        { 
          text: 'H-1︱日常清潔，可用家庭清潔劑或去污劑清除一般之水漬或污垢。每隔一段時間，可使用較強之清潔劑或綠色Scotch Brite易潔布洗擦，可保持人造石原有的光澤和美觀。(Scotch Brite是3M之產品，俗稱菜瓜布)。' 
        },
        { 
          text: 'H-2︱請勿以粗質菜瓜布或鋼絲球大力擦拭工作檯面、門板、把手或使用強酸(如鹽酸）、強鹼等清潔劑，以免刮傷表面或損及顏色及光澤度。' 
        },
        { 
          text: 'H-3︱人造石有很好的耐熱性，但勿將滾燙而底部焦黑之鍋盆直接置於檯面。如需放置，建議放置在耐高溫而隔熱之襯墊上，如：石棉質材襯墊、磁質襯墊或鋼製鐵架上。'
        },
        { 
          text: 'H-4︱雖然人造石結構堅硬，但亦不應該在檯面上切割東西，當砧板使用，或以刀叉、菜刀、鐵刷、銼刀等尖銳物敲擊，以避免檯面龜裂損傷。若不慎刮傷，可用細砂紙輕磨，然後以白色Scotch Brite易潔布清擦除去刀痕使之光滑如新。'
        },
        { 
          text: 'H-5︱人造石檯面因無毛細孔，清理很方便，一般污漬，如咖啡、葡萄汁、食物色素、墨汁等，都可用家庭清潔劑和清水抹潔。若不慎沾上頑固污漬，可用一些弱酸性家庭去污劑輕輕擦去。甚至乾了的指甲油，亦可以用去光水抹去。必要時，可用400密度的細砂紙輕輕打磨。'
        },
        {
          text: 'H-6︱香煙灼痕，對人造石檯面無損傷，煙灼痕跡可以用家庭去污劑、菜瓜布及細砂紙輕輕打磨，除去灼痕。'
        }
      ],
      hasImage: false
    },
    {
      id: 'wooden-floor',
      title: 'I.木地板',
      contents: [
        { 
          text: 'I-1︱桌椅家具建議宜放置保護腳墊，避免刮傷。' 
        },
        { 
          text: 'I-2︱如打翻盛水容器或飲料請立即擦拭，保持地板之乾燥。' 
        },
        { 
          text: 'I-3︱注意通風與對流，避免長時間的密封與日曬。'
        },
        { 
          text: 'I-4︱下雨天請記得將窗戶關上，避免雨水之濺入。'
        },
        { 
          text: 'I-5︱拖地建議可先使用吸塵器，再使用專用清潔組或清水抹布即可。'
        }
      ],
      images: [
        '/images/maintenance/wooden-floor.jpg'
      ],
      hasImage: true
    },
    {
      id: 'doors-windows-2',
      title: 'J.門窗類',
      contents: [
        { 
          text: 'J-1︱台灣地區冬季，氣溫溫差大，空氣潮濕，宅內外易造成溫差大。為避免門窗玻璃結露，應保持適度通風。' 
        },
        { 
          text: 'J-2︱玻璃清潔不得使用強酸、強鹼或有機溶劑擦拭，防止玻璃表面處理受損。' 
        }
      ],
      hasImage: false
    },
    {
      id: 'electrical-appliances',
      title: 'K.電器類用品',
      contents: [
        { 
          text: '各戶用電電路設定，勿超載使用(請勿同時使用烤箱、微波爐..等)或任意更改電路設定，並定期維修。' 
        }
      ],
      images: [
        '/images/maintenance/electrical-appliances.jpg'
      ],
      hasImage: true
    },
    {
      id: 'silicone',
      title: 'L.矽利康（silicone)類',
      contents: [
        { 
          text: '使用中性清潔劑清洗並使用軟性乾布或衛生紙擦乾，避免silicone脫落及減低污斑發生，可延長使用壽命。' 
        }
      ],
      hasImage: false
    }
  ];
  
  // 預設展開第一個類別
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['monitoring']);
  
  // 切換類別展開狀態
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  return (
    <div className="flex flex-col lg:flex-row">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full mb-4">
        <Breadcrumb 
          parentTitle="知識中心" 
          parentTitleEn="DEVICE" 
          currentTitle="維護保養" 
          parentPath="/device"
          parentIsClickable={false}
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 左側麵包屑 - 只在桌面版顯示 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb 
            parentTitle="知識中心" 
            parentTitleEn="DEVICE" 
            currentTitle="維護保養" 
            parentPath="/device"
            parentIsClickable={false}
          />
        </div>
        
        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8 pb-12">
          {/* 滿版背景圖片 */}
          <div className="relative inset-0 z-0 mb-8 sm:mb-16">
            <Image
              src="/images/maintenance/bg.jpg" 
              alt="維護保養"
              width={1920}
              height={874}
              priority
            />
          </div>
          
          {/* 折疊面板區域 */}
          <div className="space-y-6">
            {maintenanceData.map((category) => (
              <div 
                key={category.id} 
                className="border-0 overflow-hidden"
              >
                {/* 類別標題 - 可點擊折疊/展開 */}
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <div className="w-full pt-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg lg:text-xl font-semibold text-[#a48b78]">{category.title}</h2>
                      <div className={`ml-2 transition-transform duration-300 ${expandedCategories.includes(category.id) ? 'rotate-180' : 'rotate-0'}`}>
                        <ChevronDown className="h-5 w-5 text-[#a48b78]" />
                      </div>
                    </div>
                    <div className="w-full h-px bg-[#a48b78] mt-1"></div>
                  </div>
                </button>
                
                {/* 類別內容區域 - 使用CSS過渡動畫 */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedCategories.includes(category.id) ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="py-4">
                    <div className="flex flex-col lg:flex-row">
                      {/* 左側文字內容 */}
                      <div className={`${category.hasImage ? 'w-full lg:w-auto lg:flex-1 lg:pr-8' : 'w-full'}`}>
                        {category.contents.map((item, index) => (
                          <div key={index} className="mb-2">
                            {item.text === '\n' ? <br /> : <p className="text-black leading-relaxed">{item.text}</p>}
                          </div>
                        ))}
                      </div>
                      
                      {/* 右側圖片 */}
                      {category.hasImage && category.images && category.images.length > 0 && (
                        <div className="mt-4 lg:mt-0 lg:w-auto lg:flex-1 lg:max-w-4/12">
                          {category.images.map((image, index) => (
                            <div key={index} className="relative w-full rounded-none overflow-hidden" style={{ paddingTop: '56.25%' }}>
                              <Image
                                src={image}
                                alt={`${category.title}圖片${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
          
          
          {/* 聯絡按鈕 */}
          <div className="mt-16 flex justify-center lg:justify-end">
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-[#a48b78] text-[#a48b78] hover:bg-[#a48b78] hover:text-white transition-colors duration-300 shadow-sm"
            >
              <Info className="w-5 h-5 mr-2" />
              <span>有疑問嗎？聯絡我們</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}