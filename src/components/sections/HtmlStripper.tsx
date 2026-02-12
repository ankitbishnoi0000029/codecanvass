
"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Code,
    File,
    Settings,
    Download,
    Upload,
    Palette
} from "lucide-react"
import Image from "next/image"
import { base64ToImage, stripHTML } from "@/utils/utils"

export function HtmlConverters() {
    const [selectedConverter, setSelectedConverter] = useState("")
    const [img, setImg] = useState('')

    const converterOptions: SidebarOption[] = [
      
     {
    id: "html-stripper",
    label: "HTML Stripper",
    icon: FileText,
    description: "Remove all HTML tags from content to get plain text."
  },
  {
    id: "html-table-generator",
    label: "HTML Table Generator",
    icon: FileText,
    description: "Create HTML tables from structured data or text inputs."
  },
  {
    id: "html-to-csv",
    label: "HTML to CSV Converter",
    icon: FileText,
    description: "Convert HTML tables into CSV format for spreadsheets."
  },
  {
    id: "html-to-tsv",
    label: "HTML to TSV Converter",
    icon: FileText,
    description: "Convert HTML tables into TSV (tab-separated values) format."
  },
  {
    id: "html-to-php",
    label: "HTML to PHP Converter",
    icon: FileText,
    description: "Convert HTML code into PHP echo statements or templates."
  },
  {
    id: "html-to-json",
    label: "HTML to JSON",
    icon: FileText,
    description: "Transform HTML table data into JSON format."
  },
  {
    id: "html-to-xml",
    label: "HTML to XML",
    icon: FileText,
    description: "Convert HTML content into well-formed XML documents."
  },
  {
    id: "html-to-yaml",
    label: "HTML to YAML",
    icon: FileText,
    description: "Convert HTML structured data into readable YAML format."
  },
  {
    id: "html-to-text",
    label: "HTML to Text",
    icon: FileText,
    description: "Extract plain text from HTML content."
  },
  {
    id: "text-to-html-entities",
    label: "Text to HTML Entities",
    icon: FileText,
    description: "Convert special characters in text into HTML entities."
  },
  {
    id: "html-entities-to-text",
    label: "HTML Entities to Text",
    icon: FileText,
    description: "Decode HTML entities back into readable text."
  },
  {
    id: "html-to-markdown",
    label: "HTML to Markdown",
    icon: FileText,
    description: "Convert HTML content into Markdown format for documentation."
  },
  {
    id: "markdown-to-html",
    label: "Markdown to HTML",
    icon: FileText,
    description: "Convert Markdown text into HTML content."
  },
  {
    id: "pug-to-html",
    label: "PUG to HTML Converter",
    icon: FileText,
    description: "Convert PUG (formerly Jade) templates into HTML code."
  },
  {
    id: "html-to-pug",
    label: "HTML to PUG Converter",
    icon: FileText,
    description: "Transform HTML code into PUG (Jade) template syntax."
  },
  {
    id: "jade-to-html",
    label: "JADE to HTML Converter",
    icon: FileText,
    description: "Convert JADE templates into standard HTML code."
  },
  {
    id: "html-to-jade",
    label: "HTML to JADE Converter",
    icon: FileText,
    description: "Transform HTML content into JADE template syntax."
  },
  {
    id: "html-to-bbcode",
    label: "HTML to BBCode Converter",
    icon: FileText,
    description: "Convert HTML formatting into BBCode for forums and posts."
  },
  {
    id: "bbcode-to-html",
    label: "BBCode to HTML Converter",
    icon: FileText,
    description: "Convert BBCode content back into HTML format."
  }
    ]

    const footerOptions: SidebarOption[] = [
        {
            id: "settings",
            label: "Settings",
            icon: Settings
        }
    ]

    const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

   const handleConvert = () => {
    setSelectedConverter(stripHTML(selectedConverter));
  };
    console.log(img)
    return (
        <ReusableSidebar
            title="Converter Tools"
            icon={Palette}
            options={converterOptions}
            selectedOption={selectedConverter}
            onOptionSelect={setSelectedConverter}
            footerOptions={footerOptions}
        >
            <SidebarContentWrapper selectedOption={selectedOption}>
                <div className=" mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                            {selectedOption?.label}
                        </h2>
                        <p className="text-muted-foreground">
                            {selectedOption?.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Input</label>
                                <textarea value={selectedConverter} onChange={(e) => setSelectedConverter(e.target.value)} className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full" rows={5} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Output</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    {img ? (
                                        <>
                                            <Download className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-500">Converted files will appear here</p>
                                        </>
                                    ) : (
                                        <Image src={img} width={50} height={50} alt="Converted Image" />
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button onClick={handleConvert} >Convert</Button>
                        <Button variant="outline">Clear</Button>
                    </div>
                </div>
            </SidebarContentWrapper>
        </ReusableSidebar>
    );
}