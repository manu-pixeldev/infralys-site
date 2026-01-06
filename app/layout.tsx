// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfraLys",
  description: "Template Engine — Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* ✅ Boot reveal: évite le shift sur refresh mid-scroll, puis laisse le reveal normal */}
        <Script
          id="reveal-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var root = document.documentElement;

    // Ready flag for CSS gating
    root.setAttribute("data-reveal-ready", "1");

    // If reload happens while already scrolled, avoid "pending" hiding for 1 frame (prevents divider jump)
    var y = 0;
    try { y = window.scrollY || 0; } catch (e) {}
    if (y > 32) root.setAttribute("data-reveal-skip", "1");

    requestAnimationFrame(function () {
      try { root.removeAttribute("data-reveal-skip"); } catch (e) {}
    });
  } catch (e) {}
})();`,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
