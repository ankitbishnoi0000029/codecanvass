"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"
import YAML from "js-yaml" // npm install js-yaml

export function Parsers() {
  const [selectedParser, setSelectedParser] = useState("")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")

  const parserOptions: SidebarOption[] = [
    {
      id: "url-parser",
      label: "URL Parser",
      icon: FileText,
      description: "Parse URLs into protocol, domain, path, and query parameters."
    },
    {
      id: "json-parser",
      label: "JSON Parser",
      icon: FileText,
      description: "Parse JSON strings into structured objects."
    },
    {
      id: "xml-parser",
      label: "XML Parser",
      icon: FileText,
      description: "Parse XML documents into readable and structured format."
    },
    {
      id: "yaml-parser",
      label: "YAML Parser",
      icon: FileText,
      description: "Parse YAML content into structured objects."
    }
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = parserOptions.find(opt => opt.id === selectedParser)

  const handleConvert = () => {
    let output = ""
    try {
      switch (selectedParser) {
        case "url-parser":
          const url = new URL(inputText)
          output = JSON.stringify({
            href: url.href,
            protocol: url.protocol,
            host: url.host,
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            search: url.search,
            hash: url.hash
          }, null, 2)
          break
        case "json-parser":
          output = JSON.stringify(JSON.parse(inputText), null, 2)
          break
        case "xml-parser":
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(inputText, "text/xml")
          output = new XMLSerializer().serializeToString(xmlDoc)
          break
        case "yaml-parser":
          output = YAML.dump(YAML.load(inputText))
          break
        default:
          output = "Parser not implemented yet."
      }
    } catch (e) {
      output = "Error parsing input."
    }

    setOutputText(output)
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
  }

  return (
    <ReusableSidebar
      title="Parsers"
      icon={Palette}
      options={parserOptions}
      selectedOption={selectedParser}
      onOptionSelect={setSelectedParser}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedOption?.label}</h2>
            <p className="text-muted-foreground">{selectedOption?.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium mb-2 block">Input</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full"
                rows={10}
                placeholder="Paste your URL, JSON, XML, or YAML here"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] overflow-auto">
                {outputText ? <pre className="text-sm">{outputText}</pre> : <p className="text-gray-400">Parsed output will appear here</p>}
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
