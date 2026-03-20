import type { Metadata } from "next";
import { getMeta } from "@/actions/dbAction";

const SITE_NAME = "AI Online Tools";
export const SITE_URL = "https://aionlinetoolss.com";

interface GenerateMetaOptions {
  table: string;
  urlId: string;
  route: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackKeywords?: string;
}

/** Safely parse any raw DB value into a flat key-value object */
const parseMeta = (raw: unknown): Record<string, string> => {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  if (typeof raw === "object" && raw !== null) return raw as Record<string, string>;
  return {};
};

/** Read a value from meta — return undefined if missing/empty */
const get = (meta: Record<string, string>, key: string): string | undefined => {
  const v = meta[key];
  return v && v.trim() !== "" ? v.trim() : undefined;
};

export const buildMetadata = async ({
  table,
  urlId,
  route,
  fallbackTitle = "Online Tool",
  fallbackDescription = "Explore our powerful free online tools.",
  fallbackKeywords = "online tools, utilities, converter",
}: GenerateMetaOptions): Promise<Metadata> => {
  let data;
  try {
    data = await getMeta(table, urlId);
    // console.log(`Fetched data for ${table}/${urlId}:`, data);
  } catch (error) {
    console.warn(`Failed to fetch metadata for ${table}/${urlId}:`, error);
    data = { metadata: null, dbSlug: null };
  }

  const meta = parseMeta(data.metadata);
  const dbSlug = data.dbSlug; // from the database column

  /* ── core values with defaults ── */
  const title = get(meta, "title") ?? fallbackTitle;
  const description = get(meta, "description") ?? fallbackDescription;
  const keywords = get(meta, "keywords") ?? fallbackKeywords;
const robots  = get(meta, "robots") ?? "index, follow"; // default to allowing indexing
  /* ── URL slug: prefer metadata.urlSlug, then db slug, then route ── */
  const urlSlug =  dbSlug ;
  const canonical = urlSlug ? `${SITE_URL}/${urlSlug}/${route}` : `${SITE_URL}${route}`;


  /* ── OG ── */
  const ogTitle = get(meta, "ogTitle") ?? title;
  const ogDescription = get(meta, "ogDescription") ?? description;
  const ogImage = get(meta, "ogImage");
  const ogUrl = get(meta, "ogUrl") ?? canonical;
  const ogType = get(meta, "ogType") ?? "website";

  /* ── Image ── */
  const imageAlt = get(meta, "imageAlt") ?? title;
  const imageFileName = get(meta, "imageFileName");

  /* ── Page Content ── */
  const pageContent = get(meta, "pageContent");

  /* ── Collect any EXTRA / unknown fields that exist in meta ──
     so future fields added in DB are never silently dropped    */
  const knownKeys = new Set([
    "title", "description", "keywords",
    "ogTitle", "ogDescription", "ogImage", "ogType", "ogUrl",
    "imageAlt", "imageFileName",
    "urlSlug", "pageContent",
  ]);

  const extraOther = Object.entries(meta)
    .filter(([k]) => !knownKeys.has(k) && meta[k]?.trim())
    .reduce<Record<string, string>>((acc, [k, v]) => {
      acc[`x-meta-${k}`] = v;
      return acc;
    }, {});

  /* ── Build final Metadata object ── */
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords,
robots,
    openGraph: {
      title: `${ogTitle} | ${SITE_NAME}`,
      description: ogDescription,
      url: ogUrl,
      type: ogType as any,
      siteName: SITE_NAME,
      ...(ogImage && {
        images: [{
          url: ogImage,
          alt: imageAlt,
        }],
      }),
    },

    twitter: {
      card: "summary_large_image",
      title: `${ogTitle} | ${SITE_NAME}`,
      description: ogDescription,
      ...(ogImage && { images: [ogImage] }),
    },

    alternates: {
      canonical,
    },

    other: {
      "url-slug": urlSlug,
      "image-alt": imageAlt,
      ...(imageFileName && { "image-file-name": imageFileName }),
      ...(pageContent && { "page-content": pageContent }),
      ...extraOther,
    },
  };
};