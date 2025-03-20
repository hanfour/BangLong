'use client';

import { useState } from 'react';
import Image from 'next/image';
import Breadcrumb from '@/components/front/Breadcrumb';
import { ChevronDown, BookOpen, Info } from 'lucide-react';

// 內容項目類型定義，包含可選圖片
type ContentItem = {
  text: string;
  image?: string;
};

// 使用說明類型定義
type UsageCategory = {
  id: string;
  title: string;
  contents: ContentItem[];
  hasImage?: boolean;
};

export default function UsagePage() {
  // 使用說明資料
  const usageData: UsageCategory[] = [
    {
      id: 'home-security',
      title: 'A. 安全系統',
      contents: [
        { 
          text: 'A-1︱門禁對講機使用方式：按下對講機上的「安全鎖」按鈕，可開啟/關閉安全系統。系統開啟時，指示燈呈紅色亮起。',
          image: '/images/handbook/project1.jpg' // 使用示例圖片
        },
        { 
          text: 'A-2︱訪客來訪時，可透過對講機確認後，按下「開門」按鈕放行。' 
        },
        { 
          text: 'A-3︱如需調整對講音量，請於通話時使用「+」和「-」按鈕進行調整。'
        }
      ],
      hasImage: true
    },
    {
      id: 'air-conditioning',
      title: 'B. 空調系統',
      contents: [
        { 
          text: 'B-1︱冷氣遙控器設定：按下「Mode」選擇冷氣、除濕或送風模式，按「Temp」調整溫度，按「Fan」選擇風速大小。',
          image: '/images/projects/project2.jpg' // 使用示例圖片
        },
        { 
          text: 'B-2︱節能設定：建議夏季設定26-28°C，冬季設定20-22°C，可節省耗電並延長設備壽命。'
        },
        { 
          text: 'B-3︱定時功能：按下「Timer」按鈕，可設定開機或關機時間，有效節省能源。'
        }
      ],
      hasImage: true
    },
    {
      id: 'kitchen-appliances',
      title: 'C. 廚房設備',
      contents: [
        { 
          text: 'C-1︱抽油煙機使用：開始烹飪前請先開啟抽油煙機，結束後應繼續運轉3-5分鐘，確保油煙完全排出。',
          image: '/images/projects/project3.jpg' // 使用示例圖片
        },
        { 
          text: 'C-2︱瓦斯爐使用：轉動爐具旋鈕同時按下點火器，火焰穩定後再放開點火器。使用完畢請確認已關閉爐火。' 
        },
        { 
          text: 'C-3︱烤箱使用：首次使用前，請先空烤20分鐘以去除保護油脂。使用時依照食材選擇適當溫度及烹調時間。' 
        },
        { 
          text: 'C-4︱洗碗機使用：先去除餐具上的大型殘渣，將餐具擺放整齊，添加專用洗碗粉後選擇適當程序運行。',
          image: '/images/projects/project4.jpg' // 使用示例圖片
        }
      ],
      hasImage: true
    },
    {
      id: 'bathroom-facilities',
      title: 'D. 衛浴設備',
      contents: [
        { 
          text: 'D-1︱浴室暖風機使用：按電源鍵開啟，按模式鍵選擇暖風、涼風或換氣功能，並可調節風量大小。',
          image: '/images/handbook/project1.jpg' // 使用示例圖片
        },
        { 
          text: 'D-2︱智能馬桶使用：坐墊感應後可使用沖洗功能，按下相應按鈕選擇前沖、後沖或溫風烘乾。' 
        },
        { 
          text: 'D-3︱淋浴設備使用：轉動水溫控制器，順時針增加熱水，逆時針增加冷水。使用完畢請關閉水閥。' 
        },
        { 
          text: 'D-4︱浴缸注水：打開水龍頭前請先確認排水口已關閉，水位不要超過溢水口。'
        }
      ],
      hasImage: true
    },
    {
      id: 'lighting-system',
      title: 'E. 照明系統',
      contents: [
        { 
          text: 'E-1︱智能照明控制：客廳及主臥室配有場景燈光控制面板，可選擇「會客」、「用餐」、「閱讀」等預設場景。',
          image: '/images/projects/project1.jpg' // 使用示例圖片
        },
        { 
          text: 'E-2︱調光功能：長按調光開關可調節燈光亮度，短按則直接開關燈光。' 
        },
        { 
          text: 'E-3︱廁所感應燈：進入廁所後燈光自動開啟，離開一段時間後自動關閉，無需手動控制。' 
        }
      ],
      hasImage: true
    },
    {
      id: 'network-system',
      title: 'F. 網路系統',
      contents: [
        { 
          text: 'F-1︱WiFi設置：路由器位於客廳弱電箱內，預設密碼貼於路由器底部，建議首次使用時更改密碼。' 
        },
        { 
          text: 'F-2︱網路擴展：如發現家中某些區域WiFi訊號弱，可加裝網路延伸器增強訊號覆蓋。',
          image: '/images/projects/project2.jpg' // 使用示例圖片
        },
        { 
          text: 'F-3︱智能家電連接：具備WiFi功能的家電可透過專屬App進行遠端控制，請參考各設備使用手冊進行配對設置。' 
        }
      ],
      hasImage: true
    }
  ];
  
  // 預設展開第一個類別
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['home-security']);
  
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
          currentTitle="使用說明" 
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
            currentTitle="使用說明" 
            parentPath="/device"
            parentIsClickable={false}
          />
        </div>
        
        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8 pb-12">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#40220f] mb-3">家居設備使用指南</h1>
            <p className="text-gray-600 max-w-2xl">為提升您的居住體驗，我們提供詳細的設備使用說明，幫助您輕鬆操作家中各類設備。</p>
          </div>
          
          {/* 折疊面板區域 */}
          <div className="space-y-4 lg:space-y-6">
            {usageData.map((category) => (
              <div 
                key={category.id} 
                className="border border-[#a48b78] rounded-lg overflow-hidden bg-white"
              >
                {/* 類別標題 */}
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex justify-between items-center p-4 text-left transition-colors ${
                    expandedCategories.includes(category.id) 
                      ? 'bg-[#f0e9e3]' 
                      : 'bg-[#f9f6f3] hover:bg-[#f4efe9]'
                  }`}
                >
                  <h2 className="text-lg lg:text-xl font-semibold text-[#40220f]">{category.title}</h2>
                  <div className={`transition-transform duration-300 ${expandedCategories.includes(category.id) ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDown className="h-5 w-5 text-[#a48b78]" />
                  </div>
                </button>
                
                {/* 類別內容區域 - 使用CSS過渡動畫 */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedCategories.includes(category.id) ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-5 border-t border-[#a48b78] bg-white">
                    <div className="space-y-6">
                      {category.contents.map((item, index) => (
                        <div key={index} className={`${item.image ? 'flex flex-col lg:flex-row items-start gap-6' : ''}`}>
                          <div className={`${item.image ? 'lg:w-1/2' : 'w-full'}`}>
                            <p className="text-gray-700 mb-2 leading-relaxed">
                              {item.text}
                            </p>
                          </div>
                          
                          {item.image && (
                            <div className="lg:w-1/2 mt-4 lg:mt-0">
                              <div className="relative h-48 lg:h-64 w-full rounded-lg overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={`${category.title}圖片`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 底部附加說明 */}
          <div className="mt-8 p-4 lg:p-6 bg-[#f9f6f3] rounded-lg shadow-sm">
            <div className="flex flex-col lg:flex-row items-start">
              <div className="flex-shrink-0 mb-4 lg:mb-0 lg:mr-5">
                <div className="bg-white rounded-full p-3 inline-block">
                  <BookOpen className="h-6 w-6 text-[#a48b78]" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-[#40220f] mb-3">使用說明小提示</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li className="transition-all duration-300 hover:text-[#40220f]">首次使用設備前，建議詳閱對應的原廠使用手冊。</li>
                  <li className="transition-all duration-300 hover:text-[#40220f]">熟悉緊急情況下各設備的關閉方式，有助於應對突發狀況。</li>
                  <li className="transition-all duration-300 hover:text-[#40220f]">正確操作可延長設備使用壽命，減少維修次數。</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 聯絡按鈕 */}
          <div className="mt-6 flex justify-center lg:justify-end">
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-[#a48b78] text-[#a48b78] bg-white hover:bg-[#a48b78] hover:text-white transition-colors duration-300 rounded-md shadow-sm"
            >
              <Info className="w-5 h-5 mr-2" />
              <span>需要協助嗎？聯絡我們</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}