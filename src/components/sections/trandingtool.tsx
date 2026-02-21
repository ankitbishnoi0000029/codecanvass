"use client"

import { useEffect, useState, useMemo } from "react"
import {
    ReusableSidebar,
    SidebarContentWrapper,
    SidebarOption,
} from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Settings, Palette } from "lucide-react"
import { PageTitle } from "./title"
import { getTableData } from "@/actions/dbAction"
import { dataType } from "@/utils/types/uiTypes"
import { useRouter, usePathname } from "next/navigation"
import Meta from "./meta"

export function Trandingtool() {
    const router = useRouter()
    const pathname = usePathname()

    const [selectedTool, setSelectedTool] = useState<string>("")
    const [inputValue, setInputValue] = useState("")
    const [secondValue, setSecondValue] = useState("")
    const [output, setOutput] = useState("")

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [asciiWidth, setAsciiWidth] = useState(120)
    const [asciiOutput, setAsciiOutput] = useState("")
    const [loading, setLoading] = useState(false)

    const [list, setList] = useState<dataType[]>([])

    // ==============================
    // Fetch DB Tools
    // ==============================
    useEffect(() => {
        const fetchData = async () => {
            const data = (await getTableData("trendingtools")) as dataType[]
            setList(Array.isArray(data) ? data : [])
        }
        fetchData()
    }, [])

    // ==============================
    // Extract Slug From Route
    // ==============================
    const getSlug = (route: string) => {
        if (!route) return ""
        return route.split("/").pop() || ""
    }

    useEffect(() => {
        const slug = pathname.split("/").pop() ?? ""
        setSelectedTool(slug)
    }, [pathname])

    // ==============================
    // Convert DB → Sidebar Options
    // ==============================
    const tools: SidebarOption[] = useMemo(() => {
        return list.map((item) => ({
            id: getSlug(item.route || ""),
            label: item.urlName,
            description: item.des,
            keyword: item.keyword,
            icon: Palette,
        }))
    }, [list])

    const footerOptions: SidebarOption[] = [
        { id: "settings", label: "Settings", icon: Settings },
    ]

    const selectedOption =
        tools.find((opt) => opt.id === selectedTool) || null

    // ==============================
    // Handle Sidebar Navigation
    // ==============================
    const handleToolChange = (slug: string) => {
        setSelectedTool(slug)
        router.replace(`/trendingtool/${slug}`)
    }

    // ==============================
    // ASCII Converter
    // ==============================
    const convertImageToAscii = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                const img = new Image()

                img.onload = () => {
                    const canvas = document.createElement("canvas")
                    const ctx = canvas.getContext("2d")
                    if (!ctx) return reject("Canvas not supported")

                    const ratio = img.height / img.width
                    canvas.width = asciiWidth
                    canvas.height = asciiWidth * ratio * 0.55

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                    const { data } = ctx.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    )

                    const chars = "@#S%?*+;:,. "
                    let result = ""

                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const i = (y * canvas.width + x) * 4
                            const r = data[i]
                            const g = data[i + 1]
                            const b = data[i + 2]

                            const brightness =
                                0.299 * r + 0.587 * g + 0.114 * b

                            const index = Math.floor(
                                (brightness / 255) * (chars.length - 1)
                            )

                            result += chars[index]
                        }
                        result += "\n"
                    }

                    resolve(result)
                }

                img.src = e.target?.result as string
            }

            reader.readAsDataURL(file)
        })
    }

    // ==============================
    // Tool Logic
    // ==============================
    const handleConvert = async () => {
        setOutput("")
        setAsciiOutput("")

        switch (selectedTool) {
            case "number-utilities":
                const a = parseInt(inputValue || "0")
                const b = parseInt(secondValue || "0")
                setOutput(`AND: ${a & b}
OR: ${a | b}
XOR: ${a ^ b}`)
                break

            case "html-stripper":
                setOutput(inputValue.replace(/<[^>]*>?/gm, ""))
                break

            case "lua-minifier":
                setOutput(inputValue.replace(/\s+/g, " "))
                break

            case "lua-beautifier":
                setOutput(inputValue.replace(/;/g, ";\n"))
                break

            case "hash-tools":
                const buffer = await crypto.subtle.digest(
                    "SHA-256",
                    new TextEncoder().encode(inputValue)
                )
                const hash = Array.from(new Uint8Array(buffer))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("")
                setOutput(hash)
                break

            case "image-to-ascii-art":
                if (!imageFile) return
                setLoading(true)
                const ascii = await convertImageToAscii(imageFile)
                setAsciiOutput(ascii)
                setLoading(false)
                break

            default:
                setOutput("Tool not implemented yet")
        }
    }

    const downloadAscii = () => {
        if (!asciiOutput) return
        const blob = new Blob([asciiOutput], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "ascii-art.txt"
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <ReusableSidebar
            title="Trending Tools"
            icon={Palette}
            options={tools}
            selectedOption={selectedTool}
            onOptionSelect={handleToolChange}
            footerOptions={footerOptions}
        >
            <SidebarContentWrapper selectedOption={selectedOption || undefined}>
                <div className="space-y-6">
                    <PageTitle selectedData={selectedOption || undefined} />

                    {/* ASCII TOOL */}
                    {selectedTool === "image-to-ascii-art" && (
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setImageFile(e.target.files?.[0] || null)
                                }
                                className="border p-2 rounded"
                            />

                            <input
                                type="number"
                                value={asciiWidth}
                                onChange={(e) =>
                                    setAsciiWidth(Number(e.target.value))
                                }
                                className="border p-2 rounded w-32"
                            />

                            <Button onClick={handleConvert}>
                                {loading ? "Converting..." : "Convert"}
                            </Button>

                            {asciiOutput && (
                                <>
                                    <Button onClick={downloadAscii}>
                                        Download TXT
                                    </Button>

                                    <pre className="bg-black text-green-400 p-4 rounded overflow-auto text-xs whitespace-pre">
                                        {asciiOutput}
                                    </pre>
                                </>
                            )}
                        </div>
                    )}

                    {/* OTHER TOOLS */}
                    {selectedTool !== "image-to-ascii-art" && (
                        <>
                            <textarea
                                className="w-full border p-3 rounded min-h-[120px]"
                                value={inputValue}
                                onChange={(e) =>
                                    setInputValue(e.target.value)
                                }
                            />

                            {selectedTool === "number-utilities" && (
                                <input
                                    type="number"
                                    placeholder="Second number"
                                    className="w-full border p-3 rounded"
                                    value={secondValue}
                                    onChange={(e) =>
                                        setSecondValue(e.target.value)
                                    }
                                />
                            )}

                            <Button onClick={handleConvert}>
                                Generate
                            </Button>

                            {output && (
                                <div className="border rounded p-4 bg-gray-50 whitespace-pre-wrap">
                                    {output}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {selectedOption && (
                    <Meta selectedData={selectedOption} />
                )}
            </SidebarContentWrapper>
        </ReusableSidebar>
    )
}
