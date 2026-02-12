"use client"

import { useState, useEffect } from "react"
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Settings, Palette, Download, RotateCcw } from "lucide-react"
import { getTableData } from "@/actions/dbAction"
import { dataType } from "@/utils/types/uiTypes"

export function JsonConverters() {
  const [selectedConverter, setSelectedConverter] = useState<string>("")
  const [inputText, setInputText] = useState<string>("")
  const [outputText, setOutputText] = useState<string>("")

  const [list, setList] = useState<dataType[]>([])

  // Fetch SQL Tools
  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("json_converters") as dataType[]
      setList(categoriesData)
    }
    fetchData()
  }, [])

  // Convert SQL data to SidebarOption format
  const sidebarOptions: SidebarOption[] = list.map((item) => ({
    id: item.id.toString(),
    label: item.urlName,
    icon: Palette,
  }))

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Get selected SQL Item
  const selectedOption = list.find(
    (opt) => opt.id.toString() === selectedConverter
  ) || null

  useEffect(() => {
    setInputText("")
    setOutputText("")
  }, [selectedConverter])

  // Conversion Logic
  const convertJson = (json: string, type: string): string => {
    try {
      const parsed = JSON.parse(json)

      switch (type) {
        case "json-to-java":
          return Object.entries(parsed)
            .map(([key, value]) => {
              const jsType = typeof value
              let javaType = "String"
              if (jsType === "number") javaType = "double"
              else if (jsType === "boolean") javaType = "boolean"
              return `private ${javaType} ${key};`
            })
            .join("\n")

        case "json-to-xml": {
          const jsonToXml = (obj: any, root = "root"): string =>
            `<${root}>` +
            Object.entries(obj)
              .map(([k, v]) =>
                typeof v === "object"
                  ? jsonToXml(v, k)
                  : `<${k}>${v}</${k}>`
              )
              .join("") +
            `</${root}>`
          return jsonToXml(parsed)
        }

        case "json-to-yaml":
          return Object.entries(parsed)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")

        case "json-to-csv": {
          const arr = Array.isArray(parsed) ? parsed : [parsed]
          const keys = Object.keys(arr[0] || {})
          const rows = arr.map((obj) => keys.map((k) => obj[k]).join(","))
          return [keys.join(","), ...rows].join("\n")
        }

        case "json-to-tsv": {
          const arr = Array.isArray(parsed) ? parsed : [parsed]
          const keys = Object.keys(arr[0] || {})
          const rows = arr.map((obj) => keys.map((k) => obj[k]).join("\t"))
          return [keys.join("\t"), ...rows].join("\n")
        }

        case "json-to-text":
          return JSON.stringify(parsed, null, 2)

        case "json-to-html": {
          const arr = Array.isArray(parsed) ? parsed : [parsed]
          const keys = Object.keys(arr[0] || {})
          const rows = arr
            .map(
              (obj) =>
                `<tr>${keys.map((k) => `<td>${obj[k]}</td>`).join("")}</tr>`
            )
            .join("")
          return `<table border="1"><tr>${keys
            .map((k) => `<th>${k}</th>`)
            .join("")}</tr>${rows}</table>`
        }

        default:
          return "Unsupported converter"
      }
    } catch (e) {
      return "❌ Invalid JSON input"
    }
  }

  const handleConvert = () => {
    if (!selectedConverter) {
      alert("Please select a converter.")
      return
    }
    setOutputText(convertJson(inputText, selectedConverter))
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
  }

  const handleDownload = () => {
    if (!outputText) return

    const blob = new Blob([outputText], { type: "text/plain" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedConverter}.txt`
    link.click()
  }

  return (
    <ReusableSidebar
      title="JSON Converters"
      icon={Palette}
      options={sidebarOptions}
      selectedOption={selectedConverter}
      onOptionSelect={setSelectedConverter}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption as any}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {selectedOption?.urlName || "Select a Converter"}
            </h2>
            <p className="text-muted-foreground">
              {selectedOption?.des || "Choose a JSON converter to start."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Input JSON</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-full"
                rows={10}
                placeholder="Paste your JSON here..."
              />
            </div>

            {/* Output */}
            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50 overflow-auto">
                {outputText ? (
                  <pre className="text-sm whitespace-pre-wrap break-words">
                    {outputText}
                  </pre>
                ) : (
                  <p className="text-gray-400">Converted output will appear here</p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="w-4 h-4 mr-1" /> Clear
            </Button>
            {outputText && (
              <Button variant="secondary" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" /> Download
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
                {selectedOption.keyword
                  ?.split(",")
                  .map((kw, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200 shadow-sm hover:bg-purple-200 transition ">
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

export default JsonConverters
