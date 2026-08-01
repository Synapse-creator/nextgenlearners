
import type {Metadata} from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';

const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-sans',
  weight: ['400', '700']
});


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nextgenlearners.education';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Fun Children’s Online Educational Games – NextGen Learners',
  description: 'Try free online learning games and educational games online at NextGen Learners—PK-3, playful curriculum, AI insights, and fun learning.',
  openGraph: {
    title: 'Fun Children’s Online Educational Games – NextGen Learners',
    description: 'Try free online learning games and educational games online at NextGen Learners—PK-3, playful curriculum, AI insights, and fun learning.',
    images: [
      {
        url: '/lmssnap.png',
        width: 1200,
        height: 630,
        alt: 'NextGen Learners Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fun Children’s Online Educational Games – NextGen Learners',
    description: 'Try free online learning games and educational games online at NextGen Learners.',
    images: ['/lmssnap.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#fdf6e3" />
      </head>
      <body className={cn(
        "font-body antialiased",
        ptSans.variable
      )}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

