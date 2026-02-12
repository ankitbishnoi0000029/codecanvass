"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"

import prettier from "prettier/standalone"
import parserBabel from "prettier/parser-babel"
import parserHtml from "prettier/parser-html"
import parserPostcss from "prettier/parser-postcss"
import parserMarkdown from "prettier/parser-markdown"
import parserYaml from "prettier/parser-yaml"
import parserAngular from "prettier/parser-angular"

import { format as sqlFormat } from "sql-formatter"   // ✅ FIXED SQL IMPORT

export function Beautifiers() {
  const [selectedOptionId, setSelectedOptionId] = useState("")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")

  const converterOptions: SidebarOption[] = [
    { id: "json-beautifier", label: "JSON Beautifier", icon: FileText, description: "Format and beautify JSON code for better readability." },
    { id: "css-beautifier", label: "CSS Beautifier", icon: FileText, description: "Format and beautify CSS code for improved clarity." },
    { id: "xml-beautifier", label: "XML Beautifier", icon: FileText, description: "Beautify XML/HTML files with proper indentation and structure." },
    { id: "javascript-beautifier", label: "JavaScript Beautifier", icon: FileText, description: "Format JavaScript or JSX code neatly." },
    { id: "html-beautifier", label: "HTML Beautifier", icon: FileText, description: "Beautify and clean up messy HTML code." },
    { id: "yaml-beautifier", label: "YAML Beautifier", icon: FileText, description: "Beautify YAML with correct indentation." },
    { id: "markdown-beautifier", label: "Markdown Beautifier", icon: FileText, description: "Prettify Markdown text (.md files)." },
    { id: "sql-beautifier", label: "SQL Beautifier", icon: FileText, description: "Beautify SQL queries for clarity." }
  ]

  const footerOptions: SidebarOption[] = [{ id: "settings", label: "Settings", icon: Settings }]
  const selectedOption = converterOptions.find(opt => opt.id === selectedOptionId)

  const handleConvert = async () => {
    if (!inputText.trim()) return

    try {
      let formatted = ""

            switch (selectedOptionId) {
        case "json-beautifier":
          formatted = JSON.stringify(JSON.parse(inputText), null, 2)
          break

        case "css-beautifier":
          formatted = await prettier.format(inputText, {
            parser: "css",
            plugins: [parserPostcss],
          })
          break

        case "xml-beautifier":
        case "html-beautifier":
          formatted = await prettier.format(inputText, {
            parser: "html",
            plugins: [parserHtml],
          })
          break

        case "javascript-beautifier":
          formatted = await prettier.format(inputText, {
            parser: "babel",
            plugins: [parserBabel],
            semi: true,
            singleQuote: false,
          })
          break

        case "yaml-beautifier":
          formatted = await prettier.format(inputText, {
            parser: "yaml",
            plugins: [parserYaml],
          })
          break

        case "markdown-beautifier":
          formatted = await prettier.format(inputText, {
            parser: "markdown",
            plugins: [parserMarkdown],
          })
          break

        case "sql-beautifier":
        formatted = sqlFormat(inputText, { tabWidth: 2 }) // SQL FIXED
          break

        default:
          formatted = inputText
      }

      setOutputText(formatted)
    } catch (err: any) {
      setOutputText(`❌ Error: ${err.message}`)
    }
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
  }

  return (
    <ReusableSidebar
      title="Beautifier Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedOptionId}
      onOptionSelect={setSelectedOptionId}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedOption?.label || "Select a Beautifier"}</h2>
            <p className="text-muted-foreground">{selectedOption?.description || "Choose a format type from the sidebar."}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium mb-2 block">Input</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your code or text here..."
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-[300px] font-mono text-sm"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium mb-2 block">Output</label>
              <pre className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-[300px] overflow-auto bg-gray-50 font-mono text-sm whitespace-pre-wrap">
                {outputText}
              </pre>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleConvert}>Beautify</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
