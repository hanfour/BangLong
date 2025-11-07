/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // 在生產構建時忽略 ESLint 錯誤
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生產構建時忽略 TypeScript 錯誤
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  // 如果需要設置其他選項，可以在這裡添加
};

export default nextConfig;