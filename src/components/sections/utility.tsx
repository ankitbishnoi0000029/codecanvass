"use client"

import { useState, useEffect } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette, Download } from "lucide-react"
import Image from "next/image"
import { base64ToImage } from "@/utils/utils"

export function Utility({ defaultTool }: { defaultTool?: string }) {
  const [selectedConverter, setSelectedConverter] = useState(defaultTool || "")
  const [inputValue, setInputValue] = useState("")
  const [img, setImg] = useState("")

  const converterOptions: SidebarOption[] = [
    { id: "send-snap-message", label: "Send Snap Message", icon: FileText, description: "Compose and send quick snap-style messages or notifications." },
    { id: "responsive-website-tester", label: "Responsive Website Tester", icon: FileText, description: "Preview and test a website across different device screen sizes." },
    { id: "credit-card-validator", label: "Credit Card Validator", icon: FileText, description: "Validate credit card numbers using Luhn algorithm and format checks." },
    { id: "credit-card-fake-number-generator", label: "Credit Card Fake Number Generator", icon: FileText, description: "Generate test/fake credit card numbers for development and testing." },
    { id: "xpath-tester", label: "XPath Tester", icon: FileText, description: "Run and validate XPath queries against XML/HTML documents." },
    { id: "jsonpath-tester", label: "JSON Path Tester", icon: FileText, description: "Test JSONPath expressions against JSON data and inspect results." },
    { id: "json-minifier", label: "JSON Minifier", icon: FileText, description: "Remove whitespace from JSON to produce compact/minified output." },
    { id: "file-difference", label: "File Difference", icon: FileText, description: "Compare two files and highlight line-by-line differences." },
    { id: "json-diff", label: "JSON Diff", icon: FileText, description: "Show structural and value differences between two JSON objects." },
    { id: "xml-diff", label: "XML Diff", icon: FileText, description: "Compare two XML files and highlight element/attribute differences." },
    { id: "broken-link-checker", label: "Broken Link Checker", icon: FileText, description: "Scan a website to find broken or unreachable links (HTTP errors)." },
    { id: "json-deserialize-online", label: "JSON Deserialize Online", icon: FileText, description: "Deserialize JSON strings into language-native objects for inspection." },
    { id: "json-serialize-online", label: "JSON Serialize Online", icon: FileText, description: "Serialize objects or data structures into JSON strings." },
    { id: "json-stringify-online", label: "JSON Stringify Online", icon: FileText, description: "Stringify JSON with options for spacing, sorting, and escaping." },
    { id: "xml-stringify-online", label: "XML Stringify Online", icon: FileText, description: "Serialize objects/structures into well-formed XML strings." },
    { id: "string-to-json-online", label: "String to JSON Online", icon: FileText, description: "Convert plain or structured text into valid JSON format." },
    { id: "javascript-obfuscator", label: "JavaScript Obfuscator", icon: FileText, description: "Obfuscate JavaScript code to make source harder to read and reuse." },
    { id: "curl-to-php", label: "Curl to PHP", icon: FileText, description: "Convert a curl command into equivalent PHP code (cURL extension)." },
    { id: "crontab-format", label: "Crontab Format", icon: FileText, description: "Validate or build cron expressions and show human-readable schedule." },
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

  // Update sidebar selection when route param changes
  useEffect(() => {
    if (defaultTool) setSelectedConverter(defaultTool)
  }, [defaultTool])

  const handleConverterChange = (converterId: string) => {
    setSelectedConverter(converterId)
    setImg("")
    setInputValue("")
  }

  const handleConvert = () => {
    const result = base64ToImage(inputValue)
    setImg(result)
  }

  const handleClear = () => {
    setInputValue("")
    setImg("")
  }

  return (
    <ReusableSidebar
      title="Utility Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedOption?.label || "Select a Tool"}</h2>
            <p className="text-muted-foreground">{selectedOption?.description || "Choose a utility tool from the sidebar to begin."}</p>
          </div>

          {selectedOption && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                  <label className="text-sm font-medium mb-2 block">Input</label>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full"
                    rows={5}
                    placeholder="Enter Base64 string or text here..."
                  />
                </div>

                {/* Output Section */}
                <div className="space-y-4">
                  <label className="text-sm font-medium mb-2 block">Output</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center min-h-[180px] flex flex-col justify-center items-center">
                    {img ? (
                      <>
                        <Image src={img} alt="Converted" width={150} height={150} className="mx-auto rounded-lg" />
                        <p className="text-sm text-gray-500 mt-2">Converted Image Preview</p>
                      </>
                    ) : (
                      <>
                        <Download className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Output will appear here</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button onClick={handleConvert}>Convert</Button>
                <Button variant="outline" onClick={handleClear}>Clear</Button>
              </div>
            </>
          )}
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
