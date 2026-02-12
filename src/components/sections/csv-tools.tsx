"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Settings,
    Palette,
} from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

export function CsvTools() {
    const [selectedTool, setSelectedTool] = useState<string>("")
    const [inputText, setInputText] = useState<string>("")
    const [outputText, setOutputText] = useState<string>("")

    const converterOptions: SidebarOption[] = [
        { id: "csv-viewer", label: "CSV Viewer", icon: FileText, description: "View CSV data in a readable tabular format." },
        { id: "csv-to-xml-json", label: "CSV to XML/JSON", icon: FileText, description: "Convert CSV files into both XML and JSON formats." },
        { id: "csv-to-xml", label: "CSV to XML", icon: FileText, description: "Transform CSV data into structured XML format." },
        { id: "csv-to-json", label: "CSV to JSON", icon: FileText, description: "Convert CSV data into JSON objects for easy processing." },
        { id: "csv-to-html", label: "CSV to HTML", icon: FileText, description: "Convert CSV data into an HTML table format." },
        { id: "csv-to-tsv", label: "CSV to TSV", icon: FileText, description: "Transform CSV files into TSV (tab-separated values) format." },
        { id: "csv-to-multiline-data", label: "CSV to MULTILINE DATA", icon: FileText, description: "Convert CSV rows into multiline text or data format." },
        { id: "csv-to-sql", label: "CSV to SQL", icon: FileText, description: "Generate SQL insert statements from CSV data." },
        { id: "csv-to-excel", label: "CSV to Excel", icon: FileText, description: "Convert CSV files into Excel (.xlsx) format." }
    ]

    const footerOptions: SidebarOption[] = [
        { id: "settings", label: "Settings", icon: Settings }
    ]

    const selectedOption = converterOptions.find(opt => opt.id === selectedTool)

    const handleConvert = () => {
        try {
            const parsed = Papa.parse(inputText, { header: true, skipEmptyLines: true })
            let result = ""

            switch (selectedTool) {
                case "csv-viewer":
                    result = JSON.stringify(parsed.data, null, 2)
                    break
                case "csv-to-json":
                    result = JSON.stringify(parsed.data, null, 2)
                    break
                case "csv-to-xml":
                    result = (parsed.data as any[]).map((row: any) => {
                        return "<row>" + Object.entries(row).map(([key, val]) => `<${key}>${val}</${key}>`).join("") + "</row>"
                    }).join("\n")
                    break
                case "csv-to-xml-json":
                    const xml = (parsed.data as any[]).map((row: any) => {
                        return "<row>" + Object.entries(row).map(([key, val]) => `<${key}>${val}</${key}>`).join("") + "</row>"
                    }).join("\n")
                    const json = JSON.stringify(parsed.data, null, 2)
                    result = `--- JSON ---\n${json}\n\n--- XML ---\n${xml}`
                    break
                case "csv-to-html":
                    result = "<table border='1'><tr>" +
                        Object.keys((parsed.data as any[])[0]).map((k: string) => `<th>${k}</th>`).join("") +
                        "</tr>" +
                        (parsed.data as any[]).map((row: any) => "<tr>" + Object.values(row).map((v: any) => `<td>${v}</td>`).join("") + "</tr>").join("") +
                        "</table>"
                    break
                case "csv-to-tsv":
                    result = Papa.unparse(parsed.data, { delimiter: "\t" })
                    break
                case "csv-to-multiline-data":
                    result = (parsed.data as any[]).map((row: any) => Object.values(row).join("\n")).join("\n\n")
                    break
                case "csv-to-sql":
                    const tableName = "my_table"
                    result = (parsed.data as any[]).map((row: any) => {
                        const cols = Object.keys(row).join(", ")
                        const vals = Object.values(row).map((v: any) => `'${v}'`).join(", ")
                        return `INSERT INTO ${tableName} (${cols}) VALUES (${vals});`
                    }).join("\n")
                    break
                case "csv-to-excel":
                    const ws = XLSX.utils.json_to_sheet(parsed.data)
                    const wb = XLSX.utils.book_new()
                    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
                    XLSX.writeFile(wb, "output.xlsx")
                    result = "Excel file saved as output.xlsx"
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
            title="CSV Tools"
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
                            <label className="text-sm font-medium mb-2 block">Input CSV</label>
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
                        <Button onClick={handleConvert}>Convert</Button>
                        <Button variant="outline" onClick={handleClear}>Clear</Button>
                    </div>
                </div>
            </SidebarContentWrapper>
        </ReusableSidebar>
    )
}
