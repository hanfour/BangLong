import Image from 'next/image';
import { HandbookPublic } from '@/types/handbook';

interface HandbookCardProps {
  handbook: HandbookPublic;
  onClick: () => void;
}

export default function HandbookCard({ handbook, onClick }: HandbookCardProps) {
  return (
    <div
      className="cursor-pointer transition-all duration-300 hover:scale-105 group"
      onClick={onClick}
    >
      {/* 封面圖片 - 無圓角設計 */}
      <div className="relative w-full pt-[142%] bg-gray-200 overflow-hidden">
        <Image
          src={handbook.coverImageUrl}
          alt={handbook.title}
          fill
          className="object-cover group-hover:brightness-95 transition-all"
        />
      </div>

      {/* 標題 */}
      <h3 className="text-center text-black text-sm md:text-base lg:text-lg font-medium mt-3 md:mt-4 group-hover:text-[#a48b78] transition-colors">
        {handbook.title}︱交屋手冊
      </h3>

      {/* 專案標籤（如果有） */}
      {handbook.project && (
        <p className="text-center text-xs md:text-sm text-gray-500 mt-1">
          {handbook.project.title}
        </p>
      )}
    </div>
  );
}
