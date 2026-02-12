"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"
import YAML from "js-yaml"
import { parse as parseCSV } from "papaparse" // npm install papaparse
import { decode as decodeHTML } from "html-entities"
// import BBCodeParser from "bbcode-to-html" // npm install bbcode-to-html

export function Viewers() {
  const [selectedViewer, setSelectedViewer] = useState("")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")

  const viewerOptions: SidebarOption[] = [
    { id: "json-viewer", label: "JSON Viewer", icon: FileText, description: "View and explore JSON data in a formatted structure." },
    { id: "xml-viewer", label: "XML Viewer", icon: FileText, description: "Visualize XML documents with proper indentation." },
    { id: "yaml-viewer", label: "YAML Viewer", icon: FileText, description: "Display YAML content in a clear structured format." },
    { id: "mxml-viewer", label: "MXML Viewer", icon: FileText, description: "View MXML (Flex XML) files in an organized layout." },
    { id: "html-viewer", label: "HTML Viewer", icon: FileText, description: "Preview HTML code with formatting and structure." },
    { id: "javascript-viewer", label: "JavaScript Viewer", icon: FileText, description: "Display JavaScript code with proper formatting." },
    { id: "rss-viewer", label: "RSS Viewer", icon: FileText, description: "Visualize RSS feeds in a readable structure." },
    { id: "source-code-viewer", label: "SOURCE CODE Viewer", icon: FileText, description: "View source code files in a clean format." },
    { id: "opml-viewer", label: "OPML Viewer", icon: FileText, description: "Display OPML files in a structured outline format." },
    { id: "csv-viewer", label: "CSV Viewer", icon: FileText, description: "Visualize CSV data in a readable tabular format." },
    { id: "bbcode-viewer", label: "BBCode Viewer", icon: FileText, description: "Render BBCode content in formatted style." },
    { id: "markdown-viewer", label: "Markdown Viewer", icon: FileText, description: "Preview Markdown text with proper formatting." }
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = viewerOptions.find(opt => opt.id === selectedViewer)

  const handleView = () => {
    let output = ""
    try {
      switch (selectedViewer) {
        case "json-viewer":
          output = JSON.stringify(JSON.parse(inputText), null, 2)
          break
        case "xml-viewer":
        case "mxml-viewer":
        case "rss-viewer":
        case "opml-viewer":
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(inputText, "text/xml")
          output = new XMLSerializer().serializeToString(xmlDoc)
          break
        case "yaml-viewer":
          output = YAML.dump(YAML.load(inputText))
          break
        case "html-viewer":
          output = inputText
          break
        case "javascript-viewer":
        case "source-code-viewer":
          output = inputText
          break
        case "csv-viewer":
          const parsedCSV = parseCSV(inputText, { header: true })
          output = JSON.stringify(parsedCSV.data, null, 2)
          break
        case "bbcode-viewer":
          // const parserBB = new BBCodeParser()
          // output = parserBB.process({ text: inputText })
          output = inputText // Placeholder, BBCode parsing not implemented
          break
        case "markdown-viewer":
          output = inputText
          break
        default:
          output = inputText
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
      title="Viewers"
      icon={Palette}
      options={viewerOptions}
      selectedOption={selectedViewer}
      onOptionSelect={setSelectedViewer}
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
                placeholder="Paste your content here"
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
            <Button onClick={handleView}>View</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
