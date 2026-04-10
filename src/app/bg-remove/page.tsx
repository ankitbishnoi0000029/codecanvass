import { getMetaCached } from "@/actions/dbAction"
import BGRemover from "@/components/sections/bg-remove";
export const dynamic = 'force-dynamic';

export async function generateMetadata(){

  const data = await getMetaCached('bg-remove');

  return {
    title: data?.title || "BG Remover Online",
    description: data?.description || "Free online background remover tool.",
    keywords: data?.keywords || "background remover, image editor, online tools",
    robots: "index, follow",
  };
}

export default async function Page(){

  const data = await getMetaCached('bg-remove');

  return <BGRemover data={data.pageData} />;
}
