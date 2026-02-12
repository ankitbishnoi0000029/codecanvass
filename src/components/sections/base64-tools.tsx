// components/sections/base64-tools.tsx
"use client"

import React, { useEffect, useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Upload, Download, Palette, Settings } from "lucide-react"
import { getTableData } from "@/actions/dbAction"
import { dataType } from "@/utils/types/uiTypes"


interface Base64Props {
  list: dataType[]
}

export function Base64Tools() {
  const [selectedConverter, setSelectedConverter] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [outputValue, setOutputValue] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [list, setList] = useState<dataType[] | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("encode_decode") as dataType[];
      setList(categoriesData);
    };
    fetchData();
  }, []);
  // Build sidebar options from DB list, handling possible null value for 'list'
  const converterOptions: SidebarOption[] = (list ?? []).map((item) => ({
    id: String(item.id),
    label: item.urlName,
    icon: Palette,
  }))

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const selectedOption = list?.find((opt) => opt.id === selectedConverter) ?? null

  useEffect(() => {
    if (list && list.length > 0) setSelectedConverter(list[0].id)
  }, [list])

  const handleConvert = () => {
    if (!selectedOption) return

    const converter = selectedOption.urlName.toLowerCase()

    try {
      // IMAGE → BASE64
      if (converter === "image-to-base64" && file) {
        const reader = new FileReader()
        reader.onload = () => setOutputValue(String(reader.result || ""))
        reader.readAsDataURL(file)
      }

      // BASE64 → IMAGE
      else if (converter === "base64-to-image") {
        setOutputValue(inputValue)
      }

      // BINARY → BASE64
      else if (converter === "binary-to-base64") {
        const binaryStr = inputValue.replace(/\s/g, "")
        const bytes = binaryStr.match(/.{1,8}/g) || []
        const text = bytes.map((bin) => String.fromCharCode(parseInt(bin, 2))).join("")
        setOutputValue(btoa(text))
      }

      // BASE64 → BINARY
      else if (converter === "base64-to-binary") {
        const decoded = atob(inputValue)
        const binary = decoded
          .split("")
          .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
          .join(" ")
        setOutputValue(binary)
      }

      // HEX → BASE64
      else if (converter === "hex-to-base64") {
        const hex = inputValue.replace(/\s/g, "")
        const bytes = hex.match(/.{1,2}/g) || []
        const text = bytes.map((h) => String.fromCharCode(parseInt(h, 16))).join("")
        setOutputValue(btoa(text))
      }

      // BASE64 → HEX
      else if (converter === "base64-to-hex") {
        const decoded = atob(inputValue)
        const hex = decoded
          .split("")
          .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(" ")
        setOutputValue(hex.toUpperCase())
      }

      // OCTAL → BASE64
      else if (converter === "octal-to-base64") {
        const octal = inputValue.replace(/\s/g, "")
        const bytes = octal.match(/.{1,3}/g) || []
        const text = bytes.map((o) => String.fromCharCode(parseInt(o, 8))).join("")
        setOutputValue(btoa(text))
      }

      // BASE64 → OCTAL
      else if (converter === "base64-to-octal") {
        const decoded = atob(inputValue)
        const oct = decoded
          .split("")
          .map((c) => c.charCodeAt(0).toString(8).padStart(3, "0"))
          .join(" ")
        setOutputValue(oct)
      }

      // TEXT → BASE64
      else if (converter.includes("to-base64")) {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
      }

      // BASE64 → TEXT
      else if (converter.includes("base64-to")) {
        setOutputValue(decodeURIComponent(escape(atob(inputValue))))
      }

      else {
        setOutputValue("⚠️ Unsupported converter.")
      }

    } catch (err) {
      setOutputValue("⚠️ Conversion failed. Invalid input format.")
    }
  }

  const handleOptionChange = (id: string) => {
    setSelectedConverter(Number(id))
    setInputValue("")
    setOutputValue("")
    setFile(null)
  }

  const handleClear = () => {
    setInputValue("")
    setOutputValue("")
    setFile(null)
  }

  const handleDownload = () => {
    if (!outputValue) return
    const blob = new Blob([outputValue], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedOption?.urlName || "output"}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ReusableSidebar
      title="Base64 Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={String(selectedConverter)}
      onOptionSelect={handleOptionChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption as unknown as SidebarOption | undefined}>
        <div className="mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{(selectedOption as any)?.urlName}</h2>
            <p className="text-sm text-muted-foreground">{(selectedOption as any)?.des}</p>
          </div>

          {/* Input + Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Input</label>

              {selectedOption?.urlName === "image-to-base64" ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input type="file" accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file && <p className="mt-2 text-sm">Selected: {file.name}</p>}
                </div>
              ) : (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter text, hex, binary or Base64..."
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-full"
                  rows={8}
                />
              )}
            </div>

            {/* Output */}
            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[12rem]">

                {selectedOption?.urlName === "base64-to-image" && outputValue ? (
                  <img src={outputValue} className="mx-auto max-h-60 rounded-lg" />
                ) : (
                  <textarea
                    readOnly
                    value={outputValue}
                    className="border-none bg-transparent resize-none w-full h-full text-sm"
                  />
                )}

              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleConvert}>
              <Upload className="h-4 w-4 mr-2" /> Convert
            </Button>

            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>

            {outputValue && (
              <Button variant="secondary" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            )}
          </div>

        </div>
 {/* DETAILS BOX */}
 {selectedOption && (
  <div className="my-8 p-4 border rounded-lg bg-gray-50 space-y-3">
    <h3 className="text-lg font-semibold">Converter Details</h3>

    <p>
      <strong>Description:</strong>
      <br />
      {selectedOption.des}
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
  )
}

export default Base64Tools
