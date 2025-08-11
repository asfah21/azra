/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '3mb' } },
  images: {
    remotePatterns: [new URL('https://files.db-ku.com/**')],
  },
};
export default nextConfig;
