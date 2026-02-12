"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import { Palette, Settings } from "lucide-react";

import { encode as base32Encode, decode as base32Decode } from "hi-base32";
import bs58 from "bs58";
import { getTableData } from "@/actions/dbAction";
import { dataType } from "@/utils/types/uiTypes";
import { useRouter } from "next/navigation";



/* ------------------------------------------------------
   ✔ MAIN COMPONENT
------------------------------------------------------ */
export default function EncodeDecode() {

  const [list, setList] = useState<dataType[] | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("encode_decode") as dataType[];
      setList(categoriesData);
    };
    fetchData();
  }, []);
  /* Convert SQL → Sidebar format */
  const converterOptions: SidebarOption[] = useMemo(() => {
    if (!list) return [];
    return list.map((row) => ({
      id: row.route ?? "",
      label: row.urlName,
      description: row.des,
      keyword : row.keyword,
      icon: Palette,
    }));
  }, [list]);

  /* Default selected tool from first row */
  const defaultTool = converterOptions[0]?.id || "";
// console.log("defaultTool",defaultTool)
  const [selectedConverter, setSelectedConverter] = useState(defaultTool);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const router = useRouter();
  /* Selected Option */

  /* Auto select first tool once list is loaded */
useEffect(() => {
  if (converterOptions.length > 0 && !selectedConverter) {
    setSelectedConverter(converterOptions[0].id);
  }
}, [converterOptions, selectedConverter]);

  const selectedOption = useMemo(
    () => converterOptions.find((opt) => opt.id === selectedConverter),
    [selectedConverter, converterOptions]
  );
  /* Footer options */
  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  /* When user selects new tool */
  const handleConverterChange = (id: string) => {
    setSelectedConverter(id);
    router.push(`/encode-decode/${id}`);
    setInput("");
    setOutput("");
  };

  /* ------------------------------------------------------
     ✔ CONVERSION ENGINE
  ------------------------------------------------------ */
  const handleConvert = () => {
    try {
      let result = "";

      switch (selectedConverter) {
        /* ---------- BASE32 ---------- */
        case "base32-encode":
          result = base32Encode(input);
          break;

        case "base32-decode":
          result = base32Decode(input.toUpperCase().replace(/\s/g, ""));
          break;

        /* ---------- BASE58 ---------- */
        case "base58-encode":
          result = bs58.encode(new TextEncoder().encode(input));
          break;

        case "base58-decode": {
          const cleanInput = input.trim();
          if (!cleanInput) throw new Error("Input cannot be empty");

          const base58Regex =
            /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

          if (!base58Regex.test(cleanInput))
            throw new Error("Invalid Base58 string");

          const decoded = bs58.decode(cleanInput);
          result = new TextDecoder().decode(decoded);
          break;
        }

        /* ---------- BASE64 ---------- */
        case "base64-encode":
          result = btoa(unescape(encodeURIComponent(input)));
          break;

        case "base64-decode":
          result = decodeURIComponent(escape(atob(input)));
          break;

        /* ---------- URL ---------- */
        case "url-encode":
          result = encodeURIComponent(input);
          break;

        case "url-decode":
          result = decodeURIComponent(input);
          break;

        /* ---------- JSON URL ---------- */
        case "json-url-encode":
          try {
            result = encodeURIComponent(JSON.stringify(JSON.parse(input)));
          } catch {
            result = encodeURIComponent(input);
          }
          break;

        case "json-url-decode":
          result = JSON.stringify(
            JSON.parse(decodeURIComponent(input)),
            null,
            2
          );
          break;

        /* ---------- HTML ---------- */
        case "html-encode":
          result = input.replace(
            /[\u00A0-\u9999<>&"']/g,
            (i) => `&#${i.charCodeAt(0)};`
          );
          break;

        case "html-decode": {
          const textarea = document.createElement("textarea");
          textarea.innerHTML = input;
          result = textarea.value;
          break;
        }

        /* ---------- XML ---------- */
        case "xml-url-encode":
          result = encodeURIComponent(input);
          break;

        case "xml-url-decode":
          result = decodeURIComponent(input);
          break;

        /* ---------- UTF-8 ---------- */
        case "utf8-converter":
          result = Array.from(new TextEncoder().encode(input)).join(", ");
          break;

        case "utf8-decode": {
          const bytes = input
            .split(",")
            .map((s) => parseInt(s.trim()))
            .filter((n) => !isNaN(n));
          result = new TextDecoder().decode(Uint8Array.from(bytes));
          break;
        }

        /* ---------- HEX ---------- */
        case "hex-to-utf8": {
          const hexStr = input.replace(/^0x/, "").replace(/\s/g, "");
          if (!/^[0-9a-fA-F]*$/.test(hexStr))
            throw new Error("Invalid hex string.");

          const hexBytes: number[] = [];
          for (let i = 0; i < hexStr.length; i += 2) {
            hexBytes.push(parseInt(hexStr.substr(i, 2), 16));
          }
          result = new TextDecoder().decode(Uint8Array.from(hexBytes));
          break;
        }

        /* ---------- JSON ---------- */
        case "json-decode-online":
          result = JSON.stringify(JSON.parse(input), null, 2);
          break;

        case "json-encode-online":
          try {
            result = JSON.stringify(JSON.parse(input));
          } catch {
            result = JSON.stringify(input);
          }
          break;

        default:
          result = "⚠️ Please select a valid converter.";
      }

      setOutput(result);
    } catch (err: any) {
      setOutput(`❌ Error: ${err.message}`);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };
// console.log(selectedOption)
  /* ------------------------------------------------------
     ✔ UI
  ------------------------------------------------------ */
  return (
    <ReusableSidebar
      title={selectedOption?.label || "Encode & Decode Tools"}
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {selectedOption?.label || "Select a Tool"}
            </h2>

            <p className="text-muted-foreground">
              {selectedOption?.description ??
                "Choose an encoding or decoding tool to begin."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-full h-48 font-mono"
                placeholder="Enter your text or data here..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <textarea
                value={output}
                readOnly
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-full h-48 bg-gray-50 font-mono"
                placeholder="Your result will appear here..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
        {/* DETAILS BOX */}
        {selectedOption && (
  <div className="my-8 p-4 border rounded-lg bg-gray-50 space-y-3">
    <h3 className="text-lg font-semibold">Converter Details</h3>

    <p>
      <strong>Description:</strong>
      <br />
      {selectedOption.description}
    </p>

    <div>
      <strong className="block mb-2">Keywords:</strong>

      <div className="flex flex-wrap gap-2">
        {(selectedOption?.keyword ?? "")
          .split(",")
          .filter(Boolean)
          .map((kw: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200 shadow-sm hover:bg-purple-200 transition "
            >
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
