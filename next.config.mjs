/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,

  async headers() {
    return [
      {
        // Terapkan ke semua route
        source: "/(.*)",
        headers: [
          // ✅ Kontrol konten agar gak bisa disusupi script asing
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' blob: data: https:; font-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://openrouter.ai https://api.openai.com; frame-ancestors 'none';",
          },
          // ✅ Cegah clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // ✅ Cegah browser menebak MIME-type
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // ✅ Batasi data referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // ✅ Batasi fitur device
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), fullscreen=(), payment=()",
          },
          // ✅ Pastikan HTTPS selalu aktif
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // ✅ CORS untuk API kamu
          {
            key: "Access-Control-Allow-Origin",
            value: "https://coffee-analyzer.vercel.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
