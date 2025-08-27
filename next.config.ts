import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // 👈 disables ESLint at build time
  },
  images: {
    domains: [
      'supabase.com',
      'dxbxqqfspwhkapmgrylz.supabase.co',
    ],
  },
  /* config options here */
};

export default nextConfig;
