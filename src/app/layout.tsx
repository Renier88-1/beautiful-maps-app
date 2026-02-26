import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beautiful Maps - Create Stunning Map Art",
  description: "Create stunning map artwork with cinematic styles, elegant typography overlays, and professional export for print-on-demand platforms like Etsy.",
  keywords: ["map art", "map poster", "city map", "Etsy print", "map visualization", "cartography", "wall art"],
  authors: [{ name: "Beautiful Maps" }],
  openGraph: {
    title: "Beautiful Maps - Create Stunning Map Art",
    description: "Create stunning map artwork with cinematic styles and professional export",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${dmSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
