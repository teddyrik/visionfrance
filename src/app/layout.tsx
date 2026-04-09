import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  siteConfig,
} from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Vision France",
    template: "%s | Vision France",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
  category: "education",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/globe.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/globe.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${manrope.variable} ${sourceSerif.variable}`}>
      <body>
        <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
        {children}
      </body>
    </html>
  );
}
