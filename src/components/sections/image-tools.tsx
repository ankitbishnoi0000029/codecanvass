"use client"

import { useState, useEffect } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Upload, Download, Settings, Palette } from "lucide-react"
import { getTableData } from "@/actions/dbAction"
import { dataType } from "@/utils/types/uiTypes"
import { PageTitle } from "./title"
import { usePathname, useRouter } from "next/navigation"

// Helper function to convert image formats
const convertImageFormat = async (file: File, targetFormat: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        let mimeType = 'image/png';
        switch (targetFormat) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'png':
            mimeType = 'image/png';
            break;
          case 'bmp':
            mimeType = 'image/bmp';
            break;
          case 'gif':
            mimeType = 'image/gif';
            break;
          default:
            mimeType = 'image/png';
        }

        if (mimeType === 'image/jpeg') {
          resolve(canvas.toDataURL(mimeType, 0.92));
        } else {
          resolve(canvas.toDataURL(mimeType));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// GIF Splitter functionality
const splitGIF = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve([e.target?.result as string]);
    };
    reader.onerror = () => reject(new Error('Failed to read GIF file'));
    reader.readAsDataURL(file);
  });
};

export function ImageTools() {
  const [selectedTool, setSelectedTool] = useState<string>("")
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | string[]>("")
  const [isConverting, setIsConverting] = useState(false)
  const [list, setList] = useState<dataType[]>([])
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const router = useRouter();
  const pathname = usePathname()

  // ✅ FIXED: Single effect — fetch data first, then sync selected tool from URL
  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("image_tools") as dataType[]
      setList(categoriesData)

      // Read current slug from URL
      const slug = pathname.split('/').pop() ?? '';

      if (slug) {
        // ✅ Try to match the URL slug to a route in the fetched list
        const matchedItem = categoriesData.find(
          (item) => item.route === slug || item.id.toString() === slug
        );

        if (matchedItem) {
          // ✅ URL matches a valid tool — select it
          setSelectedTool(matchedItem.route ?? matchedItem.id.toString());
        } else if (categoriesData.length > 0) {
          // ✅ No match — fall back to first item and redirect
          const firstRoute = categoriesData[0].route ?? categoriesData[0].id.toString();
          setSelectedTool(firstRoute);
          router.replace(firstRoute);
        }
      } else if (categoriesData.length > 0) {
        // ✅ No slug in URL — default to first item
        const firstRoute = categoriesData[0].route ?? categoriesData[0].id.toString();
        setSelectedTool(firstRoute);
        router.replace(firstRoute);
      }
    }

    fetchData()
  }, [pathname]) // ✅ Re-run when pathname changes so browser back/forward works

  const converterOptions: SidebarOption[] =
    list?.map((item) => ({
      id: item.route ?? item.id.toString(),
      label: item.urlName,
      description: item.des,
      keyword: item.keyword,
      icon: Palette,
    })) || [];

  // Find selected object from DB list
  const selectedOption = list.find((opt) =>
    (opt.route && opt.route === selectedTool) || opt.id.toString() === selectedTool
  ) || null

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleToolChange = (optionId: string | number) => {
    const id = optionId.toString()
    setSelectedTool(id)
    setInputFile(null)
    setOutputUrl("")
    setPreviewUrl("")
    router.push(`${id}`)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setInputFile(file)
    setOutputUrl("")

    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl("")
    }
  }

  const handleConvert = async () => {
    if (!inputFile) {
      alert("Please select a file first.")
      return
    }

    setIsConverting(true)

    try {
      const toolName = selectedOption?.urlName?.toLowerCase() || ""

      if (toolName.includes("jpg to png")) {
        const result = await convertImageFormat(inputFile, 'png')
        setOutputUrl(result)
      } else if (toolName.includes("png to jpg") || toolName.includes("png to jpeg")) {
        const result = await convertImageFormat(inputFile, 'jpg')
        setOutputUrl(result)
      } else if (toolName.includes("bmp to png")) {
        const result = await convertImageFormat(inputFile, 'png')
        setOutputUrl(result)
      } else if (toolName.includes("gif splitter")) {
        const frames = await splitGIF(inputFile)
        setOutputUrl(frames)
      } else if (toolName.includes("gif viewer")) {
        const reader = new FileReader()
        reader.onload = (e) => setOutputUrl(e.target?.result as string)
        reader.readAsDataURL(inputFile)
      } else {
        const result = await convertImageFormat(inputFile, 'png')
        setOutputUrl(result)
      }
    } catch (error: any) {
      alert(`Conversion failed: ${error.message}`)
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (!outputUrl) return

    if (Array.isArray(outputUrl)) {
      outputUrl.forEach((url, index) => {
        const link = document.createElement("a")
        link.href = url
        link.download = `${selectedOption?.urlName || "frame"}_${index + 1}.png`
        link.click()
      })
    } else {
      const link = document.createElement("a")
      link.href = outputUrl

      let ext = 'png'
      const toolName = selectedOption?.urlName?.toLowerCase() || ""
      if (toolName.includes("jpg") || toolName.includes("jpeg")) ext = 'jpg'
      else if (toolName.includes("gif")) ext = 'gif'
      else if (toolName.includes("bmp")) ext = 'bmp'

      link.download = `${selectedOption?.urlName || "converted"}.${ext}`
      link.click()
    }
  }

  const handleClear = () => {
    setInputFile(null)
    setOutputUrl("")
    setPreviewUrl("")
  }

  return (
    <ReusableSidebar
      title="Image Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedTool}
      onOptionSelect={handleToolChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption as any}>
        {!!selectedOption && (
          <div className="space-y-6">
            {/* Header */}
            <PageTitle selectedData={selectedOption} />

            {/* Upload + Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  {inputFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {inputFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="text-sm font-medium mb-2 block">Preview / Output</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[200px] flex items-center justify-center">
                  {Array.isArray(outputUrl) ? (
                    <div className="grid grid-cols-2 gap-2">
                      {outputUrl.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Frame ${index + 1}`}
                          className="max-h-32 rounded-lg"
                        />
                      ))}
                    </div>
                  ) : outputUrl ? (
                    <img src={outputUrl} alt="Preview" className="mx-auto max-h-60 rounded-lg" />
                  ) : previewUrl ? (
                    <img src={previewUrl} alt="Original preview" className="mx-auto max-h-60 rounded-lg opacity-50" />
                  ) : (
                    <p className="text-muted-foreground">No output yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleConvert} disabled={!inputFile || isConverting}>
                <Upload className="h-4 w-4 mr-2" />
                {isConverting ? "Converting..." : "Convert"}
              </Button>

              {outputUrl && (
                <>
                  <Button variant="secondary" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </>
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

export default ImageTools