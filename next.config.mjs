/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// derive host for next/image domain if provided
const SUPABASE_HOST =
  (SUPABASE_URL || "").replace(/^https?:\/\//, "").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,

  // next/image domains (ganti jika hostname berbeda)
  images: {
    domains: SUPABASE_HOST ? [SUPABASE_HOST] : [],
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOST || "**",
        port: "",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy: batasi resource ke domain sendiri + Supabase + OpenRouter
          {
            key: "Content-Security-Policy",
            value:
              // sesuaikan connect-src / img-src jika butuh akses domain lain
              "default-src 'self'; " +
              (SUPABASE_URL ? `img-src 'self' data: ${SUPABASE_URL} https:; ` : "img-src 'self' data: https:; ") +
              "script-src 'self' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://openrouter.ai https://api.openai.com " +
              (SUPABASE_URL ? `${SUPABASE_URL}` : "") +
              "; " +
              "frame-ancestors 'none';",
          },

          // clickjacking
          { key: "X-Frame-Options", value: "DENY" },

          // MIME sniffing protection
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Referrer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Permissions policy - batasi fitur browser
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), autoplay=()",
          },

          // HSTS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Optional: CORS limited to your domain (ganti sesuai domain produksi)
          // Hapus atau sesuaikan jika aplikasi juga butuh akses dari preview domains
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || "https://coffee-analyzer.vercel.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
