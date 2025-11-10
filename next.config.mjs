/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_HOST =
  (SUPABASE_URL || "").replace(/^https?:\/\//, "").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,

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
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              // Izinkan script dari Google untuk Firebase Auth
              "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com; " +
              // Izinkan style inline & self
              "style-src 'self' 'unsafe-inline'; " +
              "font-src 'self' data:; " +
              // Izinkan koneksi ke API Supabase, Firebase, OpenAI, dan Google
              "connect-src 'self' https://openrouter.ai https://api.openai.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://apis.google.com " +
              (SUPABASE_URL ? `${SUPABASE_URL}` : "") +
              "; " +
              // Izinkan gambar dari Supabase & Firebase
              (SUPABASE_URL
                ? `img-src 'self' data: ${SUPABASE_URL} https:; `
                : "img-src 'self' data: https:; ") +
              // Izinkan frame dari Firebase & Google login popup
              "frame-src https://*.firebaseapp.com https://*.google.com; " +
              "frame-ancestors 'none';",
          },

          // clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // MIME sniffing protection
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy
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
          // CORS (biar tetap bisa jalan di domain produksi)
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NEXT_PUBLIC_ALLOWED_ORIGIN ||
              "https://coffee-analyzer.vercel.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
