const fs = require("fs");
const path = require("path");

const basePath = "/Users/amitsain/Downloads/code-beauty/src/app";

const categories = [
  "color-converters",
  "unit-converter",
  "sql-converters",
  "encode-decode",
  "base64-tools",
  "image-tools",
  "converters",
  "json-converters",
  "xml-converters",
  "html-converters",
  "yaml-converters",
  "utility",
  "chart-tools",
  "viewers",
  "programming-editors",
  "parsers",
  "css-tools",
  "escape-unescape",
  "cryptography-tools",
  "beautifiers",
  "minifier",
  "csv-tools",
  "string-utilities",
  "syntax-highlighting",
  "compress-decompress",
  "validators",
  "number-utilities",
  "bitwise-tools",
  "ip-tools",
  "other-tools",
  "random-tools",
];

categories.forEach((category) => {
  const categoryPath = path.join(basePath, category, "[tool]");
  const pagePath = path.join(categoryPath, "page.tsx");

  fs.mkdirSync(categoryPath, { recursive: true });

  if (!fs.existsSync(pagePath)) {
    const content = `export default function ToolPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dynamic Tool Page</h1>
      <p>This is a dynamic tool page for ${category}.</p>
    </div>
  );
}
`;
    fs.writeFileSync(pagePath, content);
  }
});

console.log("✅ All category folders with [tool]/page.tsx created successfully!");
