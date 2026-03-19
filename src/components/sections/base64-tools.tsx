"use client"

import React, { useEffect, useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Upload, Download, Palette, Settings } from "lucide-react"
import { getTableData } from "@/actions/dbAction"
import { dataType } from "@/utils/types/uiTypes"
import { PageTitle } from "./title"

export function Base64Tools() {
  const [selectedConverter, setSelectedConverter] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [outputValue, setOutputValue] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [list, setList] = useState<dataType[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("base64_tools") as dataType[]
      setList(categoriesData)
    }
    fetchData()
  }, [])

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

  // ─── Core Conversion Logic ────────────────────────────────────────────────

  const handleConvert = () => {
    if (!selectedOption) return
    const converter = selectedOption.route.toLowerCase().trim();
    try {

      // ── IMAGE → BASE64 ──────────────────────────────────────────────────
      if (converter === "image-to-base64" || converter === "png-to-base64" || converter === "jpg-to-base64") {
        if (!file) { setOutputValue("⚠️ Please select an image file."); return }
        const reader = new FileReader()
        reader.onload = () => setOutputValue(String(reader.result || ""))
        reader.readAsDataURL(file)
        return
      }

      // ── BASE64 → IMAGE ──────────────────────────────────────────────────
      if (converter === "base64-to-image") {
        setOutputValue(inputValue.trim())
        return
      }

      // ── JSON → BASE64 ──────────────────────────────────────────────────
      if (converter === "json-to-base64") {
        // Validate JSON
        JSON.parse(inputValue)
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── BASE64 → JSON ──────────────────────────────────────────────────
      if (converter === "base64-to-json") {
        const decoded = decodeURIComponent(escape(atob(inputValue.trim())))
        // Pretty-print JSON
        const pretty = JSON.stringify(JSON.parse(decoded), null, 2)
        setOutputValue(pretty)
        return
      }

      // ── XML → BASE64 ──────────────────────────────────────────────────
      if (converter === "xml-to-base64") {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── BASE64 → XML ──────────────────────────────────────────────────
      if (converter === "base64-to-xml") {
        setOutputValue(decodeURIComponent(escape(atob(inputValue.trim()))))
        return
      }

      // ── YAML → BASE64 ──────────────────────────────────────────────────
      if (converter === "yaml-to-base64") {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── BASE64 → YAML ──────────────────────────────────────────────────
      if (converter === "base64-to-yaml") {
        setOutputValue(decodeURIComponent(escape(atob(inputValue.trim()))))
        return
      }

      // ── CSV → BASE64 ──────────────────────────────────────────────────
      if (converter === "csv-to-base64") {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── BASE64 → CSV ──────────────────────────────────────────────────
      if (converter === "base64-to-csv") {
        setOutputValue(decodeURIComponent(escape(atob(inputValue.trim()))))
        return
      }

      // ── TSV → BASE64 ──────────────────────────────────────────────────
      if (converter === "tsv-to-base64") {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── BASE64 → TSV ──────────────────────────────────────────────────
      if (converter === "base64-to-tsv") {
        setOutputValue(decodeURIComponent(escape(atob(inputValue.trim()))))
        return
      }

      // ── BINARY → BASE64 ──────────────────────────────────────────────
      if (converter === "binary-to-base64") {
        const binaryStr = inputValue.replace(/\s/g, "")
        if (!/^[01]+$/.test(binaryStr)) {
          setOutputValue("⚠️ Invalid binary string. Use only 0s and 1s.")
          return
        }
        const bytes = binaryStr.match(/.{1,8}/g) || []
        const text = bytes.map((bin) => String.fromCharCode(parseInt(bin, 2))).join("")
        setOutputValue(btoa(text))
        return
      }

      // ── BASE64 → BINARY ──────────────────────────────────────────────
      if (converter === "base64-to-binary") {
        const decoded = atob(inputValue.trim())
        const binary = decoded
          .split("")
          .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
          .join(" ")
        setOutputValue(binary)
        return
      }

      // ── HEX → BASE64 ──────────────────────────────────────────────────
      if (converter === "hex-to-base64") {
        const hex = inputValue.replace(/\s/g, "")
        if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
          setOutputValue("⚠️ Invalid hex string.")
          return
        }
        const bytes = hex.match(/.{1,2}/g) || []
        const text = bytes.map((h) => String.fromCharCode(parseInt(h, 16))).join("")
        setOutputValue(btoa(text))
        return
      }

      // ── BASE64 → HEX ──────────────────────────────────────────────────
      if (converter === "base64-to-hex") {
        const decoded = atob(inputValue.trim())
        const hex = decoded
          .split("")
          .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(" ")
        setOutputValue(hex.toUpperCase())
        return
      }

      // ── OCTAL → BASE64 ────────────────────────────────────────────────
      if (converter === "octal-to-base64") {
        const octal = inputValue.replace(/\s/g, "")
        if (!/^[0-7]+$/.test(octal)) {
          setOutputValue("⚠️ Invalid octal string. Use digits 0-7 only.")
          return
        }
        const bytes = octal.match(/.{1,3}/g) || []
        const text = bytes.map((o) => String.fromCharCode(parseInt(o, 8))).join("")
        setOutputValue(btoa(text))
        return
      }

      // ── BASE64 → OCTAL ────────────────────────────────────────────────
      if (converter === "base64-to-octal") {
        const decoded = atob(inputValue.trim())
        const oct = decoded
          .split("")
          .map((c) => c.charCodeAt(0).toString(8).padStart(3, "0"))
          .join(" ")
        setOutputValue(oct)
        return
      }

      // ── HTML → BASE64 ────────────────────────────────────────────────
      if (converter === "html-to-base64") {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── BASE64 → HTML ────────────────────────────────────────────────
      if (converter === "base64-to-html") {
        setOutputValue(decodeURIComponent(escape(atob(inputValue.trim()))))
        return
      }

      // ── CSS → BASE64 ─────────────────────────────────────────────────
      if (converter === "css-to-base64") {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── BASE64 → CSS ─────────────────────────────────────────────────
      if (converter === "base64-to-css") {
        setOutputValue(decodeURIComponent(escape(atob(inputValue.trim()))))
        return
      }

      // ── JAVASCRIPT → BASE64 ──────────────────────────────────────────
      if (converter === "javascript-to-base64") {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── BASE64 → JAVASCRIPT ──────────────────────────────────────────
      if (converter === "base64-to-javascript") {
        setOutputValue(decodeURIComponent(escape(atob(inputValue.trim()))))
        return
      }

      // ── Generic fallback: anything-to-base64 ─────────────────────────
      if (converter.endsWith("-to-base64")) {
        setOutputValue(btoa(unescape(encodeURIComponent(inputValue))))
        return
      }

      // ── Generic fallback: base64-to-anything ─────────────────────────
      if (converter.startsWith("base64-to-")) {
        setOutputValue(decodeURIComponent(escape(atob(inputValue.trim()))))
        return
      }

      setOutputValue("⚠️ Unsupported converter.")

    } catch (err) {
      setOutputValue("⚠️ Conversion failed. Please check your input format.")
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const isImageInputConverter =
    selectedOption?.urlName === "image-to-base64" ||
    selectedOption?.urlName === "png-to-base64" ||
    selectedOption?.urlName === "jpg-to-base64"

  const isImageOutputConverter = selectedOption?.urlName === "base64-to-image"

  const getInputPlaceholder = (): string => {
    const c = selectedOption?.urlName?.toLowerCase() ?? ""
    if (c === "binary-to-base64") return "Enter binary string (e.g. 01001000 01101001)"
    if (c === "hex-to-base64") return "Enter hex string (e.g. 48 65 6C 6C 6F)"
    if (c === "octal-to-base64") return "Enter octal string (e.g. 110 145 154)"
    if (c === "json-to-base64") return '{"key": "value"}'
    if (c === "xml-to-base64") return "<root><element>value</element></root>"
    if (c === "yaml-to-base64") return "key: value\nlist:\n  - item1\n  - item2"
    if (c === "csv-to-base64") return "col1,col2,col3\nval1,val2,val3"
    if (c === "tsv-to-base64") return "col1\tcol2\tcol3\nval1\tval2\tval3"
    if (c === "html-to-base64") return "<html><body><p>Hello</p></body></html>"
    if (c === "css-to-base64") return "body { color: red; font-size: 16px; }"
    if (c === "javascript-to-base64") return "console.log('Hello, World!');"
    if (c.startsWith("base64-to-")) return "Enter Base64 encoded string..."
    return "Enter your input here..."
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
    const isBase64Image = outputValue.startsWith("data:image/")
    if (isBase64Image) {
      const a = document.createElement("a")
      a.href = outputValue
      a.download = `decoded-image.png`
      a.click()
      return
    }
    const blob = new Blob([outputValue], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedOption?.urlName || "output"}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyOutput = () => {
    if (!outputValue) return
    navigator.clipboard.writeText(outputValue)
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
          <PageTitle selectedData={selectedOption || undefined} />

          {/* Input + Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Input</label>

              {isImageInputConverter ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
                </div>
              ) : (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:border-purple-400"
                  rows={8}
                />
              )}
            </div>

            {/* Output */}
            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[12rem]">

                {isImageOutputConverter && outputValue ? (
                  <img
                    src={outputValue}
                    alt="Decoded"
                    className="mx-auto max-h-60 rounded-lg object-contain"
                  />
                ) : (
                  <textarea
                    readOnly
                    value={outputValue}
                    placeholder="Output will appear here..."
                    className="border-none bg-transparent resize-none w-full h-full text-sm min-h-[10rem] focus:outline-none"
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
              <>
                <Button variant="secondary" onClick={handleCopyOutput}>
                  Copy Output
                </Button>

                <Button variant="secondary" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </>
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
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200 shadow-sm hover:bg-purple-200 transition"
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