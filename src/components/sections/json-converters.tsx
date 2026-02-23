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
import { usePathname, useRouter } from "next/navigation"

// Helper function to get file extension for download
const getFileExtension = (converterId: string): string => {
  const extensions: Record<string, string> = {
    "json-to-java": "java",
    "json-to-xml": "xml",
    "json-to-yaml": "yaml",
    "json-to-csv": "csv",
    "json-to-tsv": "tsv",
    "json-to-text": "txt",
    "json-to-excel": "xlsx",
    "json-to-html": "html"
  }
  return extensions[converterId] || "txt"
}

// Improved JSON to XML converter with proper nesting
const jsonToXml = (obj: any, root = "root"): string => {
  if (typeof obj !== 'object' || obj === null) {
    return `<${root}>${obj}</${root}>`
  }

  if (Array.isArray(obj)) {
    return obj.map(item => jsonToXml(item, 'item')).join('')
  }

  const entries = Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return jsonToXml(value, key)
      }
      return `<${key}>${value}</${key}>`
    })
    .join('')

  return `<${root}>${entries}</${root}>`
}

// Improved JSON to YAML converter
const jsonToYaml = (obj: any, indent = 0): string => {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(item =>
      `${'  '.repeat(indent)}- ${jsonToYaml(item, indent + 1)}`
    ).join('\n')
  }

  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${'  '.repeat(indent)}${key}:\n${jsonToYaml(value, indent + 1)}`
      }
      return `${'  '.repeat(indent)}${key}: ${value}`
    })
    .join('\n')
}

// JSON to CSV/TSV converter
const jsonToTable = (json: string, delimiter: ',' | '\t'): string => {
  const parsed = JSON.parse(json)
  const arr = Array.isArray(parsed) ? parsed : [parsed]

  if (arr.length === 0) return ''

  const keys = Array.from(
    new Set(arr.flatMap((obj: any) => Object.keys(obj)))
  ) as string[]

  const headers = keys.join(delimiter)
  const rows = arr.map((obj: any) =>
    keys.map(key => {
      const value = obj[key]
      if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(delimiter)
  )

  return [headers, ...rows].join('\n')
}

// JSON to HTML table
const jsonToHtml = (json: string): string => {
  const parsed = JSON.parse(json)
  const arr = Array.isArray(parsed) ? parsed : [parsed]

  if (arr.length === 0) return '<table></table>'

  const keys = Array.from(
    new Set(arr.flatMap((obj: any) => Object.keys(obj)))
  ) as string[]

  const headers = keys.map(k => `<th>${k}</th>`).join('')
  const rows = arr.map((obj: any) => {
    const cells = keys.map(key => {
      const value = obj[key]
      return `<td>${value !== undefined ? value : ''}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  return `<table border="1" style="border-collapse: collapse;">
  <thead><tr>${headers}</tr></thead>
  <tbody>${rows}</tbody>
</table>`
}

// JSON to Java class
const jsonToJava = (json: string, className = "GeneratedClass"): string => {
  const parsed = JSON.parse(json)

  const getJavaType = (value: any): string => {
    if (value === null) return "Object"
    switch (typeof value) {
      case "string": return "String"
      case "number": return Number.isInteger(value) ? "int" : "double"
      case "boolean": return "boolean"
      case "object":
        if (Array.isArray(value)) {
          return value.length > 0
            ? `List<${getJavaType(value[0])}>`
            : "List<Object>"
        }
        return "Map<String, Object>"
      default: return "Object"
    }
  }

  const fields = Object.entries(parsed)
    .map(([key, value]) => {
      const javaType = getJavaType(value)
      return `  private ${javaType} ${key};`
    })
    .join('\n')

  const gettersSetters = Object.entries(parsed)
    .map(([key, value]) => {
      const javaType = getJavaType(value)
      const capitalized = key.charAt(0).toUpperCase() + key.slice(1)
      return `
  public ${javaType} get${capitalized}() {
    return ${key};
  }

  public void set${capitalized}(${javaType} ${key}) {
    this.${key} = ${key};
  }`
    })
    .join('\n')

  return `import java.util.*;

public class ${className} {
${fields}
${gettersSetters}
}`
}

export function JsonConverters() {
  const [selectedConverter, setSelectedConverter] = useState<string>("")
  const [inputText, setInputText] = useState<string>("")
  const [outputText, setOutputText] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [list, setList] = useState<dataType[]>([])

  const router = useRouter()
  const pathname = usePathname()

  // ✅ Fetch data and sync selected converter from URL
  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("json_converters") as dataType[]
      setList(categoriesData)

      // Read slug from current URL
      const slug = pathname.split('/').pop() ?? ''

      if (slug) {
        // Try to match URL slug with a route in the list
        const matched = categoriesData.find(
          (item) => item.route === slug || item.id.toString() === slug
        )

        if (matched) {
          // ✅ Valid route found — select it
          setSelectedConverter(matched.route ?? matched.id.toString())
        } else if (categoriesData.length > 0) {
          // ✅ No match — fall back to first item and redirect
          const firstRoute = categoriesData[0].route ?? categoriesData[0].id.toString()
          setSelectedConverter(firstRoute)
          router.replace(firstRoute)
        }
      } else if (categoriesData.length > 0) {
        // ✅ No slug — default to first item
        const firstRoute = categoriesData[0].route ?? categoriesData[0].id.toString()
        setSelectedConverter(firstRoute)
        router.replace(firstRoute)
      }
    }

    fetchData()
  }, [pathname]) // ✅ Re-runs on browser back/forward navigation

  // Reset input/output when converter changes
  useEffect(() => {
    setInputText("")
    setOutputText("")
    setError("")
  }, [selectedConverter])

  // Convert SQL data to SidebarOption format
  const sidebarOptions: SidebarOption[] = list.map((item) => ({
    id: item.route ?? item.id.toString(),
    label: item.urlName,
    description: item.des,
    keyword: item.keyword,
    icon: Palette,
  }))

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Get selected item
  const selectedOption = list.find(
    (opt) => (opt.route && opt.route === selectedConverter) || opt.id.toString() === selectedConverter
  ) || null

  // ✅ Handle sidebar option click — update state + push URL
  const handleOptionSelect = (optionId: string | number) => {
    const id = optionId.toString()
    setSelectedConverter(id)
    router.push(id)
  }

  // Conversion Logic
  const convertJson = (json: string, converterId: string): string => {
    try {
      if (!json.trim()) {
        throw new Error("Please enter JSON to convert")
      }

      JSON.parse(json)

      switch (converterId) {
        case "json-to-java":
          return jsonToJava(json)
        case "json-to-xml":
          return jsonToXml(JSON.parse(json))
        case "json-to-yaml":
          return jsonToYaml(JSON.parse(json))
        case "json-to-csv":
          return jsonToTable(json, ',')
        case "json-to-tsv":
          return jsonToTable(json, '\t')
        case "json-to-text":
          return JSON.stringify(JSON.parse(json), null, 2)
        case "json-to-excel":
          return "Excel export requires server-side processing. For now, you can download as CSV and open in Excel."
        case "json-to-html":
          return jsonToHtml(json)
        default:
          return "Unsupported converter"
      }
    } catch (e: any) {
      setError(e.message)
      return `❌ Error: ${e.message}`
    }
  }

  const handleConvert = () => {
    if (!selectedConverter) {
      alert("Please select a converter.")
      return
    }
    setError("")
    const result = convertJson(inputText, selectedConverter)
    setOutputText(result)
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
    setError("")
  }

  const handleDownload = () => {
    if (!outputText || outputText.startsWith("❌")) return

    const extension = getFileExtension(selectedConverter)
    const blob = new Blob([outputText], { type: "text/plain" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `converted.${extension}`
    link.click()
  }

  const handleExampleClick = () => {
    setInputText(JSON.stringify({
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      address: {
        city: "New York",
        zip: "10001"
      },
      hobbies: ["reading", "coding"]
    }, null, 2))
  }

  return (
    <ReusableSidebar
      title="JSON Converters"
      icon={Palette}
      options={sidebarOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleOptionSelect}  // ✅ Now updates URL on selection
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-full font-mono text-sm"
                rows={12}
                placeholder={`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}`}
              />
              <Button
                variant="link"
                onClick={handleExampleClick}
                className="mt-2 text-sm"
              >
                Load Example
              </Button>
            </div>

            {/* Output */}
            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-50 overflow-auto">
                {outputText ? (
                  outputText.startsWith("❌") ? (
                    <p className="text-red-500 whitespace-pre-wrap break-words">
                      {outputText}
                    </p>
                  ) : (
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                      {outputText}
                    </pre>
                  )
                ) : (
                  <p className="text-gray-400">Converted output will appear here</p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleConvert} disabled={!selectedConverter}>
              Convert
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="w-4 h-4 mr-1" /> Clear
            </Button>
            {outputText && !outputText.startsWith("❌") && (
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
                  .filter(Boolean)
                  .map((kw, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200 shadow-sm hover:bg-purple-200 transition">
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