/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Webpack configuration to exclude isomorphic-dompurify from middleware bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude isomorphic-dompurify from server-side bundles (middleware)
      config.externals = config.externals || [];
      config.externals.push({
        'isomorphic-dompurify': 'commonjs isomorphic-dompurify',
      });
    }
    return config;
  },
  // Security headers (CSP is handled in middleware to exclude /_next/ paths)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  },
};

export default nextConfig;

