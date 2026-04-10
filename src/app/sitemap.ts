import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aionlinetoolss.com";

  const routes = [
    "",
    "/backgroundremover",
    "/videodownloder",
    "/blog",

    "/sql-converters/sql-to-csv",
    "/sql-converters/sql-to-json",
    "/sql-converters/sql-to-xml",
    "/sql-converters/sql-to-yaml",
    "/sql-converters/sql-to-html",

    "/encode-decode/base64-encode",
    "/encode-decode/base64-decode",

    "/base64-tools/image-to-base64",
    "/base64-tools/base64-to-image",

    "/json-converters/json-to-xml",
    "/xml-converters/xml-to-json",

    "/minifier/json-minify",
    "/minifier/js-minify",

    "/popular/number-to-words",

    "/pdf-tool/",
    "/pdf-tool/mergepdf",
    "/pdf-tool/splitPDF",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.7,
  }));
}