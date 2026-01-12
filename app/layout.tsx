// app/layout.tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      data-reveal-ready="1"
      style={{ visibility: "visible" }}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
