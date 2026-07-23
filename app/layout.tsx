import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { THEME_INIT } from "@/components/Theme";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MessyLaunch — you don\u2019t need everything figured out to start",
  description:
    "MessyLaunch helps business owners turn scattered ideas, unfinished pieces, and missed opportunities into a clear offer, a working customer journey, and a simple system they can actually use to launch, fix, and grow.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "MessyLaunch — you don\u2019t need everything figured out to start",
    description:
      "Turn scattered ideas and missed opportunities into a clear offer, a working customer journey, and a system you can actually use.",
    images: [{ url: "/art/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/art/og.jpg"] },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Messy Launch" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080e" },
    { media: "(prefers-color-scheme: light)", color: "#f6f0e2" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
