"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"
import pako from "pako"

export function CompressDecompress() {
  const [selectedOptionId, setSelectedOptionId] = useState("")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")

  const converterOptions: SidebarOption[] = [
    {
      id: "gzip-decompress-online",
      label: "GZip Decompress Online",
      icon: FileText,
      description: "Decompress GZip-compressed files or data online quickly."
    },
    {
      id: "zlib-decompress-online",
      label: "Zlib Decompress Online",
      icon: FileText,
      description: "Decompress Zlib-compressed data or files online."
    },
    {
      id: "gzip-compress-online",
      label: "GZip Compress Online",
      icon: FileText,
      description: "Compress data into GZip format easily."
    },
    {
      id: "zlib-compress-online",
      label: "Zlib Compress Online",
      icon: FileText,
      description: "Compress data using Zlib compression online."
    }
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedOptionId)

  const handleConvert = () => {
    try {
      let result = ""

      if (!inputText.trim()) {
        setOutputText("Please enter input data.")
        return
      }

      switch (selectedOptionId) {
        // Decompression
        case "gzip-decompress-online":
          result = decompressBase64(inputText, "gzip")
          break
        case "zlib-decompress-online":
          result = decompressBase64(inputText, "zlib")
          break

        // Compression
        case "gzip-compress-online":
          result = compressToBase64(inputText, "gzip")
          break
        case "zlib-compress-online":
          result = compressToBase64(inputText, "zlib")
          break

        default:
          result = "Please select a valid option."
      }

      setOutputText(result)
    } catch (error: any) {
      setOutputText("Error: " + error.message)
    }
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
  }

  // 🔧 Compression helper
  const compressToBase64 = (text: string, type: "gzip" | "zlib") => {
    const data = new TextEncoder().encode(text)
    const compressed =
      type === "gzip" ? pako.gzip(data) : pako.deflate(data)
    return btoa(String.fromCharCode(...compressed))
  }

  // 🔧 Decompression helper
  const decompressBase64 = (base64: string, type: "gzip" | "zlib") => {
    const binary = atob(base64)
    const charData = binary.split("").map(c => c.charCodeAt(0))
    const binData = new Uint8Array(charData)
    const decompressed =
      type === "gzip" ? pako.ungzip(binData) : pako.inflate(binData)
    return new TextDecoder().decode(decompressed)
  }

  return (
    <ReusableSidebar
      title="Compress & Decompress Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedOptionId}
      onOptionSelect={setSelectedOptionId}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {selectedOption?.label || "Select a tool"}
            </h2>
            <p className="text-muted-foreground">
              {selectedOption?.description ||
                "Choose a compression or decompression method."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Input</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your text or Base64 data here..."
                  className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full"
                  rows={10}
                />
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Output</label>
                <textarea
                  readOnly
                  value={outputText}
                  placeholder="Converted result will appear here..."
                  className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full bg-gray-50"
                  rows={10}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-2">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
