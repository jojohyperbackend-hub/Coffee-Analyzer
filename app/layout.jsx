
// Root layout: global wrapper + import App.css

import "./App.css";

export const metadata = {
  title: "Coffee Analyzer",
  description: "Analisis kadar kafein dari foto kopi menggunakan AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased bg-amber-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}
