import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aionlinetoolss.com"; // ✅ single version use

  const routes = [
    // core pages
    "",
    "/contact",
    "/blog",
    "/disclaimer",
    "/qr-generator",
    "/bg-remove",
    "/xml-formatter",
    "/gbl-gltf-compress",
    "/pdf-tool",

    // html tools
    "/html-converters/html-stripper",
    "/html-converters/html-to-markdown",
    "/html-converters/markdown-to-html",

    // json tools
    "/json-formatter",
    "/json-converters/json-to-tsv",
    "/json-converters/json-to-csv",

    // popular
    "/popular/css-beautifier",
    "/popular/hex-to-pantone",
    "/popular/source-code-viewer",
    "/popular/javascript-validator",
    "/popular/number-to-words",
    "/popular/hex-to-decimal",
    "/popular/rem-to-px-converter",
    "/popular/excel-to-html",
    "/popular/decimal-to-hex",
    "/popular/binary-to-decimal",
    "/popular/ascii-to-text",
    "/popular/css-validator",

    // trending tools
    "/trendingtool/php-formatter",
    "/trendingtool/paraphrasing-tool",
    "/trendingtool/number-utilities",
    "/trendingtool/sha512-hash",
    "/trendingtool/image-to-ascii-art",
    "/trendingtool/word-to-html",
    "/trendingtool/lua-beautifier",
    "/trendingtool/html-stripper",
    "/trendingtool/mirror-online",
    "/trendingtool/lua-minifier",
    "/trendingtool/csv-to-excel",
    "/trendingtool/sha256-hash",
    "/trendingtool/bitwise-calculation",
    "/trendingtool/excel-viewer",
    "/trendingtool/wordpress-password-hash",
  ];

  // remove duplicates
  const uniqueRoutes = [...new Set(routes)];

  return uniqueRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.7,
  }));
}