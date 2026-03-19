import { getTableData } from '@/actions/dbAction';
import { SubNavbar } from '@/components/navbar/sub-navbar';
import { Popular } from '@/components/sections/popular';
import { TrendingTools } from '@/components/sections/trendingTools';
import WelcomePage from '@/components/ui/welcome-Page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

  title: {
    default: `${process.env.NEXT_PUBLIC_SITE_NAME} - Free Online Developer Tools`,
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  },

  description: `${process.env.NEXT_PUBLIC_SITE_NAME} offers a comprehensive collection of free online developer tools, formatters, validators, converters and utilities including JSON, XML, HTML, Base64, SQL, CSV and more.`,

  keywords: [
    'developer tools',
    'online tools',
    'json formatter',
    'json viewer',
    'json validator',
    'xml formatter',
    'xml viewer',
    'html beautifier',
    'css formatter',
    'javascript formatter',
    'base64 encoder',
    'base64 decoder',
    'sql formatter',
    'csv converter',
    'developer utilities',
    'free coding tools',
  ],

  authors: [
    {
      name: process.env.NEXT_PUBLIC_SITE_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
  ],

  creator: process.env.NEXT_PUBLIC_SITE_NAME,
  publisher: process.env.NEXT_PUBLIC_SITE_NAME,

  category: 'technology',

  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME} - Free Online Developer Tools`,
    description: `${process.env.NEXT_PUBLIC_SITE_NAME} provides powerful free developer utilities including JSON, XML, HTML, CSV, SQL, Base64 converters and formatters.`,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${process.env.NEXT_PUBLIC_SITE_NAME} - Developer Tools`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: `${process.env.NEXT_PUBLIC_SITE_NAME} - Free Online Developer Tools`,
    description: `Free online developer tools including JSON formatter, XML viewer, HTML beautifier and many utilities.`,
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  referrer: 'origin-when-cross-origin',
};

export default async function Home() {
  const res = await getTableData('popular');
  const resp = await getTableData('trendingtools');
  return (
    <main className="container mx-auto">
      <WelcomePage />
      <Popular tools={res} />
      <TrendingTools tools={resp} />
    </main>
  );
}
