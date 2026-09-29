import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // 16.3 writes a Turbopack build cache by default; on tonight's full disk it is dead weight (7.2, 7.6).
    turbopackFileSystemCacheForBuild: false,
  },
}

export default nextConfig
