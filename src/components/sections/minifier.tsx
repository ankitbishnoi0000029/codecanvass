"use client"

import { useEffect, useState } from "react"
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Settings, Palette, FileText } from "lucide-react"
import { PageTitle } from "./title"
import Meta from "./meta"
import { getTableData } from "@/actions/dbAction"
import { dataType } from "@/utils/types/uiTypes"
import { useRouter, usePathname } from "next/navigation"

export function Minifier() {
  const [converterOptions, setConverterOptions] = useState<SidebarOption[]>([])
  const [rawData, setRawData] = useState<dataType[]>([])
  const [selectedTool, setSelectedTool] = useState<string>("")
  const [inputText, setInputText] = useState<string>("")
  const [outputText, setOutputText] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const router = useRouter()
  const pathname = usePathname()

  /* ---------------- FETCH DB DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = (await getTableData("minifier")) as dataType[]
        setRawData(data)

        const formatted: SidebarOption[] = data.map((item) => ({
          id: item.route || "", // ensure string
          label: item.urlName,
          description: item.des,
          icon: FileText,
          keyword: item.keyword,
        }))

        setConverterOptions(formatted)
      } catch (error) {
        console.error("Error fetching minifier data:", error)
      }
    }

    fetchData()
  }, [])

  /* ---------------- GET SLUG FROM URL ---------------- */
  useEffect(() => {
    if (!pathname) return

    const segments = pathname.split("/").filter(Boolean)
    const slug = segments[segments.length - 1] || ""
    setSelectedTool(slug)
  }, [pathname])

  /* ---------------- FOOTER ---------------- */
  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const selectedOption = converterOptions.find(
    (opt) => opt.id === selectedTool
  )

  /* ---------------- HANDLE SIDEBAR CHANGE ---------------- */
  const handleConverterChange = (converterId: string) => {
    setSelectedTool(converterId)
    router.push(`/minifier/${converterId}`)
  }

  /* ---------------- MINIFY LOGIC ---------------- */
  const handleMinify = async () => {
    if (!inputText) return

    try {
      setLoading(true)
      let result = inputText

      switch (selectedTool) {
        case "json-minify":
          result = JSON.stringify(JSON.parse(inputText))
          break

        case "xml-minify":
          result = inputText.replace(/\s*(<[^>]+>)\s*/g, "$1")
          break

        case "js-minify": {
          const { minify } = await import("terser")
          const minified = await minify(inputText)
          result = minified.code || ""
          break
        }

        case "lua-minifier":
        case "text-minifier":
          result = inputText.replace(/\s+/g, " ").trim()
          break

        default:
          result = inputText
      }

      setOutputText(result)
    } catch (err) {
      setOutputText("Error: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- CLEAR ---------------- */
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
      onOptionSelect={handleConverterChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <PageTitle selectedData={selectedOption} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* INPUT */}
            <div className="space-y-4">
              <label className="text-sm font-medium block">
                Input
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full"
                rows={10}
              />
            </div>

            {/* OUTPUT */}
            <div className="space-y-4">
              <label className="text-sm font-medium block">
                Output
              </label>
              <textarea
                value={outputText}
                readOnly
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full bg-gray-50"
                rows={10}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex gap-2">
            <Button onClick={handleMinify} disabled={loading}>
              {loading ? "Processing..." : "Minify"}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {selectedOption && <Meta selectedData={selectedOption} />}
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
