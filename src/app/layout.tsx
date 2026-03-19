import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/ui/footer';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import { SubNavbar } from '@/components/navbar/sub-navbar';
import { getTableData } from '@/actions/dbAction';
// ❌ REMOVE this if not needed
// import { categories } from '@/utils/consitants/consitaint';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Online Tools - Power Your Code with AI Tools',
  description:
    'AI Online Tools - Power Your Code with AI Tools - A collection of free online AI tools to enhance your coding experience. From code compression to background removal, explore our suite of AI-powered utilities designed for developers.',
};

// ✅ MAKE ASYNC
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Rename variables to avoid conflict
  const categoriesData = await getTableData("categories");
  const subcategoriesData = await getTableData("subcategories");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white`}
      >
        <Navbar />
        <SubNavbar cate={categoriesData} sub={subcategoriesData} />
        <Analytics />

        {children}

        <Toaster position="top-right" richColors />
        <Footer />
      </body>
    </html>
  );
}