import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   /* config options here */
   allowedDevOrigins: ['10.150.0.175'],
   env: {
      API_URL: process.env.API_URL,
   },
};

export default nextConfig;
