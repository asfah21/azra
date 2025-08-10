/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.db-ku.com',
        port: '',
        pathname: '/public-files/**',
      },
    ],
  },
};

export default nextConfig;
