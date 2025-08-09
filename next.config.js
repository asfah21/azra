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
        protocol: 'http',
        hostname: '5.78.115.85',
        port: '9000',
        pathname: '/public-files/**',
      },
    ],
  },
};

export default nextConfig;
