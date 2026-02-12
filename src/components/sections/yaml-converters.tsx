"use client";

import { useState, useEffect } from "react";
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Download, RotateCcw } from "lucide-react";
import { dataType } from "@/utils/types/uiTypes";
import { getTableData } from "@/actions/dbAction";

export function YamlConverters() {
  const [selectedConverter, setSelectedConverter] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");

  const [list, setList] = useState<dataType[]>([]);

  // Fetch SQL Tools
  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("yaml_converters");
      setList(categoriesData as dataType[]);
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

  // Get selected dataType for business logic
  const selectedData = list.find(
    (opt) => opt.id.toString() === selectedConverter
  );

  // Get selected SidebarOption for UI
  const selectedOption = sidebarOptions.find(
    (opt) => opt.id === selectedConverter
  );

  // Reset inputs on converter change
  useEffect(() => {
    setInputText("");
    setOutputText("");
  }, [selectedConverter]);

  // --- Conversion Logic ---
  const convertYaml = (yaml: string, type: string): string => {
    try {
      const lines = yaml.split("\n");
      const obj: Record<string, any> = {};

      lines.forEach((line) => {
        const [key, value] = line.split(":").map((x) => x.trim());
        if (key) obj[key] = value;
      });

      switch (type) {
        case "yaml-to-json":
          return JSON.stringify(obj, null, 2);

        case "yaml-to-xml":
          return (
            "<root>" +
            Object.entries(obj)
              .map(([k, v]) => `<${k}>${v}</${k}>`)
              .join("") +
            "</root>"
          );

        case "yaml-to-csv":
          return Object.keys(obj).join(",") + "\n" + Object.values(obj).join(",");

        case "yaml-to-tsv":
          return Object.keys(obj).join("\t") + "\n" + Object.values(obj).join("\t");

        case "yaml-to-text":
          return Object.entries(obj)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");

        case "yaml-to-html":
          return `<table border="1"><tr>${Object.keys(obj)
            .map((k) => `<th>${k}</th>`)
            .join("")}</tr><tr>${Object.values(obj)
            .map((v) => `<td>${v}</td>`)
            .join("")}</tr></table>`;

        default:
          return "Unsupported conversion type";
      }
    } catch (err) {
      return "❌ Invalid YAML input";
    }
  };

  // --- Handlers ---
  const handleConvert = () => {
    if (!selectedConverter) {
      alert("Please select a converter.");
      return;
    }

    const type = selectedData?.urlName || "";
    setOutputText(convertYaml(inputText, type));
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  const handleDownload = () => {
    if (!outputText) return;

    const blob = new Blob([outputText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedData?.urlName || "converted"}.txt`;
    link.click();
  };

  return (
    <ReusableSidebar
      title="YAML Converters"
      icon={Palette}
      options={sidebarOptions}
      selectedOption={selectedConverter}
      onOptionSelect={(id) => setSelectedConverter(id)}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            {selectedData?.urlName || "Select a Converter"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {selectedData?.des ||
              "Choose a conversion type from the sidebar to begin."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Input YAML</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border-2 border-dashed rounded-lg p-3 h-96 w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Output</label>
              <textarea
                value={outputText}
                readOnly
                className="border-2 border-dashed rounded-lg p-3 h-96 w-full bg-gray-50"
              />

              {outputText && (
                <Button className="mt-3" variant="secondary" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleConvert}>Convert</Button>

            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="mr-1 h-4 w-4" /> Clear
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

export default YamlConverters;
