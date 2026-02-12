"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Settings,
  Palette,
  Copy,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

export function EscapeUnescape() {
  const [selectedConverter, setSelectedConverter] = useState<string>("html-escape-unescape")
  const [input, setInput] = useState<string>("")
  const [output, setOutput] = useState<string>("")

  const converterOptions: SidebarOption[] = [
    {
      id: "html-escape-unescape",
      label: "HTML Escape / Unescape",
      icon: FileText,
      description: "Encode or decode special HTML characters to/from entities."
    },
    {
      id: "xml-escape-unescape",
      label: "XML Escape / Unescape",
      icon: FileText,
      description: "Escape or unescape special characters in XML documents."
    },
    {
      id: "javascript-escape-unescape",
      label: "JavaScript Escape / Unescape",
      icon: FileText,
      description: "Encode or decode JavaScript strings with special characters."
    },
    {
      id: "json-escape-unescape",
      label: "JSON Escape / Unescape",
      icon: FileText,
      description: "Escape or unescape JSON strings safely for data transfer."
    },
    {
      id: "sql-escape-unescape",
      label: "SQL Escape / Unescape",
      icon: FileText,
      description: "Escape or unescape SQL strings to prevent syntax issues."
    },
    {
      id: "un-google-link",
      label: "Un-Google Link",
      icon: FileText,
      description: "Convert Google redirect links into direct URLs."
    }
  ]

  const footerOptions: SidebarOption[] = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings
    }
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

  const handleConvert = () => {
    let result = ""

    switch (selectedConverter) {
      case "html-escape-unescape":
        result = input.includes("&")
          ? input
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
          : input
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;")
        break

      case "xml-escape-unescape":
        result = input.includes("&lt;")
          ? input
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
              .replace(/&amp;/g, "&")
          : input
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&apos;")
        break

      case "javascript-escape-unescape":
        result = input.includes("\\n")
          ? input
              .replace(/\\n/g, "\n")
              .replace(/\\t/g, "\t")
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\")
          : input
              .replace(/\\/g, "\\\\")
              .replace(/\n/g, "\\n")
              .replace(/\t/g, "\\t")
              .replace(/"/g, '\\"')
        break

      case "json-escape-unescape":
        try {
          result = input.includes("\\")
            ? JSON.parse(`"${input}"`)
            : JSON.stringify(input)
        } catch {
          result = "Invalid JSON input"
        }
        break

      case "sql-escape-unescape":
        result = input.includes("\\'")
          ? input.replace(/\\'/g, "'")
          : input.replace(/'/g, "\\'")
        break

      case "un-google-link":
        result = input.replace(/https:\/\/www\.google\.com\/url\?q=([^&]+).*/, "$1")
        break

      default:
        result = "Unsupported conversion type."
    }

    setOutput(result)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    toast.success("Output copied to clipboard!")
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    toast.message("Cleared all fields.")
  }

  return (
    <ReusableSidebar
      title="Escape / Unescape Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={setSelectedConverter}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{selectedOption?.label}</h2>
            <p className="text-muted-foreground mt-1">{selectedOption?.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text here..."
                className="border-2 border-gray-300 rounded-lg p-3 w-full h-48 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Output Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Output</label>
              <textarea
                readOnly
                value={output}
                placeholder="Converted result will appear here..."
                className="border-2 border-gray-300 rounded-lg p-3 w-full h-48 bg-gray-50 text-gray-700"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
            <Button variant="destructive" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
