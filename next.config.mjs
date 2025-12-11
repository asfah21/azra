/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '3mb' } },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.db-ku.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};
export default nextConfig;
