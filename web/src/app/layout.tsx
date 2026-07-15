import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Termite",
  description: "Control de producción · Carpintería Escobar",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Termite',
  },
  icons: {
    icon: [{ url: '/termita.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/termita.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
