/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  
  async headers() {
    return [
      {
        // Apply to all routes
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
        ],
      },
      {
        // Main app routes - Strict CSP but allows what's needed for the app
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: Allow self, inline scripts (for Next.js), eval (for artifacts), and CDNs
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
              // Styles: Allow self, inline styles (for Chakra UI, Tailwind), and CDNs
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images: Allow self, data URIs, Cloudinary, and other domains
              "img-src 'self' data: https: blob:",
              // Fonts: Allow self and Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Connect: Allow API calls to Mistral AI, own API, and CDN source maps
              "connect-src 'self' https://api.mistral.ai https://res.cloudinary.com https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              // Frames: Allow self (for artifact iframes)
              "frame-src 'self' blob:",
              // Workers: Allow blob for web workers
              "worker-src 'self' blob:",
              // Media: Allow self and blob
              "media-src 'self' blob:",
              // Object: Block plugins
              "object-src 'none'",
              // Base URI: Restrict to self
              "base-uri 'self'",
              // Form actions: Restrict to self and Stripe
              "form-action 'self' https://checkout.stripe.com",
              // Upgrade insecure requests in production
              process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
            ]
              .filter(Boolean)
              .join('; '),
          },
        ],
      },
      {
        // Static assets - Long cache time
        source: '/img/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Fonts - Long cache time
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  images: {
    domains: [
      'images.unsplash.com',
      'i.ibb.co',
      'scontent.fotp8-1.fna.fbcdn.net',
      'res.cloudinary.com',
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
