"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"
// import sqlFormatter from "sql-formatter"

export function Minifier() {
  const [selectedTool, setSelectedTool] = useState<string>("")
  const [inputText, setInputText] = useState<string>("")
  const [outputText, setOutputText] = useState<string>("")

  const converterOptions: SidebarOption[] = [
    { id: "json-minify", label: "JSON Minify", icon: FileText, description: "Compact JSON data by removing whitespace and line breaks." },
    { id: "xml-minify", label: "XML Minify", icon: FileText, description: "Minify XML files by removing unnecessary spaces." },
    { id: "js-minify", label: "JS Minify", icon: FileText, description: "Compress JavaScript code." },
    { id: "css-minify", label: "CSS Minify", icon: FileText, description: "Minify CSS code safely." },
    { id: "sql-minifier", label: "SQL Minifier", icon: FileText, description: "Minify SQL queries." },
    { id: "html-minify", label: "HTML Minify", icon: FileText, description: "Minify HTML files for faster load times." },
    { id: "lua-minifier", label: "Lua Minifier", icon: FileText, description: "Remove unnecessary whitespace from Lua scripts." },
    { id: "text-minifier", label: "Text Minifier", icon: FileText, description: "Minify plain text content." }
  ]

  const footerOptions: SidebarOption[] = [{ id: "settings", label: "Settings", icon: Settings }]
  const selectedOption = converterOptions.find(opt => opt.id === selectedTool)

  const handleMinify = async () => {
    try {
      let result = inputText

      switch (selectedTool) {
        case "json-minify":
          result = JSON.stringify(JSON.parse(inputText))
          break

        case "xml-minify":
          result = inputText.replace(/\s*(<[^>]+>)\s*/g, "$1")
          break

        case "js-minify": {
          const terser = await import("terser")
          const minified = await terser.minify(inputText)
          result = minified.code || ""
          break
        }

        // case "css-minify": {
        //   const CleanCSS = (await import("clean-css")).default
        //   result = new CleanCSS().minify(inputText).styles
        //   break
        // }

        // case "sql-minifier":
        //   result = sqlFormatter.format(inputText, { language: "sql" }).replace(/\s+/g, " ")
        //   break

        // case "html-minify": {
        //   const { minify } = await import("html-minifier-terser")
        //   result = await minify(inputText, {
        //     collapseWhitespace: true,
        //     removeComments: true,
        //     minifyCSS: true,
        //     minifyJS: true,
        //   })
        //   break
        // }

        case "lua-minifier":
        case "text-minifier":
          result = inputText.replace(/\s+/g, " ").trim()
          break
      }

      setOutputText(result)
    } catch (err) {
      setOutputText("Error: " + (err as Error).message)
    }
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
  }

  return (
    <ReusableSidebar
      title="Minifier Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedTool}
      onOptionSelect={setSelectedTool}
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
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium mb-2 block">Output</label>
              <textarea
                value={outputText}
                readOnly
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full bg-gray-50"
                rows={10}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleMinify}>Minify</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
