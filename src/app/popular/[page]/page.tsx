import { getNewPageContent } from "@/actions/dbAction";
import PopularTools from "@/components/sections/popular-tools";
import { PageDataUI } from "@/utils/types/uiTypes";

// ✅ METADATA
export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params; // ✅ FIX

  console.log("Generating metadata for page =>", page);

  try {
    const res = await getNewPageContent(page);
    const data = res?.data || {};

    return {
      title: data.seo_title || data.title || "Default Title",
      description: data.seo_description || "Default description",
    };
  } catch (err) {
    console.error("Metadata error:", err);
    return {
      title: "Error",
      description: "Error loading page",
    };
  }
}

// ✅ PAGE COMPONENT
const Page = async ({ params }: { params: Promise<{ page: string }> }) => {
  const { page } = await params; // ✅ FIX

  let data : PageDataUI | null = null;

  try {
    const res = await getNewPageContent(page);
    data = res?.data || null;

    console.log("PAGE DATA:", data);
  } catch (err) {
    console.error("Page fetch error:", err);
  }

  return <PopularTools data = {data || {}} />;
};

export default Page;