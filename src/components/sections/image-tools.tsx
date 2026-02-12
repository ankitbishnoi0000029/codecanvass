"use client"

import { useState, useEffect } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Upload, Download, Settings, Palette } from "lucide-react"
import { getTableData } from "@/actions/dbAction"
import { dataType } from "@/utils/types/uiTypes"

export function ImageTools() {
  const [selectedTool, setSelectedTool] = useState<number | null>(null)
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [outputUrl, setOutputUrl] = useState("")
  const [list, setList] = useState<dataType[]>([])

  // Fetch SQL Tools
  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("image_tools") as dataType[]
      setList(categoriesData)
    }
    fetchData()
  }, [])

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  // Find selected object from DB list
  const selectedOption = list.find((opt) => opt.id === selectedTool) || null

  const handleToolChange = (optionId: string | number) => {
    setSelectedTool(Number(optionId))
    setInputFile(null)
    setOutputUrl("")
  }

  const handleConvert = () => {
    if (!inputFile) {
      alert("Please select a file first.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => setOutputUrl(e.target?.result as string)
    reader.readAsDataURL(inputFile)
  }

  const handleDownload = () => {
    if (!outputUrl) return

    const link = document.createElement("a")
    link.href = outputUrl
    link.download = `${selectedOption?.urlName || "converted"}.png`
    link.click()
  }

  return (
    <ReusableSidebar
      title="Image Tools"
      icon={Palette}
      options={list.map((item) => ({
        id: item.id.toString(),
        label: item.urlName,
        icon: Palette
      }))}
      selectedOption={selectedTool?.toString() || ""}
      onOptionSelect={handleToolChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption as any}>
        {!!selectedOption && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold">{selectedOption.urlName}</h2>
              <p className="text-muted-foreground">{selectedOption.des}</p>
            </div>

            {/* Upload + Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setInputFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="text-sm font-medium mb-2 block">Preview / Output</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {outputUrl ? (
                    <img src={outputUrl} alt="Preview" className="mx-auto max-h-60 rounded-lg" />
                  ) : (
                    <p className="text-muted-foreground">No output yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleConvert}>
                <Upload className="h-4 w-4 mr-2" /> Convert
              </Button>

              {outputUrl && (
                <Button variant="secondary" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              )}
            </div>
          </div>
        )}
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

export default ImageTools
