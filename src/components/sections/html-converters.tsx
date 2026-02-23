"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Settings,
  RefreshCw,
  Copy,
  Download,
  RotateCcw,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { stripHTML } from "@/utils/utils";
import { dataType } from "@/utils/types/uiTypes";
import { getTableData } from "@/actions/dbAction";
import { PageTitle } from "./title";
import Meta from "./meta";

// ==============================
// FILE EXTENSIONS
// ==============================
const getFileExtension = (key: string): string => {
  const map: Record<string, string> = {
    "html-stripper": "txt",
    "html-to-text": "txt",
  };

  return map[key] ?? "txt";
};

export function HtmlConverters() {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedConverter, setSelectedConverter] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [list, setList] = useState<dataType[]>([]);

  // ==============================
  // LOAD DATA
  // ==============================
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const rows = await getTableData("html_converters");
        if (!mounted) return;
        setList(Array.isArray(rows) ? (rows as dataType[]) : []);
      } catch (error) {
        console.error("Failed to load converters:", error);
        setList([]);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // ==============================
  // SYNC URL
  // ==============================
  useEffect(() => {
    if (list.length === 0) return;

    const slug = pathname.split("/").pop();

    const found = list.find(
      (item) => item.route === slug || item.id.toString() === slug
    );

    if (found) {
      setSelectedConverter(found.route ?? found.id.toString());
    } else {
      const fallback = list[0];
      const fallbackRoute = fallback.route ?? fallback.id.toString();
      setSelectedConverter(fallbackRoute);

      const basePath = pathname.split("/").slice(0, -1).join("/");
      router.replace(`${basePath}/${fallbackRoute}`);
    }
  }, [pathname, list, router]);

  // ==============================
  // CREATE SIDEBAR OPTIONS (UI MODEL)
  // ==============================
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

  // ✅ THIS FIXES YOUR ERROR
  const selectedSidebarOption = useMemo(
    () => sidebarOptions.find((opt) => opt.id === selectedConverter),
    [sidebarOptions, selectedConverter]
  );

  // DB DATA (for title/meta only)
  const selectedData = useMemo(
    () =>
      list.find(
        (item) =>
          item.route === selectedConverter ||
          item.id.toString() === selectedConverter
      ),
    [list, selectedConverter]
  );

  // ==============================
  // CHANGE CONVERTER
  // ==============================
  const handleConverterChange = useCallback(
    (id: string) => {
      if (!id || id === selectedConverter) return;

      setSelectedConverter(id);
      setInput("");
      setOutput("");

      const basePath = pathname.split("/").slice(0, -1).join("/");
      // router.replace(`${basePath}/${id}`);
    },
    [pathname, router, selectedConverter]
  );

  // ==============================
  // CONVERT
  // ==============================
  const converterMap: Record<string, () => string> = {
    "html-stripper": () => stripHTML(input),
    "html-to-text": () => stripHTML(input),
  };

  const handleConvert = useCallback(() => {
    if (!selectedData) return;

    if (!input.trim()) {
      setOutput("Please enter some input.");
      return;
    }

    const route = selectedData.route ?? selectedData.id.toString();
    const fn = converterMap[route];

    if (!fn) {
      setOutput("Converter not implemented yet.");
      return;
    }

    setOutput(fn());
  }, [input, selectedData]);

  // ==============================
  // COPY
  // ==============================
  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  // ==============================
  // DOWNLOAD
  // ==============================
  const handleDownload = () => {
    if (!output || !selectedData) return;

    const route = selectedData.route ?? selectedData.id.toString();
    const extension = getFileExtension(route);

    const blob = new Blob([output], {
      type: "text/plain;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `converted.${extension}`;
    link.click();
  };

  return (
    <ReusableSidebar
      title="HTML Converter Tools"
      icon={Palette}
      options={sidebarOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={[{ id: "settings", label: "Settings", icon: Settings }]}
    >
      {/* ✅ FIXED: passing SidebarOption instead of dataType */}
      <SidebarContentWrapper selectedOption={selectedSidebarOption}>
        <div className="mx-auto">
          {selectedData && <PageTitle selectedData={selectedData} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-3 h-[400px] w-full font-mono text-sm"
              placeholder="Enter HTML..."
            />

            <div className="border p-3 h-[400px] bg-gray-50 overflow-auto">
              {output ? (
                <pre className="text-sm whitespace-pre-wrap">{output}</pre>
              ) : (
                <p className="text-gray-400">
                  Converted output will appear here
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-2 flex-wrap">
            <Button onClick={handleConvert}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Convert
            </Button>

            <Button variant="outline" onClick={() => setInput("")}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>

            {output && (
              <>
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>

                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
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