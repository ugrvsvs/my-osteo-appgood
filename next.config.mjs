/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || "",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Улучшенная маршрутизация для динамических сегментов
  rewrites: async () => {
    return {
      fallback: [],
    }
  },
  pageExtensions: ["ts", "tsx"],
  experimental: {
    // Убедиться, что Next.js правильно обрабатывает динамические маршруты
    strictNextHead: true,
  },
}

export default nextConfig
