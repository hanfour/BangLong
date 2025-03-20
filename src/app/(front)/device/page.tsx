'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function DevicePage() {
  // 知識中心類別
  const deviceCategories = [
    {
      id: 'maintenance',
      title: '維護保養',
      description: '各類建築設備的維護與保養指南',
      imageSrc: '/images/handbook/project1.jpg',
      path: '/device/maintenance'
    },
    {
      id: 'usage',
      title: '使用說明',
      description: '家中各種設備的正確使用方法',
      imageSrc: '/images/projects/project3.jpg',
      path: '/device/usage'
    },
    {
      id: 'troubleshooting',
      title: '故障排除',
      description: '常見問題的解決方案',
      imageSrc: '/images/projects/project4.jpg',
      path: '/device/troubleshooting'
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-center text-[#40220f]">知識中心</h1>
        <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto">
          邦隆建設提供完整的居家設備指南，從使用說明到維護保養，讓您的居住生活更舒適便利。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {deviceCategories.map((category) => (
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
        <h3 className="text-xl font-semibold text-[#40220f] mb-4">舒適的居住環境</h3>
        <p className="text-gray-700">
          邦隆建設不僅提供優質的建築品質，更著重於居住後的生活體驗。通過我們的知識中心，您可以輕鬆了解如何正確維護與使用家中設備，延長設備壽命，並創造更舒適的居住環境。
        </p>
      </div>
    </div>
  );
}