'use client';

import { useState } from 'react';
import Image from 'next/image';
import Breadcrumb from '@/components/front/Breadcrumb';
import { ChevronDown, AlertTriangle, Info, CheckCircle } from 'lucide-react';

// 內容項目類型定義，包含可選圖片
type ContentItem = {
  problem: string;
  solution: string;
  image?: string;
};

// 故障排除類型定義
type TroubleshootingCategory = {
  id: string;
  title: string;
  contents: ContentItem[];
  hasImage?: boolean;
};

export default function TroubleshootingPage() {
  // 故障排除資料
  const troubleshootingData: TroubleshootingCategory[] = [
    {
      id: 'electrical',
      title: 'A. 電氣問題',
      contents: [
        { 
          problem: '整戶跳電，無法供電',
          solution: '檢查總電箱的漏電斷路器是否跳脫。若已跳脫，先將所有電器的開關關閉，再重新扳動漏電斷路器。若無法恢復，請聯繫專業電工。',
          image: '/images/handbook/project1.jpg' // 使用示例圖片
        },
        { 
          problem: '局部區域無電',
          solution: '檢查配電箱中對應區域的分路開關是否跳脫。若已跳脫，可能是該區域用電量過大或有短路情況，請減少同時使用的電器，再重新扳動開關。' 
        },
        { 
          problem: '插座無法使用',
          solution: '確認插座所屬的迴路開關是否正常。可使用其他電器測試該插座。若確認插座故障，請勿自行拆修，應聯繫專業人員處理。',
          image: '/images/projects/project2.jpg' // 使用示例圖片
        }
      ],
      hasImage: true
    },
    {
      id: 'plumbing',
      title: 'B. 給排水問題',
      contents: [
        { 
          problem: '水龍頭滴漏',
          solution: '檢查水龍頭密封圈是否老化或損壞。輕微滴漏可嘗試旋緊水龍頭開關；若持續滴漏，則可能需要更換密封圈或水龍頭本體。',
          image: '/images/projects/project3.jpg' // 使用示例圖片
        },
        { 
          problem: '馬桶水箱持續流水',
          solution: '打開水箱蓋檢查浮球開關是否正常工作。可調整浮球位置或更換損壞零件。若無法自行解決，請尋求水電專業人員協助。' 
        },
        { 
          problem: '排水管堵塞',
          solution: '使用通管器（吸盤）嘗試疏通，或使用專業通管液倒入排水口(請遵循產品使用說明)。若仍無法疏通，則需聯繫專業人員使用通管設備處理。',
          image: '/images/projects/project4.jpg' // 使用示例圖片
        },
        { 
          problem: '熱水器無法提供熱水',
          solution: '檢查熱水器電源是否開啟；瓦斯熱水器需檢查瓦斯供應是否正常。若溫度設定正確但仍無熱水，可能是熱水器內部故障，需專業維修。' 
        }
      ],
      hasImage: true
    },
    {
      id: 'air-conditioning',
      title: 'C. 空調故障',
      contents: [
        { 
          problem: '空調不運轉',
          solution: '確認電源是否接通，遙控器電池是否耗盡。檢查空調室內機濾網是否需要清洗。若確認以上均正常，則可能是壓縮機或控制板故障，需聯繫專業維修。',
          image: '/images/handbook/project1.jpg' // 使用示例圖片
        },
        { 
          problem: '空調製冷/製熱效果差',
          solution: '清潔空調濾網和室外機散熱片。確保室外機周圍無障礙物影響散熱。檢查門窗是否密閉。若問題持續，可能是冷媒不足或系統故障，需專業檢修。' 
        },
        { 
          problem: '空調異常噪音',
          solution: '輕微振動聲可能是安裝不夠牢固，可嘗試加固支架。若有明顯金屬摩擦聲或高頻噪音，可能是內部機件損壞或風扇異物，應立即停機並聯繫維修人員。',
          image: '/images/projects/project1.jpg' // 使用示例圖片
        }
      ],
      hasImage: true
    },
    {
      id: 'doors-windows',
      title: 'D. 門窗問題',
      contents: [
        { 
          problem: '門窗關閉不嚴',
          solution: '檢查門窗框與扇之間是否有異物。調整合頁或滑軌位置，必要時加潤滑劑。若有變形情況，需聯繫專業人員維修或更換。',
          image: '/images/projects/project2.jpg' // 使用示例圖片
        },
        { 
          problem: '推拉門卡住',
          solution: '檢查滑軌中是否有灰塵或異物，清潔後加入適量矽油潤滑。若滑輪損壞，需更換滑輪組件。' 
        },
        { 
          problem: '門鎖失靈',
          solution: '插入鑰匙時若有阻滯感，可適量注入石墨粉潤滑。若門鎖內部機構損壞，則需更換門鎖。若遭遇緊急情況無法開鎖，請聯繫鎖匠或物業管理人員。',
          image: '/images/projects/project3.jpg' // 使用示例圖片
        }
      ],
      hasImage: true
    },
    {
      id: 'appliances',
      title: 'E. 家電故障',
      contents: [
        { 
          problem: '冰箱不製冷',
          solution: '確認電源正常，溫度設定適當。檢查冰箱背部散熱片是否堆積灰塵，清潔後效能可能會恢復。若門封條磨損導致密封不良，需更換門封條。持續故障應聯繫售後服務。',
          image: '/images/handbook/project1.jpg' // 使用示例圖片
        },
        { 
          problem: '洗衣機不排水',
          solution: '檢查排水管是否彎折或堵塞，清理洗衣機過濾網中的雜物。若仍無法排水，可能是排水泵故障，需專業維修。' 
        },
        { 
          problem: '抽油煙機吸力弱',
          solution: '清洗油網和風扇葉片，檢查排風管是否暢通。若清潔後仍無改善，可能是摩打功率下降，需考慮專業維修或更換零件。',
          image: '/images/projects/project4.jpg' // 使用示例圖片
        },
        { 
          problem: '烤箱無法加熱',
          solution: '檢查電源和溫度設定是否正確。若已確認設置無誤但仍無法加熱，可能是加熱元件損壞或控制板故障，需專業維修。' 
        }
      ],
      hasImage: true
    },
    {
      id: 'network',
      title: 'F. 網路與通訊',
      contents: [
        { 
          problem: 'WiFi訊號弱或不穩定',
          solution: '重啟路由器，確認路由器位置沒有被金屬物體或電子設備阻隔。可考慮增加WiFi訊號延伸器擴大覆蓋範圍。若問題持續，聯繫網路服務提供商。',
          image: '/images/projects/project1.jpg' // 使用示例圖片
        },
        { 
          problem: '對講系統無法通話',
          solution: '檢查對講機電源是否正常，確認系統音量設定是否適當。若問題持續，可能是系統線路或主機故障，應通知物業管理人員。' 
        },
        { 
          problem: '智能門鎖失靈',
          solution: '更換電池並重新啟動系統。確保門鎖感應區域清潔無污染。若仍無法正常工作，可能需要重設或尋求專業維修服務。',
          image: '/images/projects/project2.jpg' // 使用示例圖片
        }
      ],
      hasImage: true
    }
  ];
  
  // 預設展開第一個類別
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['electrical']);
  
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
          currentTitle="故障排除" 
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
            currentTitle="故障排除" 
            parentPath="/device"
            parentIsClickable={false}
          />
        </div>
        
        {/* 右側內容 */}
        <div className="w-full lg:flex-1 lg:pl-8 pb-12">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#40220f] mb-3">常見問題排除指南</h1>
            <p className="text-gray-600 max-w-2xl">遇到居家設備故障？查看我們的故障排除指南，輕鬆解決常見問題。若無法自行處理，請聯絡我們的專業維修團隊。</p>
          </div>
          
          {/* 緊急聯絡資訊 */}
          <div className="mb-8 p-4 bg-[#fdf3f3] border-l-4 border-red-500 rounded-r-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-red-700">緊急維修聯絡方式</h3>
                <p className="text-gray-700">水電緊急狀況：(02) 2345-6789（24小時服務專線）</p>
              </div>
            </div>
          </div>
          
          {/* 折疊面板區域 */}
          <div className="space-y-4 lg:space-y-6">
            {troubleshootingData.map((category) => (
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
                    <div className="space-y-8">
                      {category.contents.map((item, index) => (
                        <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex flex-col lg:flex-row items-start gap-6">
                            <div className={`${item.image ? 'lg:w-1/2' : 'w-full'}`}>
                              <p className="text-lg font-medium text-[#40220f] mb-2">
                                問題：{item.problem}
                              </p>
                              <div className="flex items-start mt-3">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                                <p className="text-gray-700 leading-relaxed">
                                  <span className="font-medium text-gray-800">解決方法：</span> {item.solution}
                                </p>
                              </div>
                            </div>
                            
                            {item.image && (
                              <div className="lg:w-1/2 mt-4 lg:mt-0">
                                <div className="relative h-48 lg:h-64 w-full rounded-lg overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={`${item.problem}處理示意圖`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
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
                  <Info className="h-6 w-6 text-[#a48b78]" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-[#40220f] mb-3">故障排除注意事項</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li className="transition-all duration-300 hover:text-[#40220f]">基於安全考量，電氣及燃氣設備的複雜故障應交由專業人員處理。</li>
                  <li className="transition-all duration-300 hover:text-[#40220f]">進行任何維修前，請先關閉相關設備的電源或供應源。</li>
                  <li className="transition-all duration-300 hover:text-[#40220f]">若設備在保固期內，請聯繫原廠維修服務，避免自行拆解造成保固失效。</li>
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
              <span>需要技術支援？聯絡我們</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}