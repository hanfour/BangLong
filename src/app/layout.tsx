import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: {
    default: '邦瓏建設 - 精築生活，永續建築',
    template: '%s | 邦瓏建設'
  },
  description: '邦瓏建設專注打造高品質建築，注重生活細節，秉持精工品質與永續理念，創造舒適理想的居住環境。',
  generator: 'Next.js',
  applicationName: '邦瓏建設官方網站',
  keywords: ['邦瓏建設', '建設公司', '豪宅建築', '精品建築', '永續建築', '台灣建設', '高品質住宅'],
  authors: [{ name: '邦瓏建設', url: 'https://www.banglong.tw' }],
  creator: '邦瓏建設',
  publisher: '邦瓏建設',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.banglong.tw'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://www.banglong.tw',
    title: '邦瓏建設 - 精築生活，永續建築',
    description: '邦瓏建設專注打造高品質建築，注重生活細節，秉持精工品質與永續理念，創造舒適理想的居住環境。',
    siteName: '邦瓏建設',
    images: [
      {
        url: '/logo.svg',
        width: 800,
        height: 600,
        alt: '邦瓏建設標誌',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '邦瓏建設 - 精築生活，永續建築',
    description: '邦瓏建設專注打造高品質建築，注重生活細節，秉持精工品質與永續理念，創造舒適理想的居住環境。',
    images: ['/logo.svg'],
    creator: '@banglongconstruction',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}