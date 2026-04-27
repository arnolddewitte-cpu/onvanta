import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ImpersonationBanner from "@/components/impersonation-banner";

const isProd = process.env.NODE_ENV === 'production'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Onvanta - New hires, productive faster",
    template: "%s | Onvanta",
  },
  description: "Structured onboarding, spaced repetition flashcards, and manager visibility — all in one system built for growing teams.",
  keywords: ["employee onboarding", "onboarding software", "new hire training", "spaced repetition", "HR software", "onboarding platform"],
  authors: [{ name: "Onvanta" }],
  creator: "Onvanta",
  metadataBase: new URL("https://onvanta.io"),
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://onvanta.io",
    siteName: "Onvanta",
    title: "Onvanta - New hires, productive faster",
    description: "Structured onboarding, spaced repetition flashcards, and manager visibility — all in one system built for growing teams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onvanta - New hires, productive faster",
    description: "Structured onboarding, spaced repetition flashcards, and manager visibility — all in one system built for growing teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {isProd && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-6VKYLX0HTZ"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-6VKYLX0HTZ');
              `}
            </Script>
          </>
        )}
        <ImpersonationBanner />
        {children}
      </body>
    </html>
  );
}
