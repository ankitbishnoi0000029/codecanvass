import { VideoDownloder } from "@/components/sections/videodownloder";
import { buildMetadata } from "@/utils/seo/metdata";

export async function generateMetadata() {
  return buildMetadata({
    table: "navbar",
    urlId: 'videodownloder',
    route: `/videodownloder`,
    fallbackTitle:       "Background Remover Online",
    fallbackDescription: "Free online background remover to remove backgrounds from images instantly.",
    fallbackKeywords:    "background remover, background removal, online background remover, image editor",
  });
}


export default function Page() {
  return (
    <VideoDownloder />
  );
}