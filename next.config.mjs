/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const apiBase = process.env.MYNOTE_API_URL || 'http://127.0.0.1:8001'

    return [
      {
        source: '/api/auth/:path*',
        destination: `${apiBase}/api/auth/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/api/v1/:path*`,
      },
    ]
  },
};

export default nextConfig;
