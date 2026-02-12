import { getTableData } from "@/actions/dbAction";
import { SubNavbar } from "@/components/navbar/sub-navbar";
import { DevelTool } from "@/components/sections/develtool";
import { NewFun } from "@/components/sections/newfun";
import { Popular } from "@/components/sections/popular";
import { TrendingTools } from "@/components/sections/trendingTools";
import WelcomePage from "@/components/ui/welcome-Page";
import type { Metadata } from "next";

interface Category {
  id: string | number;
  name: string;
}

interface Subcategory {
  id: string | number;
  route: string;
  name: string;
  category_id: string | number;
}

export const metadata: Metadata = {
  title: "CodeBeauty - Free Online Developer Tools & Utilities",
  description: "CodeBeauty offers a comprehensive collection of free online developer tools, converters, formatters, and utilities to help you code faster and better.",
  keywords: "developer tools, online tools, code formatter, json converter, base64 encoder, sql converter, web utilities",
  openGraph: {
    title: "CodeBeauty - Free Online Developer Tools & Utilities",
    description: "CodeBeauty offers a comprehensive collection of free online developer tools, converters, formatters, and utilities to help you code faster and better.",
    url: "https://codebeauty.com",
    type: "website",
    siteName: "CodeBeauty",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeBeauty - Free Online Developer Tools & Utilities",
    description: "CodeBeauty offers a comprehensive collection of free online developer tools, converters, formatters, and utilities to help you code faster and better.",
  },
  alternates: {
    canonical: "https://codebeauty.com",
  },
};

export default async function Home() {
  let categoriesData: Category[] = [];
  let subcategoriesData: Subcategory[] = [];

  try {
    categoriesData = await getTableData("categories") as Category[];
    subcategoriesData = await getTableData("subcategories") as Subcategory[];
  } catch (error) {
    console.warn("Database connection failed during build, using fallback data:", error);
    // Provide fallback empty arrays to prevent build failure
    categoriesData = [];
    subcategoriesData = [];
  }

  return (
    <main className="container mx-auto">
      <SubNavbar categoriesData={categoriesData} subcategoriesData={subcategoriesData} />
      <WelcomePage />
      <Popular />
      {/* <NewFun /> */}
      <TrendingTools/>
      <DevelTool />
    </main>
  );
}
