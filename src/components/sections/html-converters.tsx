"use client";

import { useEffect, useState } from "react";
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import { Palette, Settings, RefreshCw, Copy } from "lucide-react";

import { stripHTML } from "@/utils/utils";
import { dataType } from "@/utils/types/uiTypes";
import { getTableData } from "@/actions/dbAction";

export function HtmlConverters() {
  const [selectedConverter, setSelectedConverter] = useState<string>("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [list, setList] = useState<dataType[]>([]);

  // Load SQL Data
  useEffect(() => {
    const fetchData = async () => {
      const rows = await getTableData("html_converters");
      setList(rows as dataType[]);
    };
    fetchData();
  }, []);

  // Convert SQL data to SidebarOption format
  const sidebarOptions: SidebarOption[] = list.map((item) => ({
    id: item.id.toString(),
    label: item.urlName,
    icon: Palette,
  }));

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const selectedOption = sidebarOptions.find(
    (opt) => opt.id === selectedConverter
  );

  const selectedData = list.find(
    (opt) => opt.id.toString() === selectedConverter
  );

  const handleConverterChange = (id: string) => {
    setSelectedConverter(id);
    setInput("");
    setOutput("");
  };

  // ==========================================================
  // HTML CONVERSION FUNCTIONS
  // ==========================================================

  const extractTable = (delimiter: string) => {
    const rows = [...input.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) => r[1]);

    return (
      rows
        .map((row) => {
          const cells = [...row.matchAll(/<t[dh]>([\s\S]*?)<\/t[dh]>/g)].map((c) =>
            stripHTML(c[1]).trim()
          );
          return cells.join(delimiter);
        })
        .join("\n") || "No table found"
    );
  };

  const htmlToJSON = () =>
    JSON.stringify({ html: input }, null, 2);

  const htmlToXML = () =>
    input.replace(/<br>/g, "<br/>").replace(/&nbsp;/g, " ").trim();

  const htmlToYAML = () =>
    `html: |\n  ${input.replace(/\n/g, "\n  ")}`;

  const encodeEntities = (text: string) =>
    text
      .split("")
      .map((char) => `&#${char.charCodeAt(0)};`)
      .join("");

  const decodeEntities = (str: string) =>
    str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

  const htmlToMD = () =>
    input
      .replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      .replace(/<u>(.*?)<\/u>/g, "__$1__");

  const mdToHTML = () =>
    input
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>");

  const htmlToPug = () =>
    input.replace(/<(\w+)[^>]*>/g, "$1");

  const pugToHTML = (pug: string) =>
    pug
      .split("\n")
      .map((tag) => `<${tag}></${tag}>`)
      .join("\n");

  const jadeToHTML = (jade: string) =>
    jade
      .split("\n")
      .map((tag) => `<${tag}></${tag}>`)
      .join("\n");

  const htmlToJade = () =>
    input.replace(/<(\w+)[^>]*>/g, "$1");

  const htmlToBB = () =>
    input.replace(/<b>(.*?)<\/b>/g, "[b]$1[/b]");

  const bbToHTML = () =>
    input.replace(/\[b\](.*?)\[\/b\]/g, "<b>$1</b>");

  const csvToHTML = () =>
    `<table>
${input
  .split("\n")
  .map(
    (r) =>
      `<tr>${r
        .split(",")
        .map((c) => `<td>${c.trim()}</td>`)
        .join("")}</tr>`
  )
  .join("\n")}
</table>`;

  // ==========================================================
  // MAIN CONVERSION MAP
  // ==========================================================

  const converterMap: Record<string, () => string> = {
    "html-stripper": () => stripHTML(input),
    "html-to-text": () => stripHTML(input),
    "html-to-csv": () => extractTable(","),
    "html-to-tsv": () => extractTable("\t"),
    "html-to-json": () => htmlToJSON(),
    "html-to-xml": () => htmlToXML(),
    "html-to-yaml": () => htmlToYAML(),
    "text-to-html-entities": () => encodeEntities(input),
    "html-entities-to-text": () => decodeEntities(input),
    "html-to-markdown": () => htmlToMD(),
    "markdown-to-html": () => mdToHTML(),
    "html-to-pug": () => htmlToPug(),
    "pug-to-html": () => pugToHTML(input),
    "html-to-jade": () => htmlToJade(),
    "jade-to-html": () => jadeToHTML(input),
    "html-to-bbcode": () => htmlToBB(),
    "bbcode-to-html": () => bbToHTML(),
    "html-table-generator": () => csvToHTML(),
  };

  // ==========================================================
  // HANDLE CONVERT
  // ==========================================================

  const handleConvert = () => {
    if (!selectedData) {
      setOutput("Please select a converter");
      return;
    }

    const key = selectedData.urlName; // SQL column → converter key
    const converter = converterMap[key];

    setOutput(converter ? converter() : "Not implemented.");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    alert("Copied!");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ReusableSidebar
      title="HTML Converter Tools"
      icon={Palette}
      options={sidebarOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <h2 className="text-2xl font-bold mb-2">{selectedData?.urlName}</h2>
          <p className="text-muted-foreground mb-6">{selectedData?.des}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border-2 border-dashed rounded-lg p-3 h-[400px] w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Output</label>
              <textarea
                readOnly
                value={output}
                className="border-2 border-dashed rounded-lg p-3 h-[400px] w-full"
              />
              {output && (
                <Button className="mt-3 flex gap-2" onClick={handleCopy}>
                  <Copy size={16} /> Copy
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleConvert}>
              <RefreshCw className="h-4 w-4 mr-2" /> Convert
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>

        {/* DETAILS BOX */}
        {selectedData && (
          <div className="my-8 p-4 border rounded-lg bg-gray-50 space-y-3">
            <h3 className="text-lg font-semibold">Converter Details</h3>

            <p>
              <strong>Description:</strong>
              <br />
              {selectedData.des}
            </p>

            <div>
              <strong className="block mb-2">Keywords:</strong>

              <div className="flex flex-wrap gap-2">
                {selectedData.keyword
                  ?.split(",")
                  .map((kw, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200 shadow-sm hover:bg-purple-200 transition ">
                      {kw.trim()}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}
      </SidebarContentWrapper>
    </ReusableSidebar>
  );
}
