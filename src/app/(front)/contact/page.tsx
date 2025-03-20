'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, RefreshCw } from 'lucide-react';
import Breadcrumb from '@/components/front/Breadcrumb';

// 表單驗證架構
const contactFormSchema = z.object({
  name: z.string().min(2, { message: '姓名至少需要 2 個字元' }),
  email: z.string().email({ message: '請輸入有效的電子郵件地址' }),
  phone: z.string().min(8, { message: '請輸入有效的電話號碼' }),
  message: z.string().min(10, { message: '請概略敘述您的需要服務的地方，以方便加快處理' }),
  verifyCode: z.string().length(4, { message: '驗證碼必須是 4 位數字' }),
  privacyAgreed: z.boolean().refine(val => val === true, {
    message: '您必須同意個人資料收集聲明才能提交表單'
  }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      verifyCode: '',
      privacyAgreed: false,
    },
  });

  // 生成驗證碼
  const generateVerifyCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerifyCode(code);
    
    // 繪製驗證碼到 canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 設置背景
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 添加背景噪點
        for (let i = 0; i < 100; i++) {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
          ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            1,
            1
          );
        }
        
        // 設置文字
        ctx.textBaseline = 'middle';
        
        // 隨機放置字元並旋轉
        for (let i = 0; i < code.length; i++) {
          const fontSize = 20 + Math.random() * 10;
          ctx.font = `bold ${fontSize}px Arial`;
          
          // 生成較深的隨機顏色，確保可讀性
          const r = Math.floor(Math.random() * 100);
          const g = Math.floor(Math.random() * 100);
          const b = Math.floor(Math.random() * 100 + 155);  // 確保藍色元素較高
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          
          // 輕微旋轉
          ctx.save();
          const x = 15 + i * 22;
          const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
          ctx.translate(x, y);
          ctx.rotate((Math.random() - 0.5) * 0.4);
          ctx.fillText(code[i], 0, 0);
          ctx.restore();
        }
        
        // 添加干擾線
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.lineWidth = 1 + Math.random() * 2;
          ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(
            Math.random() * 150
          )}, ${Math.floor(Math.random() * 150 + 100)}, 0.5)`;
          
          // 繪製曲線而非直線
          ctx.moveTo(Math.random() * 30, Math.random() * canvas.height);
          
          // 控制點
          const cp1x = canvas.width / 3 + Math.random() * 30;
          const cp1y = Math.random() * canvas.height;
          const cp2x = (canvas.width * 2) / 3 + Math.random() * 30;
          const cp2y = Math.random() * canvas.height;
          
          // 終點
          const endX = canvas.width - Math.random() * 30;
          const endY = Math.random() * canvas.height;
          
          // 繪製貝茲曲線
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
          ctx.stroke();
        }
      }
    }
  };

  // 頁面加載時生成驗證碼
  useEffect(() => {
    generateVerifyCode();
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    // 檢查驗證碼是否正確
    if (data.verifyCode !== verifyCode) {
      setSubmitError('驗證碼不正確，請重新輸入');
      generateVerifyCode();
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 提交表單到 API
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          privacyAgreed: data.privacyAgreed,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          // 處理特定驗證錯誤
          const firstError = Object.values(result.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0 && typeof firstError[0] === 'object' && firstError[0].message) {
            setSubmitError(firstError[0].message);
          } else {
            setSubmitError('表單資料有誤，請檢查並重新提交');
          }
        } else {
          setSubmitError(result.message || '表單提交失敗，請稍後再試');
        }
        return;
      }
      
      // 成功提交
      setSubmitSuccess(true);
      reset();
      generateVerifyCode();
      
      // 5秒後重置成功訊息
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('表單提交失敗', error);
      setSubmitError('表單提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
    {/* 手機版麵包屑在頁面頂部顯示 */}
    <div className="lg:hidden w-full mb-4">
      <Breadcrumb 
        parentTitle="聯絡我們"
        parentTitleEn="CONTACT US"
        currentTitle=""
        parentPath="/contact"
        parentIsClickable={false}
      />
    </div>
    
    <div className="flex flex-col lg:flex-row lg:justify-between w-full">
      {/* 左側麵包屑 - 只在桌面版顯示 */}
      <div className="hidden lg:block mb-8 lg:mb-0">
        <Breadcrumb 
          parentTitle="聯絡我們"
          parentTitleEn="CONTACT US"
          currentTitle=""
          parentPath="/contact"
          parentIsClickable={false}
        />
      </div>
      
      {/* 右側表單內容 */}
      <div className="w-full lg:flex-1 lg:pl-8 h-full">
        <div className="lg:max-w-3xl mx-auto">
          {/* 滿版背景圖片 */}
          <div className="relative inset-0 z-0 mb-8 sm:mb-16">
            <Image
              src="/images/contact-bg.jpg" 
              alt="聯絡我們"
              width={1920}
              height={874}
              priority
            />
          </div>
          
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              感謝您的來信，我們會盡快與您聯絡！
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div>
                <label className="!hidden text-[#40220f] mb-2 font-medium" htmlFor="name">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 border border-[#a48b78] bg-white focus:outline-none focus:ring-.5 focus:ring-[#40220f] focus:border-[#40220f] transition-colors"
                  placeholder="請輸入您的姓名"
                />
                {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div>
                <label className="!hidden text-[#40220f] mb-2 font-medium" htmlFor="email">
                  電子郵件 <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 border border-[#a48b78] bg-white focus:outline-none focus:ring-.5 focus:ring-[#40220f] focus:border-[#40220f] transition-colors"
                  placeholder="請輸入您的電子郵件"
                />
                {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div>
                <label className="!hidden text-[#40220f] mb-2 font-medium" htmlFor="phone">
                  聯絡電話 <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-3 border border-[#a48b78] bg-white focus:outline-none focus:ring-.5 focus:ring-[#40220f] focus:border-[#40220f] transition-colors"
                  placeholder="請輸入您的聯絡電話"
                />
                {errors.phone && <p className="mt-1 text-red-500 text-sm">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="!hidden text-[#40220f] mb-2 font-medium" htmlFor="verifyCode">
                  驗證碼 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-row items-start sm:items-center gap-3 group">
                  <input
                    id="verifyCode"
                    type="text"
                    {...register('verifyCode')}
                    className="flex-1 px-4 py-3 border border-[#a48b78] bg-white focus:outline-none focus:ring-.5 focus:ring-[#40220f] focus:border-[#40220f] transition-colors"
                    placeholder="請輸入驗證碼"
                    maxLength={4}
                  />
                  <div className="flex-shrink-0 flex space-x-2">
                    <canvas
                      ref={canvasRef}
                      width="100"
                      height="50"
                      className="cursor-pointer w-full sm:w-auto max-w-[100px]"
                      onClick={generateVerifyCode}
                      title="點擊重新生成驗證碼"
                    />
                    <button
                      type="button"
                      onClick={generateVerifyCode}
                      className="mt-1 text-sm text-[#a48b78] group-hover:text-[#40220f] w-full text-center cursor-pointer"
                    >
                      <RefreshCw className="h-5 w-5 mr-2"/>
                    </button>
                  </div>
                </div>
                {errors.verifyCode && <p className="mt-1 text-red-500 text-sm">{errors.verifyCode.message}</p>}
              </div>
            </div>

            <div>
              <label className="!hidden text-[#40220f] mb-2 font-medium" htmlFor="message">
                留言內容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                {...register('message')}
                rows={5}
                className="w-full px-4 py-3 border border-[#a48b78] bg-white focus:outline-none focus:ring-.5 focus:ring-[#40220f] focus:border-[#40220f] transition-colors"
                placeholder="請輸入您的留言內容"
              ></textarea>
              {errors.message && <p className="mt-1 text-red-500 text-sm">{errors.message.message}</p>}
            </div>

            <div className="space-y-4">
              <p className="text-[#3e3a39] mt-1">
                你所登錄個人資料將作為以下用途<br/>
                1.本網站所載之相關事項通知  2.客戶管理與服務  3.本公司行銷業務之推廣本案實際內容以現場公布為準
              </p>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="privacyAgreed"
                    type="checkbox"
                    {...register('privacyAgreed')}
                    className="h-4 w-4 text-[#a48b78] focus:ring-[#40220f] border-[#a48b78]"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="privacyAgreed" className="font-medium text-[#3e3a39]">
                    本人已悉知以上個人資料蒐集聲明事項 <span className="text-red-500">*</span>
                  </label>
                  {errors.privacyAgreed && (
                    <p className="mt-1 text-red-500 text-sm">{errors.privacyAgreed.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full lg:w-1/2 py-3 text-[#a48b78] border border-[#a48b78] hover:bg-[#a48b78] hover:text-white transition duration-200 disabled:bg-gray-300 font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    提交中...
                  </>
                ) : (
                  '送出表單'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}