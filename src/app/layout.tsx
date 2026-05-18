import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { siteConfig } from "@/lib/config/site";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/jsonld";

import { GoogleAnalytics } from "@next/third-parties/google";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/lib/cart/CartContext";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  openGraph: {
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = buildOrganizationJsonLd();
  const siteJsonLd = buildWebSiteJsonLd();

  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <NextTopLoader
          color="#d97706" // amber-600
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #d97706,0 0 5px #d97706"
        />
        <ToastProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ToastProvider>
        <GoogleAnalytics gaId="G-BV3CLDSH3M" />
      </body>
    </html>
  );
}
