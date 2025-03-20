'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function ServicePage() {
  // 服務類別
  const serviceCategories = [
    {
      id: 'handbook',
      title: '交屋手冊',
      description: '提供各建案交屋相關資訊與注意事項',
      imageSrc: '/images/handbook/project1.jpg',
      path: '/service/handbook'
    },
    {
      id: 'process',
      title: '售服流程',
      description: '了解從選屋到入住的完整服務流程',
      imageSrc: '/images/process/01.svg',
      path: '/service/process'
    },
    {
      id: 'maintenance',
      title: '維護保養',
      description: '建築設備的日常維護與保養指南',
      imageSrc: '/images/handbook/project1.jpg', // 假設使用現有圖片
      path: '/service/maintenance'
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-center text-[#40220f]">尊榮售服</h1>
        <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto">
          邦隆建設提供優質完善的售後服務，從交屋手冊到維護保養，讓每位住戶均能享受無憂的居住體驗。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {serviceCategories.map((category) => (
          <Link 
            key={category.id}
            href={category.path}
            className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={category.imageSrc}
                alt={category.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity"></div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#40220f] mb-2">{category.title}</h2>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="flex items-center text-[#a48b78] font-medium group-hover:text-[#40220f] transition-colors">
                <span>查看詳情</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-[#f9f6f3] rounded-lg">
        <h3 className="text-xl font-semibold text-[#40220f] mb-4">我們的承諾</h3>
        <p className="text-gray-700">
          邦隆建設致力於為每位客戶提供最優質的居住體驗。我們的售後服務團隊隨時待命，為您解決各類居住問題。從交屋開始，我們的服務不會結束，而是一個長期的夥伴關係的開始。
        </p>
      </div>
    </div>
  );
}