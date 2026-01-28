import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beautiful Maps - 3D Map Publishing Platform",
  description: "Create stunning 3D maps with cinematic styles, data visualizations, and export capabilities. No GIS expertise required.",
  keywords: ["3D maps", "map visualization", "GIS", "cartography", "data visualization"],
  authors: [{ name: "Beautiful Maps" }],
  openGraph: {
    title: "Beautiful Maps - 3D Map Publishing Platform",
    description: "Create stunning 3D maps with cinematic styles and data visualizations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
