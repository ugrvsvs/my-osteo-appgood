/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || "",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  // Улучшенная маршрутизация для динамических сегментов
  rewrites: async () => {
    return {
      fallback: [],
    }
  },
  pageExtensions: ["ts", "tsx"],
  experimental: {
    // Улучшенная маршрутизация для динамических сегментов
  },
}

export default nextConfig
