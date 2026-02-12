"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"
import { base64ToImage } from "@/utils/utils"

export function SyntaxHighlighting() {
  const [selectedConverter, setSelectedConverter] = useState("")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const converterOptions: SidebarOption[] = [
    {
      id: "json-syntax-highlighting",
      label: "JSON Syntax Highlighting",
      icon: FileText,
      description: "Highlight JSON code syntax for better readability and clarity."
    },
    {
      id: "xml-highlighter",
      label: "XML Highlighter",
      icon: FileText,
      description: "Highlight XML code syntax for easy inspection and editing."
    },
    {
      id: "xml-pretty-print",
      label: "XML Pretty Print",
      icon: FileText,
      description: "Format XML files with proper indentation for readability."
    },
    {
      id: "html-pretty-print",
      label: "HTML Pretty Print",
      icon: FileText,
      description: "Beautify HTML code with proper formatting and indentation."
    },
    {
      id: "js-pretty-print",
      label: "JS Pretty Print",
      icon: FileText,
      description: "Format JavaScript code for better readability and structure."
    },
    {
      id: "code-highlighter",
      label: "Code Highlighter",
      icon: FileText,
      description: "Highlight code syntax in multiple programming languages."
    }
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = converterOptions.find((opt) => opt.id === selectedConverter)

  const handleConvert = () => {
    if (!input) return setOutput("Enter some code first")
    try {
      // Convert input text to base64 image
      setOutput(base64ToImage(input))
    } catch (err) {
      setOutput("Error converting code")
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  return (
    <ReusableSidebar
      title="Syntax Highlighting Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={setSelectedConverter}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedOption?.label}</h2>
            <p className="text-muted-foreground">{selectedOption?.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full"
                rows={6}
                placeholder="Paste your code here..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[150px]">
                {output ? (
                  <img src={output} alt="Converted code" className="mx-auto" />
                ) : (
                  <p className="text-sm text-gray-500">Converted output will appear here</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
