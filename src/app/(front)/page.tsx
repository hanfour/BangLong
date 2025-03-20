import { Suspense } from 'react';
import FullscreenCarousel from '@/components/front/FullscreenCarousel';

// Define the CarouselItem interface
interface CarouselItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
  linkText: string;
  order: number;
  isActive: boolean;
  textPosition: string;
  textDirection: string;
}

// 預設資料 - 當 API 加載失敗時顯示
const fallbackItems: CarouselItem[] = [
  {
    id: '1',
    imageUrl: '/uploads/carousel/kv-image-01.jpg',
    title: '懂家的生活家',
    description: '',
    linkUrl: '',
    linkText: '',
    order: 1,
    isActive: true,
    textPosition: 'topCenter',
    textDirection: 'vertical'
  },
  {
    id: '2',
    imageUrl: '/uploads/carousel/kv-image-02.jpg',
    title: '懂家的生活家',
    description: '',
    linkUrl: '',
    linkText: '',
    order: 2,
    isActive: true,
    textPosition: 'topLeft',
    textDirection: 'horizontal'
  },
];

// 在伺服器端獲取輪播數據
async function getCarouselItems(): Promise<CarouselItem[]> {
  try {
    // 使用相對於 API 的 URL (App Router 中的規範)
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/carousel`, {
      cache: 'no-store', // 不緩存，每次請求新數據
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch carousel items: ${response.status}`);
    }
    
    const data = await response.json();
    const items = data.carouselItems || [];
    
    // 如果 API 返回空列表，使用後備項目
    return items.length > 0 ? items : fallbackItems;
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    return fallbackItems;
  }
}

// 輪播數據載入組件
async function CarouselData() {
  const carouselItems = await getCarouselItems();
  
  return (
    <FullscreenCarousel carouselItems={carouselItems} />
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* 在加載中狀態也使用 fallbackItems 而非空數組 */}
      <Suspense fallback={<FullscreenCarousel carouselItems={fallbackItems} />}>
        <CarouselData />
      </Suspense>
    </main>
  );
}