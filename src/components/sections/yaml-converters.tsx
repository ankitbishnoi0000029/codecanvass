"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Download, RotateCcw, Copy } from "lucide-react";
import { dataType } from "@/utils/types/uiTypes";
import { getTableData } from "@/actions/dbAction";
import { useRouter, usePathname } from "next/navigation";
import YAML from "yaml";
import { PageTitle } from "./title";
import Meta from "./meta";

/* ============================= */
/* FILE EXTENSIONS */
/* ============================= */
const getFileExtension = (converterId: string): string => {
  const extensions: Record<string, string> = {
    "yaml-to-json": "json",
    "yaml-to-xml": "xml",
    "yaml-to-csv": "csv",
    "yaml-to-tsv": "tsv",
    "yaml-to-html": "html",
    "yaml-to-text": "txt",
    "yaml-to-base64": "txt",
    "base64-to-yaml": "yaml",
  };
  return extensions[converterId] || "txt";
};

const getConverterName = (fullPath: string): string => {
  const parts = fullPath.split("/");
  return parts[parts.length - 1];
};

/* ============================= */
/* COMPONENT */
/* ============================= */

export function YamlConverters() {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedConverter, setSelectedConverter] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [list, setList] = useState<dataType[]>([]);
  const [loaded, setLoaded] = useState(false);

  /* ============================= */
  /* LOAD DB DATA */
  /* ============================= */
  useEffect(() => {
    const fetchData = async () => {
      const rows = await getTableData("yaml_converters");
      const arr = Array.isArray(rows) ? (rows as dataType[]) : [];
      setList(arr);
      setLoaded(true);
    };
    fetchData();
  }, []);

  /* ============================= */
  /* SYNC URL SLUG AFTER LOAD */
  /* ============================= */
  useEffect(() => {
    if (!loaded || list.length === 0) return;

    const slug = pathname.split("/").pop() || "";

    const exists = list.find(
      (item) => item.route === slug || item.id.toString() === slug
    );

    if (exists) {
      setSelectedConverter(exists.route || exists.id.toString());
    } else {
      const first = list[0];
      const firstRoute = first.route || first.id.toString();
      setSelectedConverter(firstRoute);

      const basePath = pathname.split("/").slice(0, -1).join("/");
      router.replace(`${basePath}/${firstRoute}`);
    }
  }, [loaded, list, pathname, router]);

  /* ============================= */
  /* RESET ON CONVERTER CHANGE */
  /* ============================= */
  useEffect(() => {
    setInputText("");
    setOutputText("");
    setError("");
  }, [selectedConverter]);

  /* ============================= */
  /* SIDEBAR OPTIONS */
  /* ============================= */
  const sidebarOptions: SidebarOption[] = useMemo(
    () =>
      list.map((item) => ({
        id: item.route ?? item.id.toString(),
        label: item.urlName,
        description: item.des,
        keyword: item.keyword,
        icon: Palette,
      })),
    [list]
  );

  const selectedData = list.find(
    (opt) =>
      opt.route === selectedConverter ||
      opt.id.toString() === selectedConverter
  );

  const selectedOption = sidebarOptions.find(
    (opt) => opt.id === selectedConverter
  );

  /* ============================= */
  /* ROUTE CHANGE HANDLER */
  /* ============================= */
  const handleConverterChange = (id: string) => {
    if (id === selectedConverter) return;

    setSelectedConverter(id);

    const basePath = pathname.split("/").slice(0, -1).join("/");
    router.push(`${basePath}/${id}`);
  };

  /* ============================= */
  /* CONVERT LOGIC */
  /* ============================= */
  const convertYaml = (yaml: string, converterPath: string): string => {
    if (!yaml.trim()) throw new Error("Please enter YAML to convert");

    const name = getConverterName(converterPath);

    switch (name) {
      case "yaml-to-json":
        return JSON.stringify(YAML.parse(yaml), null, 2);

      case "yaml-to-text":
        return YAML.stringify(YAML.parse(yaml), { indent: 2 });

      case "yaml-to-base64":
        YAML.parse(yaml);
        return btoa(unescape(encodeURIComponent(yaml)));

      case "base64-to-yaml":
        const decoded = decodeURIComponent(escape(atob(yaml)));
        YAML.parse(decoded);
        return decoded;

      default:
        throw new Error(`Unsupported converter: ${name}`);
    }
  };

  const handleConvert = () => {
    if (!selectedConverter) return;

    try {
      setError("");
      const result = convertYaml(inputText, selectedConverter);
      setOutputText(result);
    } catch (err: any) {
      setError(err.message);
      setOutputText(`❌ Error: ${err.message}`);
    }
  };

  const handleDownload = () => {
    if (!outputText || outputText.startsWith("❌")) return;

    const extension = getFileExtension(
      getConverterName(selectedConverter)
    );

    const blob = new Blob([outputText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `converted.${extension}`;
    link.click();
  };

  /* ============================= */
  /* UI */
  /* ============================= */
  return (
    <ReusableSidebar
      title="YAML Converters"
      icon={Palette}
      options={sidebarOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={[{ id: "settings", label: "Settings", icon: Settings }]}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <PageTitle selectedData={selectedData} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="border p-3 h-96 w-full font-mono text-sm"
              placeholder="Enter YAML..."
            />

            <div className="border p-3 h-96 bg-gray-50 overflow-auto">
              {outputText ? (
                <pre className="whitespace-pre-wrap text-sm">
                  {outputText}
                </pre>
              ) : (
                <p className="text-gray-400">
                  Converted output will appear here
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={() => setInputText("")}>
              <RotateCcw className="mr-1 h-4 w-4" /> Clear
            </Button>

            {outputText && !outputText.startsWith("❌") && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(outputText)}
                >
                  <Copy className="mr-1 h-4 w-4" /> Copy
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-1 h-4 w-4" /> Download
                </Button>
              </>
            )}
          </div>
        </div>

        {selectedData && <Meta selectedData={selectedData} />}
      </SidebarContentWrapper>
    </ReusableSidebar>
  );
}

export default YamlConverters;
