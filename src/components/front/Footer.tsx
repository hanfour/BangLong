'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white text-[#3e3a39]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 公司 Logo 和資訊 */}
          <div className="col-span-1 lg:col-span-1 lg:col-span-1">
            <div className="mb-4">
              <div className="relative w-40 h-14">
                <Image 
                  src="/logo.svg" 
                  alt="邦瓏建設" 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li>公司名稱：<h1 className='inline'>邦瓏建設股份有限公司</h1></li>
              <li>統一編號：<h2 className='inline'>90545046</h2></li>
              <li>公司電話：<h3 className='inline'>02-27992121</h3></li>
              <li>公司地址：<h3 className='inline'>台北市內湖區瑞光路393巷8號11樓</h3></li>
            </ul>
            <div className="mt-6 flex space-x-4">
              {/* 社群媒體圖標 */}
              <a href="#" className="text-[#3e3a39] hover:text-[#a48b78]">
                <span className="sr-only">Facebook</span>
                <svg className="h-8 w-8 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-[#3e3a39] hover:text-[#a48b78]">
                <span className="sr-only">Instagram</span>
                <svg className="h-8 w-8 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-[#3e3a39] hover:text-[#a48b78]">
                <span className="sr-only">Line</span>
                <svg className="h-8 w-8 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.001 2C6.47813 2 2 5.86797 2 10.647C2 15.2921 6.05994 18.7739 11.4642 18.7739C11.7014 18.7739 11.9356 18.7648 12.1667 18.7474C12.0334 19.0557 11.1667 22.1667 11.1667 22.1667C11.1667 22.1667 15.7604 19.2673 16.34 18.7739C20.4039 17.0742 22 14.0988 22 10.647C22 5.86797 17.5229 2 12.001 2ZM8.33333 13.0833H7.5V9.16656H8.33333V13.0833ZM9.58333 9.16656H10.4167V13.0833H9.58333V9.16656ZM12.5 9.16656H13.3333V13.0833H12.5V9.16656ZM15.4167 9.16656H16.25V13.0833H15.4167V9.16656Z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 lg:grid-cols-4 gap-8 col-span-1 lg:col-span-2">
            {/* 快速連結 */}
            <div className="col-span-1 lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4">關於我們</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-[#a48b78]">緣起邦瓏</Link>
                </li>
                <li>
                  <Link href="/about/spirit" className="hover:text-[#a48b78]">企業精神</Link>
                </li>
                <li>
                  <Link href="/about/vision" className="hover:text-[#a48b78]">品牌願景</Link>
                </li>
                <li>
                  <Link href="/about/related" className="hover:text-[#a48b78]">相關企業</Link>
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-4 mt-8">知識中心</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/device/maintenance" className="hover:text-[#a48b78]">維護保養</Link>
                </li>
              </ul>
            </div>

            {/* 產品項目 */}
            <div className="col-span-1 lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4">建案項目</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/arch/new" className="hover:text-[#a48b78]">新案鑑賞</Link>
                </li>
                <li>
                  <Link href="/arch/classic" className="hover:text-[#a48b78]">歷年經典</Link>
                </li>
                <li>
                  <Link href="/arch/future" className="hover:text-[#a48b78]">未來計畫</Link>
                </li>
              </ul>
              
              <h3 className="text-lg font-semibold mb-4 mt-8">尊榮售服</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/service/handbook" className="hover:text-[#a48b78]">交屋手冊</Link>
                </li>
                <li>
                  <Link href="/service/process" className="hover:text-[#a48b78]">售服流程</Link>
                </li>
              </ul>
            </div>

            {/* 聯絡資訊 */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4">聯絡我們</h3>
              <p className="text-sm mb-4">
                有任何疑問或需求，歡迎隨時與我們聯繫。
              </p>
              <Link 
                href="/contact" 
                className="inline-block px-4 py-1 bg-[#a48b78] text-white hover:bg-[#8a745e] transition-colors duration-200"
              >
                立即聯絡
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#3e3a39] text-center text-sm">
          <p>&copy; {new Date().getFullYear()} 邦瓏建設股份有限公司. 版權所有.</p>
        </div>
      </div>
    </footer>
  );
}