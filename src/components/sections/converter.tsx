"use client"

import { useState, useEffect } from "react"
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Code,
  Calendar,
  FileSpreadsheet,
  FileJson,
  FileCode,
  FileType,
  Upload,
  Copy,
  RefreshCw,
  Table,
} from "lucide-react"
import { base64ToImage, imageFileToBase64 } from "@/utils/utils"
import * as XLSX from "xlsx"
import mammoth from "mammoth"

export function Converter() {
  const [selectedConverter, setSelectedConverter] = useState<string>("imageToBase64")
  const [input, setInput] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [date1, setDate1] = useState<string>("")
  const [date2, setDate2] = useState<string>("")

  const converterOptions: SidebarOption[] = [
    { id: "imageToBase64", label: "Image → Base64", icon: Code },
    { id: "base64ToImage", label: "Base64 → Image", icon: FileText },
    { id: "dateCalc", label: "Date Calculator", icon: Calendar },
    { id: "excelToHtml", label: "Excel → HTML", icon: FileSpreadsheet },
    { id: "excelToXml", label: "Excel → XML", icon: FileType },
    { id: "excelToJson", label: "Excel → JSON", icon: FileJson },
    { id: "opmlToJson", label: "OPML → JSON", icon: FileCode },
    { id: "wordToHtml", label: "Word → HTML", icon: FileText },
    { id: "tableizer", label: "Online Tableizer", icon: Table },
  ]

  // Reset everything on converter change
  useEffect(() => {
    setInput("")
    setOutput("")
    setDate1("")
    setDate2("")
    document.querySelectorAll('input[type="file"]').forEach((i) => {
      (i as HTMLInputElement).value = ""
    })
  }, [selectedConverter])

  const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

  const handleClear = () => {
    setInput("")
    setOutput("")
    setDate1("")
    setDate2("")
    document.querySelectorAll('input[type="file"]').forEach((i) => {
      (i as HTMLInputElement).value = ""
    })
  }

  // Base64 → Image
  const handleBase64ToImage = () => {
    try {
      const url = base64ToImage(input)
      setOutput(url)
    } catch {
      alert("Invalid Base64 string!")
    }
  }

  // Image → Base64
  const handleImageToBase64 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await imageFileToBase64(file)
    setOutput(base64)
  }

  // Date diff
  const handleDateDiff = () => {
    if (!date1 || !date2) return
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const days = Math.floor(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 3600 * 24))
    setOutput(`${days} day(s) difference`)
  }

  // Excel Upload Handler FIXED
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    let result = ""

    if (type === "json") {
      result = JSON.stringify(XLSX.utils.sheet_to_json(sheet), null, 2)
    }
    else if (type === "html") {
      result = XLSX.utils.sheet_to_html(sheet)
    }
    else if (type === "xml") {
      // FIX: sheet_to_xml DOES NOT EXIST
      result = `<xml>XML conversion not supported by XLSX utils</xml>`
    }

    setOutput(result)
  }

  // OPML → JSON
  const handleOpmlToJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const xml = new DOMParser().parseFromString(text, "text/xml")

    const parseNode = (node: any): any => {
      let obj: any = { name: node.nodeName, children: [] }
      if (node.attributes) {
        obj.attributes = {}
        for (const attr of node.attributes) {
          obj.attributes[attr.name] = attr.value
        }
      }
      for (const child of node.childNodes) {
        if (child.nodeType === 1) obj.children.push(parseNode(child))
      }
      return obj
    }

    const json = { root: parseNode(xml.documentElement) }
    setOutput(JSON.stringify(json, null, 2))
  }

  // Word → HTML
  const handleWordToHtml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const buffer = await file.arrayBuffer()
    const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer })
    setOutput(value)
  }

  // Tableizer CSV → HTML
  const handleTableizer = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const rows = text.split("\n").map(r => r.split(","))
    const html = `<table border="1" style="border-collapse:collapse;">${rows
      .map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`)
      .join("")}</table>`
    setOutput(html)
  }

  return (
    <ReusableSidebar
      title="Converter Tools"
      icon={FileType}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={setSelectedConverter}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto w-full max-w-4xl">

          <h2 className="text-2xl font-bold mb-2">{selectedOption?.label}</h2>

          {/* Base64 → Image */}
          {selectedConverter === "base64ToImage" && (
            <>
              <textarea
                className="border p-3 w-full h-60 rounded"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste Base64"
              />
              <div className="mt-3 flex gap-2">
                <Button onClick={handleBase64ToImage}>Convert</Button>
                <Button variant="outline" onClick={handleClear}>Clear</Button>
              </div>
              {output && <img src={output} className="mt-4 max-h-80 mx-auto" />}
            </>
          )}

          {/* Image → Base64 */}
          {selectedConverter === "imageToBase64" && (
            <>
              <input type="file" accept="image/*" onChange={handleImageToBase64} />
              {output && (
                <>
                  <textarea className="border p-3 w-full h-60 rounded mt-3" value={output} readOnly />
                  <Button className="mt-2" onClick={() => navigator.clipboard.writeText(output)}>
                    <Copy className="mr-2" /> Copy
                  </Button>
                </>
              )}
            </>
          )}

          {/* Date Calculator */}
          {selectedConverter === "dateCalc" && (
            <>
              <div className="flex gap-3">
                <input type="date" className="border p-2 rounded" value={date1} onChange={(e) => setDate1(e.target.value)} />
                <input type="date" className="border p-2 rounded" value={date2} onChange={(e) => setDate2(e.target.value)} />
                <Button onClick={handleDateDiff}><RefreshCw className="mr-2" /> Calculate</Button>
              </div>
              {output && <p className="mt-4">{output}</p>}
            </>
          )}

          {/* Excel */}
          {(selectedConverter === "excelToHtml" ||
            selectedConverter === "excelToXml" ||
            selectedConverter === "excelToJson") && (
              <>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) =>
                    handleExcelUpload(
                      e,
                      selectedConverter.replace("excelTo", "").toLowerCase()
                    )
                  }
                />
                {output && (
                  <textarea className="border p-3 w-full h-60 rounded mt-3" value={output} readOnly />
                )}
              </>
            )}

          {/* OPML */}
          {selectedConverter === "opmlToJson" && (
            <>
              <input type="file" accept=".opml,.xml" onChange={handleOpmlToJson} />
              {output && <textarea className="border p-3 w-full h-60 rounded mt-3" value={output} readOnly />}
            </>
          )}

          {/* Word → HTML */}
          {selectedConverter === "wordToHtml" && (
            <>
              <input type="file" accept=".docx" onChange={handleWordToHtml} />
              {output && (
                <div className="border p-3 rounded mt-3" dangerouslySetInnerHTML={{ __html: output }} />
              )}
            </>
          )}

          {/* Tableizer */}
          {selectedConverter === "tableizer" && (
            <>
              <input type="file" accept=".csv" onChange={handleTableizer} />
              {output && (
                <div className="border p-3 rounded mt-3" dangerouslySetInnerHTML={{ __html: output }} />
              )}
            </>
          )}

        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
