"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import { Download, Settings, Palette } from "lucide-react";
import { getTableData } from "@/actions/dbAction";
import { dataType } from "@/utils/types/uiTypes";


export function SqlConverter() {
  const router = useRouter();

  const [selectedConverter, setSelectedConverter] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [output, setOutput] = useState("");
  const [list, setList] = useState<dataType[] | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("sql_converters") as dataType[];
      setList(categoriesData);
    };
    fetchData();
  }, []);

  // Build sidebar options from DB list
  const converterOptions: SidebarOption[] = list?.map((item) => ({
    id: item.route || "",
    label: item.urlName,
    description: item.des,
    icon: Palette,
  })) || [];
  let pathname = usePathname();
  const lastSegment = pathname.split("/").pop() as string;




  // Sync URL slug → selected converter
  useEffect(() => {
    setSelectedConverter(lastSegment);
    setInputValue("");
    setOutput("");
  }, [lastSegment]);

   // Get the selected DB row safely
  const selectedData = list?.find((i) => i.route === selectedConverter) || null;

  const selectedOption = converterOptions.find((opt) => opt.id === selectedConverter);

  const footerOptions: SidebarOption[] = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  // ⬅️ When user selects an item from sidebar
  const handleConverterChange = (converterId: string) => {
    router.push(`/sql-converters/${converterId}`);
  };


  // Temporary converter logic
  const convertSqlData = (type: string, input: string) => {
    if (!input.trim()) return "No SQL data provided.";
    return `Converted (${type}):\n\n${input}`;
  };

  const handleConvert = () => {
    if (!selectedConverter) return;
    const result = convertSqlData(selectedConverter, inputValue);
    setOutput(result);
  };

  const handleClear = () => {
    setInputValue("");
    setOutput("");
  };

  const handleDownload = () => {
    if (!output) return;

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ReusableSidebar
      title="SQL Converter"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          {/* TITLE + DESCRIPTION */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {selectedData?.urlName || "SQL Converter"}
            </h2>

            <p className="text-muted-foreground">
              {selectedData?.des ||
                selectedOption?.description ||
                "Choose a converter from the sidebar to get started."}
            </p>
          </div>



          {/* INPUT + OUTPUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium block">Input SQL Data</label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter SQL or structured data..."
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-full h-48"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <label className="text-sm font-medium block">Output</label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[150px] overflow-auto text-sm">
                {output ? (
                  <pre className="whitespace-pre-wrap break-all">{output}</pre>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                    <Download className="h-8 w-8 mb-2" />
                    <p>Converted results will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex gap-3">
            <Button onClick={handleConvert} disabled={!selectedConverter || !inputValue.trim()}>
              Convert
            </Button>

            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!inputValue && !output}
            >
              Clear
            </Button>

            <Button variant="secondary" onClick={handleDownload} disabled={!output}>
              <Download className="mr-2 h-4 w-4" />
              Download
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
