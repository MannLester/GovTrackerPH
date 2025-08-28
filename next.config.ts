import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // 👈 disables ESLint at build time
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'supabase.com',
      },
      {
        protocol: 'https',
        hostname: 'dxbxqqfspwhkapmgrylz.supabase.co',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
