import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    viewTransition: true,
  },
  images: {
    domains: ['em-content.zobj.net', '68u63cxp9s.ufs.sh'],
  },
};

export default nextConfig;
