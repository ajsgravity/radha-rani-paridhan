/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
let apiOrigin = 'http://localhost:4000';

try {
  apiOrigin = new URL(rawApiUrl).origin;
} catch {
  apiOrigin = 'http://localhost:4000';
}

const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
