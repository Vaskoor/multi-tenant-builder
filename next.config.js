/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/sites/:path*',
        destination: '/public/sites/:path*',
      },
    ];
  },
  images: {
    domains: ['localhost', '*.localhost'],
  },
};

module.exports = nextConfig;
