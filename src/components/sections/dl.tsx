"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Upload, Download, Settings, Palette, FileText } from "lucide-react"
import { PageTitle } from "./title"

/* -----------------------------
   IMAGE CONVERTER ENGINE
--------------------------------*/

const convertImage = async (
    file: File,
    targetFormat: string,
    quality: number,
    width?: number,
    height?: number
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement("canvas")
                const finalWidth = width || img.width
                const finalHeight = height || img.height
                canvas.width = finalWidth
                canvas.height = finalHeight
                const ctx = canvas.getContext("2d")
                if (!ctx) return reject(new Error("Canvas error"))
                ctx.drawImage(img, 0, 0, finalWidth, finalHeight)

                let mime = "image/png"
                switch (targetFormat) {
                    case "jpg":
                    case "jpeg":
                        mime = "image/jpeg"
                        break
                    case "webp":
                        mime = "image/webp"
                        break
                    case "bmp":
                        mime = "image/bmp"
                        break
                    case "gif":
                        mime = "image/gif"
                        break
                }
                resolve(canvas.toDataURL(mime, quality))
            }
            img.onerror = () => reject(new Error("Image load failed"))
            img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
    })
}

/* -----------------------------
   STATIC TOOLS LIST (matches dataType shape)
--------------------------------*/

const toolCategories = [
    "IP Tools",
    "Formatters & Beautifiers",
    "Image Converter Tools",
    "Finance Tools",
    "TSV Tools",
    "JSON Tools",
    "XML Tools",
    "YAML Tools",
    "HTML Tools",
    "CSS Tools",
    "Javascript Tools",
    "CSV Tools",
    "SQL Tools",
    "Color Tools",
    "Unit Tools",
    "Number Tools",
    "String Tools",
    "Base64 Tools",
    "Random Tools",
    "Minifiers",
    "Validators",
    "Cryptography",
    "Escape Unescape Tools",
    "UTF Tools",
    "Compress Decompress",
    "HTML Generators",
    "CSS Generators",
    "Other Tools",
    "Text Style Tools",
    "CSS Unit Converter Tools",
    "POJO Tools",
    "Twitter Tools",
    "Random Generators",
]

// Create options that mimic the DB structure
const toolsData = toolCategories.map((name, idx) => ({
    id: idx + 1, // simulate DB id
    route: name.toLowerCase().replace(/\s+/g, "-"),
    urlName: name,
    des: `Work with ${name}. More features coming soon.`,
    keyword: name.split(" ").join(","),
    // for SidebarOption compatibility, we'll also keep label/description
    label: name,
    description: `Work with ${name}. More features coming soon.`,
    icon: name.includes("Image") ? Palette : FileText,
}))

// For ReusableSidebar, we need SidebarOption[] (with id, label, description, keyword, icon)
const sidebarOptions: SidebarOption[] = toolsData.map(t => ({
    id: t.route!,
    label: t.urlName,
    description: t.des,
    keyword: t.keyword,
    icon: t.icon,
}))

/* -----------------------------
   MAIN COMPONENT
--------------------------------*/

export default function DL() {
    const [selectedTool, setSelectedTool] = useState(sidebarOptions[0].id)
    const [inputFile, setInputFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [outputUrl, setOutputUrl] = useState<string>("")
    const [isConverting, setIsConverting] = useState(false)
    const [quality, setQuality] = useState(0.92)
    const [width, setWidth] = useState<number>()
    const [height, setHeight] = useState<number>()
    const [targetFormat, setTargetFormat] = useState("png")

    // Find the full data object (including des, urlName) for the selected tool
    const selectedData = toolsData.find(t => t.route === selectedTool) || toolsData[0]

    // Handlers
    const handleFile = (file: File | null) => {
        setInputFile(file)
        setOutputUrl("")
        if (file) {
            setPreviewUrl(URL.createObjectURL(file))
        } else {
            setPreviewUrl("")
        }
    }

    const handleConvert = async () => {
        if (!inputFile) return alert("Upload a file first")
        setIsConverting(true)
        try {
            const result = await convertImage(inputFile, targetFormat, quality, width, height)
            setOutputUrl(result)
        } catch (err: any) {
            alert(err.message)
        }
        setIsConverting(false)
    }

    const downloadFile = () => {
        if (!outputUrl) return
        const link = document.createElement("a")
        link.href = outputUrl
        link.download = `converted.${targetFormat}`
        link.click()
    }

    const resetAll = () => {
        setInputFile(null)
        setPreviewUrl("")
        setOutputUrl("")
        setWidth(undefined)
        setHeight(undefined)
    }

    const isImageConverter = selectedTool === "image-converter-tools"

    return (
        <ReusableSidebar
            title="All Tools"
            icon={Palette}
            options={sidebarOptions}
            selectedOption={selectedTool}
            onOptionSelect={(id) => setSelectedTool(id.toString())}
            footerOptions={[{ id: "settings", label: "Settings", icon: Settings }]}
        >
            <SidebarContentWrapper selectedOption={selectedData as any}>
                <div className="space-y-6">
                    <PageTitle selectedData={selectedData} />

                    {isImageConverter ? (
                        /* ----- Image Converter UI ----- */
                        <>
                            {/* Upload Section */}
                            <div className="border-2 border-dashed p-6 rounded-xl text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFile(e.target.files?.[0] || null)}
                                />
                                {inputFile && (
                                    <p className="text-sm mt-2 text-muted-foreground">
                                        {inputFile.name}
                                    </p>
                                )}
                            </div>

                            {/* Format, Resize & Quality Controls */}
                            <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Output Format</label>
                                    <select
                                        value={targetFormat}
                                        onChange={(e) => setTargetFormat(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    >
                                        <option value="png">PNG</option>
                                        <option value="jpg">JPEG</option>
                                        <option value="webp">WebP</option>
                                        <option value="bmp">BMP</option>
                                        <option value="gif">GIF</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Width (px)</label>
                                    <input
                                        type="number"
                                        placeholder="auto"
                                        className="border p-2 rounded w-full"
                                        onChange={(e) => setWidth(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Height (px)</label>
                                    <input
                                        type="number"
                                        placeholder="auto"
                                        className="border p-2 rounded w-full"
                                        onChange={(e) => setHeight(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quality (0-1)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="1"
                                        value={quality}
                                        onChange={(e) => setQuality(Number(e.target.value))}
                                        className="border p-2 rounded w-full"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="border rounded-xl p-4 min-h-[200px] flex justify-center items-center">
                                {outputUrl ? (
                                    <img src={outputUrl} className="max-h-72 rounded-xl" />
                                ) : previewUrl ? (
                                    <img src={previewUrl} className="max-h-72 opacity-50" />
                                ) : (
                                    <p>No image selected</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 flex-wrap">
                                <Button onClick={handleConvert} disabled={!inputFile || isConverting}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isConverting ? "Converting..." : "Convert"}
                                </Button>
                                {outputUrl && (
                                    <>
                                        <Button variant="secondary" onClick={downloadFile}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button variant="outline" onClick={resetAll}>
                                            Clear
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* ----- Placeholder for other tools ----- */
                        <div className="border rounded-xl p-12 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">{selectedData.urlName}</h3>
                            <p>This tool is under construction. Check back soon!</p>
                        </div>
                    )}

                    {/* Details section (always visible) */}
                    <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                        <h3 className="font-semibold text-lg">Tool Details</h3>
                        <p>{selectedData.des}</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedData.keyword?.split(",").map((k, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                >
                                    {k.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </SidebarContentWrapper>
        </ReusableSidebar>
    )
}