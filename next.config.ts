import type { NextConfig } from "next";

// Skills videos embed YouTube/Vimeo players and thumbnails; resource files
// are served from Vercel Blob. Everything else is same-origin.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://vercel.live",
  "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
  "img-src 'self' data: https://img.youtube.com https://*.public.blob.vercel-storage.com",
  "font-src 'self' data: https://cdnjs.cloudflare.com",
  "connect-src 'self' https://*.public.blob.vercel-storage.com https://vercel.live wss://ws-us3.pusher.com",
  "frame-src https://www.youtube.com https://player.vimeo.com https://vercel.live",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
